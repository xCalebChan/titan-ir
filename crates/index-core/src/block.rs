use serde::{Deserialize, Serialize};

/// Metadata stored per posting block (e.g., 64 or 128 postings)
/// for Block-Max WAND dynamic pruning.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct BlockMeta {
    /// Upper bound of document IDs contained in this block.
    pub max_doc_id: u32,
    /// Upper bound of term BM25 score contributions for any document in this block.
    pub max_term_score: f32,
    /// Number of postings encoded in this block.
    pub count: u16,
}

impl BlockMeta {
    pub fn new(max_doc_id: u32, max_term_score: f32, count: u16) -> Self {
        Self {
            max_doc_id,
            max_term_score,
            count,
        }
    }
}
