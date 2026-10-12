use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashSet};
use std::time::Instant;

use rand::Rng;
use index_core::{DocId, ScoredDoc, SQ8Vector};

/// Configuration parameters for HNSW index construction and query traversal.
#[derive(Clone, Copy, Debug, serde::Serialize, serde::Deserialize)]
pub struct HnswConfig {
    /// Maximum outgoing connections per node for layers > 0.
    pub m: usize,
    /// Maximum outgoing connections per node at ground layer 0.
    pub m0: usize,
    /// Size of dynamic candidate beam during construction.
    pub ef_construction: usize,
    /// Size of dynamic candidate beam during search.
    pub ef_search: usize,
    /// Level generation decay multiplier (1 / ln(m)).
    pub ml: f64,
}

impl Default for HnswConfig {
    fn default() -> Self {
        let m = 16;
        Self {
            m,
            m0: 32,
            ef_construction: 100,
            ef_search: 64,
            ml: 1.0 / (m as f64).ln(),
        }
    }
}

/// Execution metrics for HNSW vector traversal.
#[derive(Clone, Copy, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct HnswMetrics {
    pub upper_layer_hops: usize,
    pub layer0_evaluations: usize,
    pub latency_us: u64,
}

#[derive(Clone, Copy, PartialEq)]
struct DistNode {
    dist: f32,
    doc_id: DocId,
}

impl Eq for DistNode {}

impl Ord for DistNode {
    fn cmp(&self, other: &Self) -> Ordering {
        // Natural ordering: smaller distance is "Less"
        self.dist.partial_cmp(&other.dist).unwrap_or(Ordering::Equal)
    }
}

impl PartialOrd for DistNode {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// Inverted distance node for max-heaps (farthest node at root).
#[derive(Clone, Copy, PartialEq)]
struct FarthestNode(DistNode);

impl Eq for FarthestNode {}

impl Ord for FarthestNode {
    fn cmp(&self, other: &Self) -> Ordering {
        self.0.cmp(&other.0)
    }
}

impl PartialOrd for FarthestNode {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// Inverted distance node for min-heaps (closest node at root).
#[derive(Clone, Copy, PartialEq)]
struct NearestNode(DistNode);

impl Eq for NearestNode {}

impl Ord for NearestNode {
    fn cmp(&self, other: &Self) -> Ordering {
        other.0.cmp(&self.0)
    }
}

impl PartialOrd for NearestNode {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

/// Hierarchical Navigable Small World (HNSW) graph index with SQ8 vector quantization.
pub struct HnswIndex {
    pub config: HnswConfig,
    /// SQ8 Quantized vectors stored by DocID.
    pub vectors: Vec<SQ8Vector>,
    /// Multi-layer graph adjacency lists: layer -> (doc_id -> Vec<DocId>).
    pub layers: Vec<Vec<Vec<DocId>>>,
    /// Global entry point for search traversal.
    pub entry_point: Option<DocId>,
    /// Current maximum layer assigned in the graph.
    pub max_layer: usize,
}

impl HnswIndex {
    pub fn new(config: HnswConfig) -> Self {
        Self {
            config,
            vectors: Vec::new(),
            layers: Vec::new(),
            entry_point: None,
            max_layer: 0,
        }
    }

    /// Number of vectors indexed.
    pub fn len(&self) -> usize {
        self.vectors.len()
    }

    pub fn is_empty(&self) -> bool {
        self.vectors.is_empty()
    }

    /// Computes distance (1.0 - cosine_similarity) between query vector and a document's SQ8 vector.
    #[inline]
    fn query_dist(&self, query: &[f32], query_sum: f32, query_norm: f32, doc_id: DocId) -> f32 {
        let sq8 = &self.vectors[doc_id as usize];
        let sim = sq8.cosine_similarity_asymmetric(query, query_sum, query_norm);
        // Distance in range [0.0, 2.0]
        1.0 - sim
    }

