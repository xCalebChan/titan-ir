export interface DocumentPassage {
  doc_id: number;
  title: string;
  body: string;
  url?: string;
}

export interface DatasetMeta {
  id: string;
  name: string;
  description: string;
  document_count: number;
  is_custom: boolean;
  indexed_at?: string;
}

export interface SearchHit {
  doc_id: number;
  title: string;
  snippet: string;
  url?: string;
  final_score: number;
  lexical_score?: number;
  dense_score?: number;
  rrf_score?: number;
  rerank_score?: number;
}

export interface SearchTiming {
  total_ms: number;
  lexical_ms: number;
  dense_ms: number;
  fusion_ms: number;
  rerank_ms: number;
}

export interface SearchMetrics {
  blocks_evaluated: number;
  blocks_skipped: number;
  pruning_ratio_pct: number;
  docs_scored: number;
  upper_layer_hops: number;
  layer0_evaluations: number;
}

export interface SearchResponse {
  query: string;
  mode: 'hybrid' | 'lexical' | 'dense';
  total_hits: number;
  results: SearchHit[];
  timing: SearchTiming;
  metrics: SearchMetrics;
}

export interface EngineStats {
  document_count: number;
  vocabulary_size: number;
  avg_doc_len: number;
  elias_fano_bytes: number;
  uncompressed_posting_bytes: number;
  lexical_compression_ratio: number;
  sq8_vector_bytes: number;
  f32_vector_bytes: number;
  dense_memory_savings_pct: number;
  hnsw_layers: number;
  hnsw_total_edges: number;
}

export interface BenchmarkResponse {
  total_queries: number;
  total_duration_ms: number;
  qps: number;
  avg_latency_ms: number;
  p50_ms: number;
  p90_ms: number;
  p95_ms: number;
  p99_ms: number;
  max_latency_ms: number;
  mode: string;
}
