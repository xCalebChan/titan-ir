use std::collections::BinaryHeap;
use std::time::Instant;

use index_core::{DocId, Score, ScoredDoc};
use crate::inverted_index::InvertedIndex;
use crate::posting::PostingList;

/// Tracks search execution metrics for Block-Max WAND pruning performance validation.
#[derive(Clone, Copy, Debug, Default, serde::Serialize, serde::Deserialize)]
pub struct WandMetrics {
    pub blocks_evaluated: usize,
    pub blocks_skipped: usize,
    pub docs_scored: usize,
    pub total_postings: usize,
    pub latency_us: u64,
}

impl WandMetrics {
    pub fn pruning_efficiency(&self) -> f32 {
        let total = self.blocks_evaluated + self.blocks_skipped;
        if total > 0 {
            (self.blocks_skipped as f32 / total as f32) * 100.0
        } else {
            0.0
        }
    }
}

/// Dynamic posting list cursor navigating across Elias-Fano compressed blocks.
pub struct PostingCursor<'a> {
    pub plist: &'a PostingList,
    pub block_idx: usize,
    pub in_block_idx: usize,
    pub current_doc_id: u32,
    pub current_tf: u32,
    pub at_end: bool,
}

impl<'a> PostingCursor<'a> {
    pub fn new(plist: &'a PostingList) -> Option<Self> {
        if plist.blocks.is_empty() {
            return None;
        }

        let first_block = &plist.blocks[0];
        let doc_id = first_block.doc_ids_ef.get(0)?;
        let tf = first_block.term_freqs.first().copied().unwrap_or(1);

        Some(Self {
            plist,
            block_idx: 0,
            in_block_idx: 0,
            current_doc_id: doc_id,
            current_tf: tf,
            at_end: false,
        })
    }

    #[inline]
    pub fn doc_id(&self) -> u32 {
        self.current_doc_id
    }

    #[inline]
    pub fn current_block_max_score(&self) -> f32 {
        if self.at_end || self.block_idx >= self.plist.blocks.len() {
            0.0
        } else {
            self.plist.blocks[self.block_idx].max_term_score()
        }
    }

    /// Advances the cursor to the first document with DocID >= target_doc_id.
    /// Skips entire Elias-Fano blocks whose max_doc_id < target_doc_id without decoding!
    pub fn shallow_advance(&mut self, target_doc_id: u32, metrics: &mut WandMetrics) -> bool {
        if self.at_end {
            return false;
        }

        if self.current_doc_id >= target_doc_id {
            return true;
        }

        // Block-level skipping: jump past blocks whose max_doc_id < target_doc_id
        while self.block_idx < self.plist.blocks.len() {
            let block = &self.plist.blocks[self.block_idx];
            if block.max_doc_id() < target_doc_id {
                self.block_idx += 1;
                metrics.blocks_skipped += 1;
            } else {
                break;
            }
        }

        if self.block_idx >= self.plist.blocks.len() {
            self.at_end = true;
            return false;
        }

        metrics.blocks_evaluated += 1;
        let block = &self.plist.blocks[self.block_idx];

        // Search within current block using Elias-Fano fast binary search
        if let Some((idx, doc_id)) = block.doc_ids_ef.next_geq(target_doc_id, self.in_block_idx) {
            self.in_block_idx = idx;
            self.current_doc_id = doc_id;
            self.current_tf = block.term_freqs[idx];
            true
        } else {
            // No doc >= target in this block; advance to next block
            self.block_idx += 1;
            self.in_block_idx = 0;
            if self.block_idx < self.plist.blocks.len() {
                let next_block = &self.plist.blocks[self.block_idx];
                if let Some(doc_id) = next_block.doc_ids_ef.get(0) {
                    self.current_doc_id = doc_id;
                    self.current_tf = next_block.term_freqs[0];
                    self.shallow_advance(target_doc_id, metrics)
                } else {
                    self.at_end = true;
                    false
                }
            } else {
                self.at_end = true;
                false
            }
        }
    }
}

/// Min-heap entry storing (score, doc_id) inverted for top-K retention.
#[derive(Clone, Copy, PartialEq)]
struct HeapItem {
    score: Score,
    doc_id: DocId,
}

impl Eq for HeapItem {}

impl Ord for HeapItem {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        // Reverse ordering so BinaryHeap acts as a min-heap
        other.score.partial_cmp(&self.score).unwrap_or(std::cmp::Ordering::Equal)
    }
}

impl PartialOrd for HeapItem {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        Some(self.cmp(other))
    }
}