    /// Distance between two documents' SQ8 vectors.
    #[inline]
    fn doc_dist(&self, a: DocId, b: DocId) -> f32 {
        let va = &self.vectors[a as usize];
        let vb = &self.vectors[b as usize];
        let dot = va.dot_product_symmetric(vb);
        let na = va.dot_product_symmetric(va).max(1e-12).sqrt();
        let nb = vb.dot_product_symmetric(vb).max(1e-12).sqrt();
        let sim = (dot / (na * nb)).clamp(-1.0, 1.0);
        1.0 - sim
    }

    /// Randomly samples a layer for a new node using exponential decay.
    fn sample_level(&self) -> usize {
        let mut rng = rand::thread_rng();
        let r: f64 = rng.gen_range(0.0000001..1.0);
        let level = (-r.ln() * self.config.ml).floor() as usize;
        level.min(16)
    }

    /// Inserts a vector with DocID into the HNSW graph.
    pub fn insert(&mut self, doc_id: DocId, raw_vector: &[f32]) {
        assert_eq!(doc_id as usize, self.vectors.len());
        let sq8 = SQ8Vector::quantize(raw_vector);
        self.vectors.push(sq8);

        let node_level = self.sample_level();

        // Ensure layers exist up to max(node_level, self.max_layer)
        let target_layers = self.max_layer.max(node_level) + 1;
        while self.layers.len() < target_layers {
            self.layers.push(Vec::new());
        }

        for l in 0..target_layers {
            let layer_vec = &mut self.layers[l];
            while layer_vec.len() <= doc_id as usize {
                layer_vec.push(Vec::new());
            }
        }

        let curr_ep = match self.entry_point {
            Some(ep) => ep,
            None => {
                // First node inserted becomes entry point
                self.entry_point = Some(doc_id);
                self.max_layer = node_level;
                return;
            }
        };

        let query_sum: f32 = raw_vector.iter().sum();
        let query_norm: f32 = raw_vector.iter().map(|x| x * x).sum::<f32>().sqrt();

        let mut curr_obj = curr_ep;
        let mut curr_dist = self.query_dist(raw_vector, query_sum, query_norm, curr_obj);

        // Step 1: Greedily descend from top layer down to node_level + 1
        for l in (node_level + 1..=self.max_layer).rev() {
            let mut changed = true;
            while changed {
                changed = false;
                for &neighbor in &self.layers[l][curr_obj as usize] {
                    let d = self.query_dist(raw_vector, query_sum, query_norm, neighbor);
                    if d < curr_dist {
                        curr_dist = d;
                        curr_obj = neighbor;
                        changed = true;
                    }
                }
            }
        }

        // Step 2: From min(self.max_layer, node_level) down to 0, search and connect neighbors
        let top_connect = self.max_layer.min(node_level);
        let mut ep_set = vec![curr_obj];

        for l in (0..=top_connect).rev() {
            let m_max = if l == 0 { self.config.m0 } else { self.config.m };

            // Find ef_construction nearest neighbors at layer l
            let candidates = self.search_layer(raw_vector, query_sum, query_norm, &ep_set, self.config.ef_construction, l);

            // Select neighbors using heuristic edge selection (enforcing diversity)
            let selected_neighbors = self.select_neighbors_heuristic(doc_id, &candidates, m_max);

            for &neighbor in &selected_neighbors {
                self.layers[l][doc_id as usize].push(neighbor);
                self.layers[l][neighbor as usize].push(doc_id);

                // If neighbor exceeds m_max connections, prune using heuristic
                if self.layers[l][neighbor as usize].len() > m_max {
                    let neighbor_candidates: Vec<DocId> = self.layers[l][neighbor as usize].clone();
                    let pruned = self.select_neighbors_heuristic(neighbor, &neighbor_candidates, m_max);
                    self.layers[l][neighbor as usize] = pruned;
                }
            }

            ep_set = candidates;
        }

        if node_level > self.max_layer {
            self.max_layer = node_level;
            self.entry_point = Some(doc_id);
        }
    }

