use std::collections::HashMap;
use index_core::DocId;
use crate::bm25::{BM25Model, BM25Params};
use crate::posting::PostingList;
use crate::tokenizer::Tokenizer;

/// Inverted index storing terms mapped to Elias-Fano compressed posting blocks
/// along with document length statistics for BM25 and Block-Max WAND pruning.
pub struct InvertedIndex {
    pub dictionary: HashMap<String, PostingList>,
    pub doc_lengths: Vec<u32>,
    pub num_docs: u32,
    pub total_doc_len: u64,
    pub avgdl: f32,
    pub bm25: BM25Model,
}

impl InvertedIndex {
    /// Builds an inverted index from raw documents in a single multi-stage pass.
    pub fn build(
        documents: &[(DocId, &str)],
        tokenizer: &Tokenizer,
        bm25_params: BM25Params,
        block_size: usize,
    ) -> Self {
        let num_docs = documents.len() as u32;
        let mut doc_lengths = vec![0u32; num_docs as usize];
        let mut total_doc_len = 0u64;

        // Temporary accumulator: term -> Vec<(doc_id, tf)>
        let mut term_postings_map: HashMap<String, Vec<(DocId, u32)>> = HashMap::new();

        for &(doc_id, text) in documents {
            let tokens = tokenizer.tokenize(text);
            let len = tokens.len() as u32;
            if (doc_id as usize) < doc_lengths.len() {
                doc_lengths[doc_id as usize] = len;
            }
            total_doc_len += len as u64;

            // Count term frequencies in this document
            let mut tf_map: HashMap<String, u32> = HashMap::new();
            for token in tokens {
                *tf_map.entry(token).or_insert(0) += 1;
            }

            for (term, tf) in tf_map {
                term_postings_map
                    .entry(term)
                    .or_default()
                    .push((doc_id, tf));
            }
        }

        let avgdl = if num_docs > 0 {
            total_doc_len as f32 / num_docs as f32
        } else {
            1.0
        };

        let bm25 = BM25Model::new(num_docs, avgdl, bm25_params);
        let mut dictionary = HashMap::with_capacity(term_postings_map.len());

        for (term, mut postings) in term_postings_map {
            // Ensure strictly monotonic order by DocID
            postings.sort_by_key(|&(doc_id, _)| doc_id);
            let posting_list = PostingList::from_postings(
                term.clone(),
                &postings,
                &doc_lengths,
                &bm25,
                block_size,
            );
            dictionary.insert(term, posting_list);
        }

        Self {
            dictionary,
            doc_lengths,
            num_docs,
            total_doc_len,
            avgdl,
            bm25,
        }
    }

    /// Number of distinct terms in the index vocabulary.
    pub fn vocab_size(&self) -> usize {
        self.dictionary.len()
    }

    /// Looks up a term posting list.
    pub fn get_posting_list(&self, term: &str) -> Option<&PostingList> {
        self.dictionary.get(term)
    }

    /// Document length by DocID.
    pub fn doc_len(&self, doc_id: DocId) -> u32 {
        self.doc_lengths.get(doc_id as usize).copied().unwrap_or(0)
    }
}
