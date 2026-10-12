use serde::{Deserialize, Serialize};

#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct BM25Params {
    pub k1: f32,
    pub b: f32,
}

impl Default for BM25Params {
    fn default() -> Self {
        Self { k1: 1.2, b: 0.75 }
    }
}

/// Dynamic BM25 scoring model.
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BM25Model {
    pub params: BM25Params,
    pub num_docs: u32,
    pub avgdl: f32,
}

impl BM25Model {
    pub fn new(num_docs: u32, avgdl: f32, params: BM25Params) -> Self {
        Self {
            params,
            num_docs,
            avgdl: avgdl.max(1.0),
        }
    }

    /// Computes smoothed Robertson-Spärck Jones IDF:
    /// IDF(t) = ln(1.0 + (N - DF + 0.5) / (DF + 0.5))
    #[inline]
    pub fn idf(&self, doc_freq: u32) -> f32 {
        let n = self.num_docs as f32;
        let df = doc_freq as f32;
        let numerator = n - df + 0.5;
        let denominator = df + 0.5;
        (1.0 + (numerator / denominator)).ln().max(0.0001)
    }

    /// Computes BM25 contribution for a single term in a document:
    /// score = IDF * (TF * (k1 + 1)) / (TF + k1 * (1 - b + b * (|D| / avgdl)))
    #[inline]
    pub fn score_term(&self, tf: u32, doc_len: u32, idf: f32) -> f32 {
        if tf == 0 {
            return 0.0;
        }
        let tf_f = tf as f32;
        let doc_len_f = doc_len as f32;
        let k1 = self.params.k1;
        let b = self.params.b;

        let len_norm = 1.0 - b + b * (doc_len_f / self.avgdl);
        let num = tf_f * (k1 + 1.0);
        let den = tf_f + k1 * len_norm;

        idf * (num / den)
    }

    /// Upper bound score for a block, given the block's maximum TF and minimum doc length.
    /// Used for Block-Max WAND dynamic pruning.
    #[inline]
    pub fn block_max_score(&self, max_tf: u32, min_doc_len: u32, idf: f32) -> f32 {
        self.score_term(max_tf, min_doc_len, idf)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bm25_monotonicity() {
        let model = BM25Model::new(1000, 50.0, BM25Params::default());
        let idf = model.idf(10);
        let score_low_tf = model.score_term(1, 50, idf);
        let score_high_tf = model.score_term(5, 50, idf);
        assert!(score_high_tf > score_low_tf);

        let score_short_doc = model.score_term(2, 20, idf);
        let score_long_doc = model.score_term(2, 100, idf);
        assert!(score_short_doc > score_long_doc);
    }
}
