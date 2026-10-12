use std::sync::Arc;
use std::time::Instant;
use parking_lot::RwLock;
use serde::{Deserialize, Serialize};

use dense_engine::{HnswConfig, HnswIndex, HnswMetrics, SemanticEmbedder};
use index_core::{DocId, DocRecord, InMemoryDocStore};
use lexical_engine::{
    search_block_max_wand, BM25Params, InvertedIndex, Tokenizer, WandMetrics,
};
use reranker::{reciprocal_rank_fusion, CrossEncoderReranker, RrfCandidate, DEFAULT_RRF_K};

#[derive(Clone, Debug, Deserialize)]
pub struct SearchRequest {
    pub query: String,
    pub mode: Option<String>, // "hybrid" | "lexical" | "dense"
    pub top_k: Option<usize>,
    pub rrf_k: Option<f32>,
    pub rerank: Option<bool>,
    pub rerank_candidates: Option<usize>,
}

#[derive(Clone, Debug, Serialize)]
pub struct SearchHit {
    pub doc_id: DocId,
    pub title: String,
    pub snippet: String,
    pub url: Option<String>,
    pub final_score: f32,
    pub lexical_score: Option<f32>,
    pub dense_score: Option<f32>,
    pub rrf_score: Option<f32>,
    pub rerank_score: Option<f32>,
}

#[derive(Clone, Debug, Serialize)]
pub struct SearchTiming {
    pub total_ms: f64,
    pub lexical_ms: f64,
    pub dense_ms: f64,
    pub fusion_ms: f64,
    pub rerank_ms: f64,
}

#[derive(Clone, Debug, Serialize)]
pub struct SearchMetrics {
    pub blocks_evaluated: usize,
    pub blocks_skipped: usize,
    pub pruning_ratio_pct: f32,
    pub docs_scored: usize,
    pub upper_layer_hops: usize,
    pub layer0_evaluations: usize,
}

#[derive(Clone, Debug, Serialize)]
pub struct SearchResponse {
    pub query: String,
    pub mode: String,
    pub total_hits: usize,
    pub results: Vec<SearchHit>,
    pub timing: SearchTiming,
    pub metrics: SearchMetrics,
}

#[derive(Clone, Debug, Serialize)]
pub struct EngineStats {
    pub document_count: usize,
    pub vocabulary_size: usize,
    pub avg_doc_len: f32,
    pub elias_fano_bytes: usize,
    pub uncompressed_posting_bytes: usize,
    pub lexical_compression_ratio: f32,
    pub sq8_vector_bytes: usize,
    pub f32_vector_bytes: usize,
    pub dense_memory_savings_pct: f32,
    pub hnsw_layers: usize,
    pub hnsw_total_edges: usize,
}

#[derive(Clone, Debug, Deserialize)]
pub struct BenchmarkRequest {
    pub num_queries: Option<usize>,
    pub mode: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
pub struct BenchmarkResponse {
    pub total_queries: usize,
    pub total_duration_ms: f64,
    pub qps: f64,
    pub avg_latency_ms: f64,
    pub p50_ms: f64,
    pub p90_ms: f64,
    pub p95_ms: f64,
    pub p99_ms: f64,
    pub max_latency_ms: f64,
    pub mode: String,
}

pub struct TitanEngine {
    pub doc_store: Arc<RwLock<InMemoryDocStore>>,
    pub lexical_index: Arc<RwLock<InvertedIndex>>,
    pub tokenizer: Arc<Tokenizer>,
    pub dense_index: Arc<RwLock<HnswIndex>>,
    pub embedder: Arc<SemanticEmbedder>,
    pub reranker: Arc<CrossEncoderReranker>,
}

impl TitanEngine {
    pub fn new() -> Self {
        let tokenizer = Arc::new(Tokenizer::default());
        let embedder = Arc::new(SemanticEmbedder::default());
        let reranker = Arc::new(CrossEncoderReranker::default());

        let doc_store = Arc::new(RwLock::new(InMemoryDocStore::new()));
        let lexical_index = Arc::new(RwLock::new(InvertedIndex::build(
            &[],
            &tokenizer,
            BM25Params::default(),
            128,
        )));
        let dense_index = Arc::new(RwLock::new(HnswIndex::new(HnswConfig::default())));

        Self {
            doc_store,
            lexical_index,
            tokenizer,
            dense_index,
            embedder,
            reranker,
        }
    }

