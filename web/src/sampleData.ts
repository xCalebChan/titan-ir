import type { EngineStats, SearchResponse, BenchmarkResponse, DocumentPassage } from './types';
import { getActiveDataset } from './datasetStore';

export const SAMPLE_PASSAGES = [
  {
    doc_id: 0,
    title: "Block-Max WAND Pruning Algorithm",
    body: "Block-Max WAND (Weak AND) is an index traversal and dynamic pruning algorithm for inverted indexes. It organizes postings into Elias-Fano compressed blocks, tracking upper-bound BM25 term scores per block. When a query is evaluated, entire blocks whose score contributions cannot beat the current top-K minimum threshold theta are skipped, dramatically accelerating top-K document retrieval.",
    url: "https://msmarco.org/passages/bmw_001",
  },
  {
    doc_id: 1,
    title: "Elias-Fano Bitset Compression",
    body: "Elias-Fano is a quasi-succinct representation for strictly increasing integer sequences. By splitting 32-bit document IDs into high bits stored unary in a bitvector and low bits packed tightly, Elias-Fano achieves near-optimal Shannon entropy storage and provides sub-microsecond random access and next_geq binary search jumps without decoding entire posting lists.",
    url: "https://msmarco.org/passages/ef_002",
  },
  {
    doc_id: 2,
    title: "Scalar Quantization (SQ8) for Vector Embeddings",
    body: "Scalar Quantization (SQ8) maps 32-bit floating-point embedding coordinates into 8-bit unsigned integers using affine scaling v_quant = round((v - min) / (max - min) * 255). This compresses high-dimensional embedding vectors by 4x, cutting RAM usage from 1.54 GB per million 384-dimensional vectors down to ~384 MB and enabling AVX2 SIMD integer dot products.",
    url: "https://msmarco.org/passages/sq8_003",
  },
  {
    doc_id: 3,
    title: "Hierarchical Navigable Small World (HNSW) Graphs",
    body: "HNSW is a graph-based approximate nearest neighbor search algorithm. It constructs multi-layer navigable small-world networks with exponential step decay. Higher layers provide long-range highway links for logarithmic greedy routing, while layer 0 conducts dense beam search. Heuristic edge selection enforces neighbor diversity to prevent local clustering traps.",
    url: "https://msmarco.org/passages/hnsw_004",
  },
  {
    doc_id: 4,
    title: "Reciprocal Rank Fusion (RRF) for Hybrid Search",
    body: "Reciprocal Rank Fusion combines ranked candidates from heterogeneous retrieval pipelines, such as lexical BM25 and dense vector HNSW, without requiring calibrated score normalization. The formula RRF_Score(d) = 1 / (60 + rank_lexical) + 1 / (60 + rank_dense) rewards documents retrieved near the top of either or both modalities.",
    url: "https://msmarco.org/passages/rrf_005",
  },
  {
    doc_id: 5,
    title: "Cross-Encoder L2 Neural Reranking",
    body: "A Cross-Encoder feeds the concatenation of query tokens and document passage tokens through deep transformer layers to model full cross-attention token interactions. In two-stage retrieval architectures, the top 50 candidates from Reciprocal Rank Fusion are scored with a cross-encoder such as bge-reranker-base to deliver superior nDCG@10 relevance.",
    url: "https://msmarco.org/passages/ce_006",
  },
  {
    doc_id: 6,
    title: "BM25 Ranking Function in Information Retrieval",
    body: "BM25 is a probabilistic term-matching relevance function. It incorporates term frequency saturation controlled by parameter k1 and document length normalization governed by parameter b. Robertson-Spärck Jones IDF penalizes frequent terms across the corpus, establishing a strong baseline for lexical passage retrieval.",
    url: "https://msmarco.org/passages/bm25_007",
  },
  {
    doc_id: 7,
    title: "Rust Concurrency and Memory Safety",
    body: "Rust ensures memory safety without a garbage collector through its ownership, borrowing, and lifetime rules. Its concurrency primitives, including Rayon work-stealing thread pools and Tokio async runtimes, enable high-throughput multi-core batch indexing and sub-millisecond query evaluation without data races.",
    url: "https://msmarco.org/passages/rust_008",
  },
  {
    doc_id: 8,
    title: "MS MARCO Passage Ranking Benchmark",
    body: "MS MARCO (Microsoft Machine Reading Comprehension) is a large-scale information retrieval dataset comprising 8.8 million web passages extracted from Bing search results along with real human queries. The standard validation metric is Mean Reciprocal Rank at 10 (MRR@10) and normalized Discounted Cumulative Gain at 10 (nDCG@10).",
    url: "https://msmarco.org/passages/msmarco_009",
  },
  {
    doc_id: 9,
    title: "Memory-Mapped File I/O for Search Engines",
    body: "Memory mapping (mmap) allows disk-backed append-only document tables to be mapped directly into the process virtual address space. By keeping a fixed-width offset table (DocID * 8 bytes), the operating system page cache transparently handles fast random access to passage text without loading the entire 8.8 million string corpus into RAM.",
    url: "https://msmarco.org/passages/mmap_010",
  },
  {
    doc_id: 10,
    title: "SIMD Vector Intrinsics and AVX2 Acceleration",
    body: "Single Instruction Multiple Data (SIMD) architectures, including x86 AVX2 and ARM NEON, execute arithmetic operations on 128-bit, 256-bit, or 512-bit vector registers simultaneously. In quantized search engines, SIMD instructions accelerate 8-bit integer dot products and Elias-Fano bitmask operations across posting lists.",
    url: "https://msmarco.org/passages/simd_011",
  },
  {
    doc_id: 11,
    title: "Zero-Allocation Tokenizer and Porter Stemming",
    body: "High-throughput retrieval pipelines require zero-allocation lexers that process byte slices without allocating heap strings. The Porter stemming algorithm reduces inflected English words to their base grammatical roots (e.g., programming to program), expanding lexical recall across morphological word variants.",
    url: "https://msmarco.org/passages/token_012",
  },
  {
    doc_id: 12,
    title: "Transformer Self-Attention and ColBERT Late Interaction",
    body: "Self-attention allows tokens in a transformer encoder to attend to every other token with quadratic complexity. Late interaction architectures such as ColBERT compute token-level representations independently and evaluate MaxSim cross-product matrices at query time, striking a balance between dense bi-encoders and full cross-encoders.",
    url: "https://msmarco.org/passages/colbert_013",
  },
  {
    doc_id: 13,
    title: "p99 Latency Profiling and Tail Variance",
    body: "The 99th percentile (p99) latency measures the response time of the slowest 1% of queries in a distributed retrieval system. Maintaining sub-5ms p99 latency under high queries-per-second (QPS) requires minimizing lock contention, avoiding memory allocations on hot paths, and aggressive early pruning in Block-Max WAND.",
    url: "https://msmarco.org/passages/latency_014",
  },
  {
    doc_id: 14,
    title: "Criterion.rs Microbenchmarking for Systems Code",
    body: "Criterion.rs provides statistical microbenchmarking for Rust programs. It detects performance regressions, models execution variance using linear regression, and computes confidence intervals for hot loop functions such as SIMD integer dot products, Elias-Fano decompression, and HNSW beam exploration.",
    url: "https://msmarco.org/passages/criterion_015",
  },
];

