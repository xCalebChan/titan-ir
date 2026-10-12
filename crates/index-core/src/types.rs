use serde::{Deserialize, Serialize};

/// Monotonic 32-bit document identifier.
pub type DocId = u32;

/// Relevance score.
pub type Score = f32;

/// A scored document candidate.
#[derive(Clone, Copy, Debug, PartialEq, Serialize, Deserialize)]
pub struct ScoredDoc {
    pub doc_id: DocId,
    pub score: Score,
}

impl ScoredDoc {
    pub fn new(doc_id: DocId, score: Score) -> Self {
        Self { doc_id, score }
    }
}

impl Eq for ScoredDoc {}

impl PartialOrd for ScoredDoc {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.score.partial_cmp(&other.score)
    }
}

impl Ord for ScoredDoc {
    fn cmp(&self, other: &Self) -> std::cmp::Ordering {
        self.partial_cmp(other).unwrap_or(std::cmp::Ordering::Equal)
    }
}

/// Metadata and payload of a document stored in the append-only doc store.
#[derive(Clone, Debug, PartialEq, Eq, Serialize, Deserialize)]
pub struct DocRecord {
    pub id: DocId,
    pub title: String,
    pub body: String,
    pub url: Option<String>,
}

impl DocRecord {
    pub fn new(id: DocId, title: impl Into<String>, body: impl Into<String>, url: Option<String>) -> Self {
        Self {
            id,
            title: title.into(),
            body: body.into(),
            url,
        }
    }
}