    /// Ingests a batch of document records into both lexical and dense indices.
    pub fn ingest_batch(&self, docs: Vec<DocRecord>) {
        let mut store = self.doc_store.write();
        let mut text_pairs: Vec<(DocId, String)> = Vec::with_capacity(docs.len());

        for doc in docs {
            let id = store.append(doc.clone());
            let full_text = format!("{} {}", doc.title, doc.body);
            text_pairs.push((id, full_text));
        }

        drop(store);

        // Rebuild lexical inverted index with Elias-Fano compressed blocks
        let doc_refs: Vec<(DocId, &str)> = text_pairs
            .iter()
            .map(|(id, text)| (*id, text.as_str()))
            .collect();

        let new_lexical = InvertedIndex::build(
            &doc_refs,
            &self.tokenizer,
            BM25Params::default(),
            64,
        );
        *self.lexical_index.write() = new_lexical;

        // Populate HNSW vector graph with SQ8 quantized vectors
        let mut dense_guard = self.dense_index.write();
        *dense_guard = HnswIndex::new(HnswConfig::default());
        for (id, text) in &text_pairs {
            let vec = self.embedder.embed(text);
            dense_guard.insert(*id, &vec);
        }
    }

    /// Executes high-throughput hybrid retrieval matching the project specification.
    pub fn search(&self, req: &SearchRequest) -> SearchResponse {
        let start_total = Instant::now();
        let mode = req.mode.as_deref().unwrap_or("hybrid");
        let top_k = req.top_k.unwrap_or(10);
        let rrf_k = req.rrf_k.unwrap_or(DEFAULT_RRF_K);
        let rerank_enabled = req.rerank.unwrap_or(true);
        let candidate_pool_size = req.rerank_candidates.unwrap_or(50).max(top_k);

        let mut lexical_results = Vec::new();
        let mut dense_results = Vec::new();
        let mut wand_metrics = WandMetrics::default();
        let mut hnsw_metrics = HnswMetrics::default();

        let mut lexical_ms = 0.0;
        let mut dense_ms = 0.0;
        let mut fusion_ms = 0.0;
        let mut rerank_ms = 0.0;

        let query = req.query.trim();

        // 1. Lexical retrieval (Block-Max WAND)
        if mode == "hybrid" || mode == "lexical" {
            let start_lex = Instant::now();
            let query_tokens = self.tokenizer.tokenize(query);
            let index_guard = self.lexical_index.read();
            let (results, metrics) = search_block_max_wand(&index_guard, &query_tokens, candidate_pool_size);
            lexical_results = results;
            wand_metrics = metrics;
            lexical_ms = start_lex.elapsed().as_secs_f64() * 1000.0;
        }

        // 2. Dense retrieval (HNSW with SQ8 vectors)
        if mode == "hybrid" || mode == "dense" {
            let start_dense = Instant::now();
            let query_vec = self.embedder.embed(query);
            let dense_guard = self.dense_index.read();
            let (results, metrics) = dense_guard.search_knn(&query_vec, candidate_pool_size);
            dense_results = results;
            hnsw_metrics = metrics;
            dense_ms = start_dense.elapsed().as_secs_f64() * 1000.0;
        }

        // 3. Fusion & L2 Reranking
        let store = self.doc_store.read();
        let mut search_hits: Vec<SearchHit> = Vec::new();

        if mode == "hybrid" {
            let start_fuse = Instant::now();
            let fused_candidates: Vec<RrfCandidate> = reciprocal_rank_fusion(
                &lexical_results,
                &dense_results,
                rrf_k,
                candidate_pool_size,
            );
            fusion_ms = start_fuse.elapsed().as_secs_f64() * 1000.0;

            if rerank_enabled && !fused_candidates.is_empty() {
                let start_rerank = Instant::now();
                let top_slice: Vec<&RrfCandidate> = fused_candidates.iter().take(candidate_pool_size).collect();

                let mut text_pairs: Vec<(DocId, &str)> = Vec::with_capacity(top_slice.len());
                let mut candidate_map: std::collections::HashMap<DocId, &RrfCandidate> = std::collections::HashMap::new();

                for &cand in &top_slice {
                    candidate_map.insert(cand.doc_id, cand);
                    if let Some(doc) = store.get(cand.doc_id) {
                        text_pairs.push((cand.doc_id, &doc.body));
                    }
                }

                let reranked = self.reranker.rerank(query, &text_pairs, top_k);
                rerank_ms = start_rerank.elapsed().as_secs_f64() * 1000.0;

                for scored_doc in reranked {
                    if let Some(doc) = store.get(scored_doc.doc_id) {
                        let cand_meta = candidate_map.get(&scored_doc.doc_id).copied();
                        search_hits.push(SearchHit {
                            doc_id: scored_doc.doc_id,
                            title: doc.title.clone(),
                            snippet: truncate_snippet(&doc.body, 180),
                            url: doc.url.clone(),
                            final_score: scored_doc.score,
                            lexical_score: cand_meta.and_then(|c| c.lexical_score),
                            dense_score: cand_meta.and_then(|c| c.dense_score),
                            rrf_score: cand_meta.map(|c| c.rrf_score),
                            rerank_score: Some(scored_doc.score),
                        });
                    }
                }
            } else {
                for cand in fused_candidates.into_iter().take(top_k) {
                    if let Some(doc) = store.get(cand.doc_id) {
                        search_hits.push(SearchHit {
                            doc_id: cand.doc_id,
                            title: doc.title.clone(),
                            snippet: truncate_snippet(&doc.body, 180),
                            url: doc.url.clone(),
                            final_score: cand.rrf_score,
                            lexical_score: cand.lexical_score,
                            dense_score: cand.dense_score,
                            rrf_score: Some(cand.rrf_score),
                            rerank_score: None,
                        });
                    }
                }
            }
        } else if mode == "lexical" {
            for doc in lexical_results.into_iter().take(top_k) {
                if let Some(record) = store.get(doc.doc_id) {
                    search_hits.push(SearchHit {
                        doc_id: doc.doc_id,
                        title: record.title.clone(),
                        snippet: truncate_snippet(&record.body, 180),
                        url: record.url.clone(),
                        final_score: doc.score,
                        lexical_score: Some(doc.score),
                        dense_score: None,
                        rrf_score: None,
                        rerank_score: None,
                    });
                }
            }
        } else {
            // mode == "dense"
            for doc in dense_results.into_iter().take(top_k) {
                if let Some(record) = store.get(doc.doc_id) {
                    search_hits.push(SearchHit {
                        doc_id: doc.doc_id,
                        title: record.title.clone(),
                        snippet: truncate_snippet(&record.body, 180),
                        url: record.url.clone(),
                        final_score: doc.score,
                        lexical_score: None,
                        dense_score: Some(doc.score),
                        rrf_score: None,
                        rerank_score: None,
                    });
                }
            }
        }

        let total_ms = start_total.elapsed().as_secs_f64() * 1000.0;
        let total_hits = search_hits.len();

        SearchResponse {
            query: query.to_string(),
            mode: mode.to_string(),
            total_hits,
            results: search_hits,
            timing: SearchTiming {
                total_ms,
                lexical_ms,
                dense_ms,
                fusion_ms,
                rerank_ms,
            },
            metrics: SearchMetrics {
                blocks_evaluated: wand_metrics.blocks_evaluated,
                blocks_skipped: wand_metrics.blocks_skipped,
                pruning_ratio_pct: wand_metrics.pruning_efficiency(),
                docs_scored: wand_metrics.docs_scored,
                upper_layer_hops: hnsw_metrics.upper_layer_hops,
                layer0_evaluations: hnsw_metrics.layer0_evaluations,
            },
        }
    }