    /// Beam search within a single layer.
    fn search_layer(
        &self,
        query: &[f32],
        query_sum: f32,
        query_norm: f32,
        entry_points: &[DocId],
        ef: usize,
        layer: usize,
    ) -> Vec<DocId> {
        let mut visited: HashSet<DocId> = HashSet::with_capacity(ef * 2);
        let mut candidates: BinaryHeap<NearestNode> = BinaryHeap::new(); // Min-heap (closest to query)
        let mut nearest: BinaryHeap<FarthestNode> = BinaryHeap::new();    // Max-heap (farthest of top-ef)

        for &ep in entry_points {
            let dist = self.query_dist(query, query_sum, query_norm, ep);
            visited.insert(ep);
            candidates.push(NearestNode(DistNode { dist, doc_id: ep }));
            nearest.push(FarthestNode(DistNode { dist, doc_id: ep }));
        }

        while let Some(NearestNode(curr)) = candidates.pop() {
            let farthest_dist = nearest.peek().unwrap().0.dist;
            if curr.dist > farthest_dist {
                break;
            }

            let neighbors = &self.layers[layer][curr.doc_id as usize];
            for &nbr in neighbors {
                if visited.insert(nbr) {
                    let d = self.query_dist(query, query_sum, query_norm, nbr);
                    let farthest_d = nearest.peek().unwrap().0.dist;

                    if d < farthest_d || nearest.len() < ef {
                        candidates.push(NearestNode(DistNode { dist: d, doc_id: nbr }));
                        nearest.push(FarthestNode(DistNode { dist: d, doc_id: nbr }));

                        if nearest.len() > ef {
                            nearest.pop();
                        }
                    }
                }
            }
        }

        nearest.into_iter().map(|node| node.0.doc_id).collect()
    }

    /// Heuristic edge selection (Algorithm 4 in Malkov & Yashunin).
    /// Enforces diversity: avoids clustering traps by checking that candidates are closer
    /// to the base node than to any already chosen neighbor.
    fn select_neighbors_heuristic(&self, base_node: DocId, candidates: &[DocId], m: usize) -> Vec<DocId> {
        if candidates.len() <= m {
            return candidates.to_vec();
        }

        // Sort candidates by distance to base_node
        let mut sorted_candidates: Vec<DistNode> = candidates
            .iter()
            .copied()
            .filter(|&c| c != base_node)
            .map(|c| DistNode {
                dist: self.doc_dist(base_node, c),
                doc_id: c,
            })
            .collect();

        sorted_candidates.sort();

        let mut selected: Vec<DocId> = Vec::with_capacity(m);

        for cand in &sorted_candidates {
            if selected.len() >= m {
                break;
            }

            // Diversity condition: cand must be closer to base_node than to any already chosen neighbor
            let mut keep = true;
            for &chosen in &selected {
                let dist_to_chosen = self.doc_dist(cand.doc_id, chosen);
                if dist_to_chosen < cand.dist {
                    keep = false;
                    break;
                }
            }

            if keep {
                selected.push(cand.doc_id);
            }
        }

        // If strict diversity picked fewer than m, fill up with remaining closest candidates
        if selected.len() < m {
            for cand in sorted_candidates {
                if !selected.contains(&cand.doc_id) {
                    selected.push(cand.doc_id);
                    if selected.len() >= m {
                        break;
                    }
                }
            }
        }

        selected
    }

