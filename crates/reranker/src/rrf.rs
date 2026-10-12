use std::cmp::Ordering;
use std::collections::HashMap;
use index_core::{DocId, ScoredDoc};

pub const DEFAULT_RRF_K: f32 = 60.0;

/// Enriched candidate details after Reciprocal Rank Fusion merging.
#[derive(Clone, Debug, serde::Serialize, serde::Deserialize)]
pub struct RrfCandidate {
    pub doc_id: DocId,
    pub rrf_score: f32,
    pub lexical_rank: Option<usize>,
    pub dense_rank: Option<usize>,
    pub lexical_score: Option<f32>,
    pub dense_score: Option<f32>,
}

/// Combines candidate IDs from both lexical (BM25) and dense (HNSW) lists into a single deduplicated pool
/// using Reciprocal Rank Fusion:
/// RRF_Score(d) = 1 / (k + rank_lexical(d)) + 1 / (k + rank_dense(d))
pub fn reciprocal_rank_fusion(
    lexical: &[ScoredDoc],
    dense: &[ScoredDoc],
    k: f32,
    top_n: usize,
) -> Vec<RrfCandidate> {
    let mut pool: HashMap<DocId, RrfCandidate> = HashMap::with_capacity(lexical.len() + dense.len());

    // Ingest lexical rankings (1-indexed ranks)
    for (idx, doc) in lexical.iter().enumerate() {
        let rank = idx + 1;
        let score_contribution = 1.0 / (k + rank as f32);

        let entry = pool.entry(doc.doc_id).or_insert_with(|| RrfCandidate {
            doc_id: doc.doc_id,
            rrf_score: 0.0,
            lexical_rank: None,
            dense_rank: None,
            lexical_score: None,
            dense_score: None,
        });

        entry.rrf_score += score_contribution;
        entry.lexical_rank = Some(rank);
        entry.lexical_score = Some(doc.score);
    }

    // Ingest dense rankings (1-indexed ranks)
    for (idx, doc) in dense.iter().enumerate() {
        let rank = idx + 1;
        let score_contribution = 1.0 / (k + rank as f32);

        let entry = pool.entry(doc.doc_id).or_insert_with(|| RrfCandidate {
            doc_id: doc.doc_id,
            rrf_score: 0.0,
            lexical_rank: None,
            dense_rank: None,
            lexical_score: None,
            dense_score: None,
        });

        entry.rrf_score += score_contribution;
        entry.dense_rank = Some(rank);
        entry.dense_score = Some(doc.score);
    }

    let mut candidates: Vec<RrfCandidate> = pool.into_values().collect();
    candidates.sort_by(|a, b| b.rrf_score.partial_cmp(&a.rrf_score).unwrap_or(Ordering::Equal));
    candidates.truncate(top_n);

    candidates
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rrf_scoring() {
        let lexical = vec![
            ScoredDoc::new(10, 5.0),
            ScoredDoc::new(20, 4.0),
            ScoredDoc::new(30, 3.0),
        ];

        let dense = vec![
            ScoredDoc::new(20, 0.95),
            ScoredDoc::new(10, 0.90),
            ScoredDoc::new(40, 0.85),
        ];

        let fused = reciprocal_rank_fusion(&lexical, &dense, 60.0, 10);

        // Doc 10: rank 1 lexical, rank 2 dense => 1/61 + 1/62 = 0.01639 + 0.01613 = 0.03252
        // Doc 20: rank 2 lexical, rank 1 dense => 1/62 + 1/61 = 0.03252
        assert_eq!(fused.len(), 4);
        assert!(fused[0].doc_id == 10 || fused[0].doc_id == 20);
        assert!(fused[0].rrf_score > fused[2].rrf_score);
    }
}