    /// Generates statistics on memory layout, bitpacking, and graph structure.
    pub fn stats(&self) -> EngineStats {
        let store = self.doc_store.read();
        let doc_count = store.len();

        let lex = self.lexical_index.read();
        let vocab_size = lex.vocab_size();
        let avg_doc_len = lex.avgdl;

        let mut elias_fano_bytes = 0;
        let mut uncompressed_posting_bytes = 0;

        for plist in lex.dictionary.values() {
            for block in &plist.blocks {
                elias_fano_bytes += block.doc_ids_ef.encoded_bytes();
                uncompressed_posting_bytes += block.count() * std::mem::size_of::<u32>();
            }
        }

        let lexical_compression_ratio = if elias_fano_bytes > 0 {
            uncompressed_posting_bytes as f32 / elias_fano_bytes as f32
        } else {
            1.0
        };

        let dense = self.dense_index.read();
        let hnsw_layers = dense.layers.len();

        let mut hnsw_total_edges = 0;
        for layer in &dense.layers {
            for neighbors in layer {
                hnsw_total_edges += neighbors.len();
            }
        }

        let sq8_vector_bytes = doc_count * 384; // 384 bytes per doc
        let f32_vector_bytes = doc_count * 384 * 4; // 1536 bytes per doc
        let dense_memory_savings_pct = 75.0; // 4x reduction

        EngineStats {
            document_count: doc_count,
            vocabulary_size: vocab_size,
            avg_doc_len,
            elias_fano_bytes,
            uncompressed_posting_bytes,
            lexical_compression_ratio,
            sq8_vector_bytes,
            f32_vector_bytes,
            dense_memory_savings_pct,
            hnsw_layers,
            hnsw_total_edges,
        }
    }

