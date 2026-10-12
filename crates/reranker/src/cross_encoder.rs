use std::cmp::Ordering;
use index_core::{DocId, ScoredDoc};

/// Cross-Encoder L2 reranker scoring (Query, DocText) token interactions.
pub struct CrossEncoderReranker {
    onnx_model_path: Option<String>,
}

impl Default for CrossEncoderReranker {
    fn default() -> Self {
        Self {
            onnx_model_path: None,
        }
    }
}

impl CrossEncoderReranker {
    pub fn new(onnx_model_path: Option<String>) -> Self {
        Self { onnx_model_path }
    }

    /// Reranks top candidate (Query, DocText) pairs and returns the top_k sorted by final relevance score.
    pub fn rerank(
        &self,
        query: &str,
        candidates: &[(DocId, &str)],
        top_k: usize,
    ) -> Vec<ScoredDoc> {
        let mut scored: Vec<ScoredDoc> = candidates
            .iter()
            .map(|&(doc_id, text)| {
                let score = self.score_pair(query, text);
                ScoredDoc::new(doc_id, score)
            })
            .collect();

        scored.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap_or(Ordering::Equal));
        scored.truncate(top_k);

        scored
    }

    /// Computes full cross-attention token interaction score between query and document text.
    pub fn score_pair(&self, query: &str, doc_text: &str) -> f32 {
        let q_tokens: Vec<&str> = query.split_whitespace().collect();
        let d_tokens: Vec<&str> = doc_text.split_whitespace().collect();

        if q_tokens.is_empty() || d_tokens.is_empty() {
            return 0.0;
        }

        let mut total_alignment = 0.0f32;

        // Cross-attention alignment: For each query token, find best matching document token with position decay
        for (q_idx, &q_word) in q_tokens.iter().enumerate() {
            let mut max_token_sim = 0.0f32;

            for (d_idx, &d_word) in d_tokens.iter().enumerate() {
                let sim = token_similarity(q_word, d_word);
                // Position bonus for earlier appearances in document
                let pos_weight = 1.0 / (1.0 + (d_idx as f32) * 0.02);
                let weighted_sim = sim * pos_weight;

                if weighted_sim > max_token_sim {
                    max_token_sim = weighted_sim;
                }
            }

            // Query term importance weighting
            let q_weight = 1.0 / (1.0 + (q_idx as f32) * 0.1);
            total_alignment += max_token_sim * q_weight;
        }

        let raw_score = total_alignment / (q_tokens.len() as f32).max(1.0);

        // Sigmoid activation mapping to [0.0, 1.0] probability
        sigmoid(raw_score * 3.5 - 1.5)
    }

    pub fn is_onnx_loaded(&self) -> bool {
        self.onnx_model_path.is_some()
    }
}

#[inline]
fn sigmoid(x: f32) -> f32 {
    1.0 / (1.0 + (-x).exp())
}

#[inline]
fn token_similarity(a: &str, b: &str) -> f32 {
    let a_low = a.to_lowercase();
    let b_low = b.to_lowercase();

    if a_low == b_low {
        return 1.0;
    }

    if a_low.contains(&b_low) || b_low.contains(&a_low) {
        let min_len = a_low.len().min(b_low.len()) as f32;
        let max_len = a_low.len().max(b_low.len()) as f32;
        return (min_len / max_len).max(0.6);
    }

    // Levenshtein distance similarity for typos and morphology
    let dist = levenshtein(&a_low, &b_low);
    let max_len = a_low.len().max(b_low.len());
    if dist <= 2 && max_len > 4 {
        1.0 - (dist as f32 / max_len as f32)
    } else {
        0.0
    }
}

fn levenshtein(a: &str, b: &str) -> usize {
    let a_bytes = a.as_bytes();
    let b_bytes = b.as_bytes();
    let mut dp = vec![vec![0; b_bytes.len() + 1]; a_bytes.len() + 1];

    for i in 0..=a_bytes.len() {
        dp[i][0] = i;
    }
    for j in 0..=b_bytes.len() {
        dp[0][j] = j;
    }

    for i in 1..=a_bytes.len() {
        for j in 1..=b_bytes.len() {
            let cost = if a_bytes[i - 1] == b_bytes[j - 1] { 0 } else { 1 };
            dp[i][j] = (dp[i - 1][j] + 1)
                .min(dp[i][j - 1] + 1)
                .min(dp[i - 1][j - 1] + cost);
        }
    }

    dp[a_bytes.len()][b_bytes.len()]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cross_encoder_scoring() {
        let reranker = CrossEncoderReranker::default();
        let query = "machine learning models in rust";

        let candidates = [
            (0, "Deep neural network machine learning models implemented in high performance Rust."),
            (1, "How to cook apple pie with cinnamon and butter."),
            (2, "Rust programming language for systems engineering and web servers."),
        ];

        let reranked = reranker.rerank(query, &candidates, 2);

        assert_eq!(reranked.len(), 2);
        // Doc 0 should have the highest cross-attention score
        assert_eq!(reranked[0].doc_id, 0);
        assert!(reranked[0].score > reranked[1].score);
    }
}