/// Executes Block-Max WAND dynamic pruning over the inverted index.
pub fn search_block_max_wand(
    index: &InvertedIndex,
    query_terms: &[String],
    k: usize,
) -> (Vec<ScoredDoc>, WandMetrics) {
    let start_time = Instant::now();
    let mut metrics = WandMetrics::default();

    if query_terms.is_empty() || index.num_docs == 0 || k == 0 {
        return (Vec::new(), metrics);
    }

    // Initialize posting cursors for query terms present in the dictionary
    let mut cursors: Vec<PostingCursor> = query_terms
        .iter()
        .filter_map(|t| index.get_posting_list(t))
        .filter_map(|plist| PostingCursor::new(plist))
        .collect();

    for c in &cursors {
        metrics.total_postings += c.plist.doc_freq as usize;
    }

    if cursors.is_empty() {
        return (Vec::new(), metrics);
    }

    let mut heap: BinaryHeap<HeapItem> = BinaryHeap::with_capacity(k + 1);
    let mut theta = 0.0f32;

    loop {
        // Retain only cursors that have not reached the end of their posting lists
        cursors.retain(|c| !c.at_end);
        if cursors.is_empty() {
            break;
        }

        // Sort posting cursors by their current DocID
        cursors.sort_by_key(|c| c.doc_id());

        // Accumulate block maximums until we exceed threshold theta
        let mut accum_score = 0.0f32;
        let mut pivot_idx = None;

        for (i, c) in cursors.iter().enumerate() {
            accum_score += c.current_block_max_score();
            if accum_score > theta {
                pivot_idx = Some(i);
                break;
            }
        }

        let p = match pivot_idx {
            Some(p) => p,
            None => {
                // Sum of maximum possible block contributions cannot beat threshold theta.
                // Prune all remaining candidates and terminate early!
                break;
            }
        };

        let pivot_doc_id = cursors[p].doc_id();

        if cursors[0].doc_id() < pivot_doc_id {
            // First iterator is behind pivot; advance it towards pivot DocID
            cursors[0].shallow_advance(pivot_doc_id, &mut metrics);
        } else {
            // Candidate pivot_doc_id matches cursors[0]; evaluate full BM25 score
            let doc_id = pivot_doc_id;
            metrics.docs_scored += 1;

            let doc_len = index.doc_len(doc_id);
            let mut exact_bm25_score = 0.0f32;

            for c in cursors.iter_mut() {
                if c.doc_id() == doc_id {
                    let idf = index.bm25.idf(c.plist.doc_freq);
                    exact_bm25_score += index.bm25.score_term(c.current_tf, doc_len, idf);
                    // Advance past this doc
                    c.shallow_advance(doc_id + 1, &mut metrics);
                }
            }

            if exact_bm25_score > theta {
                if heap.len() >= k {
                    heap.pop();
                }
                heap.push(HeapItem {
                    score: exact_bm25_score,
                    doc_id,
                });

                if heap.len() >= k {
                    theta = heap.peek().map(|item| item.score).unwrap_or(0.0);
                }
            }
        }
    }

    // Drain min-heap into sorted top-K candidates (descending by score)
    let mut results: Vec<ScoredDoc> = heap
        .into_vec()
        .into_iter()
        .map(|item| ScoredDoc::new(item.doc_id, item.score))
        .collect();

    results.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(std::cmp::Ordering::Equal));
    metrics.latency_us = start_time.elapsed().as_micros() as u64;

    (results, metrics)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bm25::BM25Params;
    use crate::tokenizer::Tokenizer;

    #[test]
    fn test_block_max_wand_retrieval() {
        let docs = [
            (0, "the rust programming language is fast and memory safe"),
            (1, "python is popular for data science and machine learning"),
            (2, "rust has zero cost abstractions and fearless concurrency"),
            (3, "machine learning algorithms in rust and python"),
            (4, "deep neural networks and retrieval engine design in rust"),
        ];

        let tokenizer = Tokenizer::default();
        let index = InvertedIndex::build(&docs, &tokenizer, BM25Params::default(), 2);

        let query = tokenizer.tokenize("rust programming language concurrency");
        let (results, metrics) = search_block_max_wand(&index, &query, 3);

        println!("RESULTS: {:?}", results);
        println!("METRICS: {:?}", metrics);

        assert!(!results.is_empty());
        assert!(results.len() <= 3);
        let top_doc = results[0].doc_id;
        assert!(top_doc == 0 || top_doc == 2);
        assert!(metrics.docs_scored > 0);
    }
}