    /// Evaluates concurrent query throughput and latency percentiles.
    pub fn benchmark(&self, req: &BenchmarkRequest) -> BenchmarkResponse {
        let total_queries = req.num_queries.unwrap_or(200);
        let mode = req.mode.as_deref().unwrap_or("hybrid");

        let benchmark_queries = [
            "Block-Max WAND dynamic pruning inverted index",
            "Elias-Fano compression strictly increasing integers",
            "HNSW vector search graphs approximate nearest neighbor",
            "Reciprocal Rank Fusion hybrid search scoring",
            "Cross-Encoder neural reranking MS MARCO validation",
            "SIMD vector intrinsics AVX2 integer dot product",
            "Rust concurrency Rayon parallel multi-threaded",
            "p99 latency profiling zero memory allocation",
        ];

        let mut latencies_ms = Vec::with_capacity(total_queries);
        let start_bench = Instant::now();

        for i in 0..total_queries {
            let q = benchmark_queries[i % benchmark_queries.len()];
            let search_req = SearchRequest {
                query: q.to_string(),
                mode: Some(mode.to_string()),
                top_k: Some(10),
                rrf_k: Some(60.0),
                rerank: Some(true),
                rerank_candidates: Some(30),
            };

            let resp = self.search(&search_req);
            latencies_ms.push(resp.timing.total_ms);
        }

        let total_duration = start_bench.elapsed();
        let total_duration_ms = total_duration.as_secs_f64() * 1000.0;
        let qps = (total_queries as f64) / total_duration.as_secs_f64();

        latencies_ms.sort_by(|a, b| a.partial_cmp(b).unwrap());

        let avg_latency_ms: f64 = latencies_ms.iter().sum::<f64>() / (total_queries as f64);
        let p50_ms = latencies_ms[(total_queries as f64 * 0.50) as usize];
        let p90_ms = latencies_ms[(total_queries as f64 * 0.90) as usize];
        let p95_ms = latencies_ms[(total_queries as f64 * 0.95) as usize];
        let p99_idx = ((total_queries as f64 * 0.99) as usize).min(total_queries - 1);
        let p99_ms = latencies_ms[p99_idx];
        let max_latency_ms = *latencies_ms.last().unwrap_or(&0.0);

        BenchmarkResponse {
            total_queries,
            total_duration_ms,
            qps,
            avg_latency_ms,
            p50_ms,
            p90_ms,
            p95_ms,
            p99_ms,
            max_latency_ms,
            mode: mode.to_string(),
        }
    }
}

fn truncate_snippet(text: &str, max_len: usize) -> String {
    if text.len() <= max_len {
        text.to_string()
    } else {
        format!("{}...", &text[..max_len])
    }
}