    /// K-Nearest Neighbors search using greedy beam search across HNSW layers.
    pub fn search_knn(&self, query: &[f32], k: usize) -> (Vec<ScoredDoc>, HnswMetrics) {
        let start_time = Instant::now();
        let mut metrics = HnswMetrics::default();

        let ep = match self.entry_point {
            Some(ep) => ep,
            None => return (Vec::new(), metrics),
        };

        let query_sum: f32 = query.iter().sum();
        let query_norm: f32 = query.iter().map(|x| x * x).sum::<f32>().sqrt();

        let mut curr_obj = ep;
        let mut curr_dist = self.query_dist(query, query_sum, query_norm, curr_obj);

        // Step 1: Greedily hop down upper layers
        for l in (1..=self.max_layer).rev() {
            let mut changed = true;
            while changed {
                changed = false;
                metrics.upper_layer_hops += 1;
                for &neighbor in &self.layers[l][curr_obj as usize] {
                    let d = self.query_dist(query, query_sum, query_norm, neighbor);
                    if d < curr_dist {
                        curr_dist = d;
                        curr_obj = neighbor;
                        changed = true;
                    }
                }
            }
        }

        // Step 2: Layer 0 beam search
        let ef = self.config.ef_search.max(k);
        let mut visited: HashSet<DocId> = HashSet::with_capacity(ef * 2);
        let mut candidates: BinaryHeap<NearestNode> = BinaryHeap::new();
        let mut top_results: BinaryHeap<FarthestNode> = BinaryHeap::new();

        visited.insert(curr_obj);
        candidates.push(NearestNode(DistNode { dist: curr_dist, doc_id: curr_obj }));
        top_results.push(FarthestNode(DistNode { dist: curr_dist, doc_id: curr_obj }));

        while let Some(NearestNode(curr)) = candidates.pop() {
            metrics.layer0_evaluations += 1;
            let farthest_dist = top_results.peek().unwrap().0.dist;
            if curr.dist > farthest_dist {
                break;
            }

            for &nbr in &self.layers[0][curr.doc_id as usize] {
                if visited.insert(nbr) {
                    let d = self.query_dist(query, query_sum, query_norm, nbr);
                    let farthest_d = top_results.peek().unwrap().0.dist;

                    if d < farthest_d || top_results.len() < ef {
                        candidates.push(NearestNode(DistNode { dist: d, doc_id: nbr }));
                        top_results.push(FarthestNode(DistNode { dist: d, doc_id: nbr }));

                        if top_results.len() > ef {
                            top_results.pop();
                        }
                    }
                }
            }
        }

        // Convert distances to similarity scores (score = 1.0 - distance)
        let mut results: Vec<ScoredDoc> = top_results
            .into_iter()
            .map(|node| {
                let sim_score = (1.0 - node.0.dist).max(0.0);
                ScoredDoc::new(node.0.doc_id, sim_score)
            })
            .collect();

        // Sort descending by similarity score
        results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(Ordering::Equal));
        results.truncate(k);

        metrics.latency_us = start_time.elapsed().as_micros() as u64;

        (results, metrics)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::embedder::SemanticEmbedder;

    #[test]
    fn test_hnsw_construction_and_search() {
        let embedder = SemanticEmbedder::default();
        let config = HnswConfig {
            m: 8,
            m0: 16,
            ef_construction: 40,
            ef_search: 30,
            ml: 1.0 / (8.0f64).ln(),
        };

        let mut index = HnswIndex::new(config);

        let passages = [
            "Rust memory safety and SIMD performance",
            "Python deep learning with PyTorch and Transformers",
            "High-throughput vector search using HNSW graphs",
            "Reciprocal Rank Fusion hybrid retrieval engine",
            "Elias-Fano compressed bitsets and Block-Max WAND",
        ];

        for (i, p) in passages.iter().enumerate() {
            let vec = embedder.embed(p);
            index.insert(i as DocId, &vec);
        }

        assert_eq!(index.len(), 5);

        let query = embedder.embed("vector search HNSW nearest neighbors");
        let (results, metrics) = index.search_knn(&query, 3);

        assert!(!results.is_empty());
        assert!(results.len() <= 3);
        // Passage 2 ("High-throughput vector search using HNSW graphs") should rank #1
        assert_eq!(results[0].doc_id, 2);
        assert!(metrics.layer0_evaluations > 0);
    }
}