export const INITIAL_STATS: EngineStats = {
  document_count: 15,
  vocabulary_size: 218,
  avg_doc_len: 44.6,
  elias_fano_bytes: 4280,
  uncompressed_posting_bytes: 17520,
  lexical_compression_ratio: 4.09,
  sq8_vector_bytes: 5760,
  f32_vector_bytes: 23040,
  dense_memory_savings_pct: 75.0,
  hnsw_layers: 4,
  hnsw_total_edges: 182,
};

export const QUERY_SUGGESTIONS = [
  "Block-Max WAND dynamic pruning inverted index",
  "Elias-Fano bitset integer compression",
  "Scalar quantization SQ8 vector embeddings",
  "HNSW graph approximate nearest neighbor search",
  "Reciprocal Rank Fusion hybrid retrieval formula",
  "Cross-encoder neural reranker transformer attention",
  "Rust concurrency Rayon memory safety",
  "SIMD vector intrinsics AVX2 integer dot product",
];

export function simulateLocalSearch(
  query: string,
  mode: 'hybrid' | 'lexical' | 'dense',
  top_k = 10,
  rrf_k = 60,
  rerank = true,
  passagesInput?: DocumentPassage[]
): SearchResponse {
  const passages = passagesInput || getActiveDataset().passages;
  const qLower = query.toLowerCase();
  const qWords = qLower.split(/\s+/).filter(w => w.length > 2);

  const scoredDocs = passages.map(doc => {
    const textLower = (doc.title + " " + doc.body).toLowerCase();
    
    // Lexical score
    let matchCount = 0;
    qWords.forEach(w => {
      if (textLower.includes(w)) matchCount++;
    });
    const bm25 = matchCount > 0 ? (matchCount * 2.8) + (doc.body.length / 400) : 0.05;

    // Dense score
    let denseSim = 0.3;
    qWords.forEach(w => {
      if (textLower.includes(w)) denseSim += 0.15;
    });
    denseSim = Math.min(0.98, denseSim + (doc.doc_id % 3) * 0.04);

    return {
      doc,
      bm25,
      denseSim,
    };
  });

  // Sort according to mode
  let hits = [];
  if (mode === 'lexical') {
    scoredDocs.sort((a, b) => b.bm25 - a.bm25);
    hits = scoredDocs.slice(0, top_k).map(item => ({
      doc_id: item.doc.doc_id,
      title: item.doc.title,
      snippet: item.doc.body.slice(0, 180) + "...",
      url: item.doc.url,
      final_score: Number(item.bm25.toFixed(3)),
      lexical_score: Number(item.bm25.toFixed(3)),
    }));
  } else if (mode === 'dense') {
    scoredDocs.sort((a, b) => b.denseSim - a.denseSim);
    hits = scoredDocs.slice(0, top_k).map(item => ({
      doc_id: item.doc.doc_id,
      title: item.doc.title,
      snippet: item.doc.body.slice(0, 180) + "...",
      url: item.doc.url,
      final_score: Number(item.denseSim.toFixed(3)),
      dense_score: Number(item.denseSim.toFixed(3)),
    }));
  } else {
    // Hybrid RRF
    const lexRanked = [...scoredDocs].sort((a, b) => b.bm25 - a.bm25);
    const denseRanked = [...scoredDocs].sort((a, b) => b.denseSim - a.denseSim);

    const fused = scoredDocs.map(item => {
      const lexIdx = lexRanked.findIndex(x => x.doc.doc_id === item.doc.doc_id) + 1;
      const denseIdx = denseRanked.findIndex(x => x.doc.doc_id === item.doc.doc_id) + 1;
      const rrf = (1.0 / (rrf_k + lexIdx)) + (1.0 / (rrf_k + denseIdx));
      const crossEncoderScore = rerank ? Math.min(0.99, rrf * 28 + (item.bm25 > 2 ? 0.35 : 0.05)) : rrf;

      return {
        item,
        lexIdx,
        denseIdx,
        rrf,
        crossEncoderScore,
      };
    });

    fused.sort((a, b) => rerank ? b.crossEncoderScore - a.crossEncoderScore : b.rrf - a.rrf);

    hits = fused.slice(0, top_k).map(f => ({
      doc_id: f.item.doc.doc_id,
      title: f.item.doc.title,
      snippet: f.item.doc.body.slice(0, 180) + "...",
      url: f.item.doc.url,
      final_score: Number((rerank ? f.crossEncoderScore : f.rrf).toFixed(4)),
      lexical_score: Number(f.item.bm25.toFixed(2)),
      dense_score: Number(f.item.denseSim.toFixed(3)),
      rrf_score: Number(f.rrf.toFixed(4)),
      rerank_score: rerank ? Number(f.crossEncoderScore.toFixed(4)) : undefined,
    }));
  }

  const lexical_ms = Number((0.08 + Math.random() * 0.06).toFixed(2));
  const dense_ms = Number((0.14 + Math.random() * 0.08).toFixed(2));
  const fusion_ms = mode === 'hybrid' ? 0.02 : 0;
  const rerank_ms = rerank && mode === 'hybrid' ? Number((0.09 + Math.random() * 0.05).toFixed(2)) : 0;
  const total_ms = Number((lexical_ms + dense_ms + fusion_ms + rerank_ms).toFixed(2));

  return {
    query,
    mode,
    total_hits: hits.length,
    results: hits,
    timing: {
      total_ms,
      lexical_ms,
      dense_ms,
      fusion_ms,
      rerank_ms,
    },
    metrics: {
      blocks_evaluated: 12,
      blocks_skipped: 74,
      pruning_ratio_pct: 86.0,
      docs_scored: 12,
      upper_layer_hops: 7,
      layer0_evaluations: 28,
    },
  };
}

export function simulateBenchmark(total_queries = 200, mode = 'hybrid'): BenchmarkResponse {
  const duration_ms = (total_queries * 0.38) + Math.random() * 10;
  const qps = (total_queries / (duration_ms / 1000.0));

  return {
    total_queries,
    total_duration_ms: Number(duration_ms.toFixed(1)),
    qps: Number(qps.toFixed(0)),
    avg_latency_ms: 0.38,
    p50_ms: 0.32,
    p90_ms: 0.54,
    p95_ms: 0.72,
    p99_ms: 1.15,
    max_latency_ms: 2.45,
    mode,
  };
}
