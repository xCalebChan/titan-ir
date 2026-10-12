use index_core::{BlockMeta, EliasFano};
use crate::bm25::BM25Model;

pub const DEFAULT_BLOCK_SIZE: usize = 128;

/// A compressed block of postings within a posting list.
#[derive(Clone, Debug)]
pub struct PostingBlock {
    pub doc_ids_ef: EliasFano,
    pub term_freqs: Vec<u32>,
    pub meta: BlockMeta,
}

impl PostingBlock {
    pub fn new(
        doc_ids: &[u32],
        term_freqs: &[u32],
        doc_lengths: &[u32],
        idf: f32,
        bm25: &BM25Model,
    ) -> Self {
        assert_eq!(doc_ids.len(), term_freqs.len());
        assert!(!doc_ids.is_empty());

        let doc_ids_ef = EliasFano::from_sorted(doc_ids)
            .expect("document IDs in posting list must be strictly increasing");

        let max_doc_id = *doc_ids.last().unwrap();
        let max_tf = *term_freqs.iter().max().unwrap_or(&1);

        // Find minimum document length in this block to establish a strict upper-bound score
        let min_doc_len = doc_ids
            .iter()
            .map(|&d| doc_lengths.get(d as usize).copied().unwrap_or(1))
            .min()
            .unwrap_or(1);

        let max_term_score = bm25.block_max_score(max_tf, min_doc_len, idf);
        let meta = BlockMeta::new(max_doc_id, max_term_score, doc_ids.len() as u16);

        Self {
            doc_ids_ef,
            term_freqs: term_freqs.to_vec(),
            meta,
        }
    }

    #[inline]
    pub fn count(&self) -> usize {
        self.meta.count as usize
    }

    #[inline]
    pub fn max_doc_id(&self) -> u32 {
        self.meta.max_doc_id
    }

    #[inline]
    pub fn max_term_score(&self) -> f32 {
        self.meta.max_term_score
    }
}

/// Inverted posting list for a single term, partitioned into Elias-Fano compressed blocks.
#[derive(Clone, Debug)]
pub struct PostingList {
    pub term: String,
    pub doc_freq: u32,
    pub global_max_score: f32,
    pub blocks: Vec<PostingBlock>,
}

impl PostingList {
    pub fn from_postings(
        term: impl Into<String>,
        postings: &[(u32, u32)], // (doc_id, tf)
        doc_lengths: &[u32],
        bm25: &BM25Model,
        block_size: usize,
    ) -> Self {
        let term = term.into();
        let doc_freq = postings.len() as u32;
        let idf = bm25.idf(doc_freq);

        let mut blocks = Vec::new();
        let mut global_max_score = 0.0f32;

        for chunk in postings.chunks(block_size) {
            let doc_ids: Vec<u32> = chunk.iter().map(|&(d, _)| d).collect();
            let term_freqs: Vec<u32> = chunk.iter().map(|&(_, tf)| tf).collect();

            let block = PostingBlock::new(&doc_ids, &term_freqs, doc_lengths, idf, bm25);
            if block.max_term_score() > global_max_score {
                global_max_score = block.max_term_score();
            }
            blocks.push(block);
        }

        Self {
            term,
            doc_freq,
            global_max_score,
            blocks,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bm25::BM25Params;

    #[test]
    fn test_posting_list_block_partition() {
        let bm25 = BM25Model::new(1000, 40.0, BM25Params::default());
        let doc_lengths = vec![40; 1000];

        // 300 postings with block size 128 => 3 blocks (128, 128, 44)
        let postings: Vec<(u32, u32)> = (0..300).map(|i| (i * 2, (i % 5) + 1)).collect();

        let plist = PostingList::from_postings("neural", &postings, &doc_lengths, &bm25, 128);
        assert_eq!(plist.blocks.len(), 3);
        assert_eq!(plist.blocks[0].count(), 128);
        assert_eq!(plist.blocks[1].count(), 128);
        assert_eq!(plist.blocks[2].count(), 44);
        assert!(plist.global_max_score > 0.0);
    }
}
