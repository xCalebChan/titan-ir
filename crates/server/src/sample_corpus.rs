use index_core::DocRecord;

/// Returns a realistic, diverse set of MS MARCO passage benchmark documents
/// covering machine learning, search systems, hardware architecture, science, and history.
pub fn get_sample_msmarco_passages() -> Vec<DocRecord> {
    vec![
        DocRecord::new(
            0,
            "Block-Max WAND Pruning Algorithm",
            "Block-Max WAND (Weak AND) is an index traversal and dynamic pruning algorithm for inverted indexes. It organizes postings into Elias-Fano compressed blocks, tracking upper-bound BM25 term scores per block. When a query is evaluated, entire blocks whose score contributions cannot beat the current top-K minimum threshold theta are skipped, dramatically accelerating top-K document retrieval.",
            Some("https://msmarco.org/passages/bmw_001".into()),
        ),
        DocRecord::new(
            1,
            "Elias-Fano Bitset Compression",
            "Elias-Fano is a quasi-succinct representation for strictly increasing integer sequences. By splitting 32-bit document IDs into high bits stored unary in a bitvector and low bits packed tightly, Elias-Fano achieves near-optimal Shannon entropy storage and provides sub-microsecond random access and next_geq binary search jumps without decoding entire posting lists.",
            Some("https://msmarco.org/passages/ef_002".into()),
        ),
        DocRecord::new(
            2,
            "Scalar Quantization (SQ8) for Vector Embeddings",
            "Scalar Quantization (SQ8) maps 32-bit floating-point embedding coordinates into 8-bit unsigned integers using affine scaling v_quant = round((v - min) / (max - min) * 255). This compresses high-dimensional embedding vectors by 4x, cutting RAM usage from 1.54 GB per million 384-dimensional vectors down to ~384 MB and enabling AVX2 SIMD integer dot products.",
            Some("https://msmarco.org/passages/sq8_003".into()),
        ),
        DocRecord::new(
            3,
            "Hierarchical Navigable Small World (HNSW) Graphs",
            "HNSW is a graph-based approximate nearest neighbor search algorithm. It constructs multi-layer navigable small-world networks with exponential step decay. Higher layers provide long-range highway links for logarithmic greedy routing, while layer 0 conducts dense beam search. Heuristic edge selection enforces neighbor diversity to prevent local clustering traps.",
            Some("https://msmarco.org/passages/hnsw_004".into()),
        ),
        DocRecord::new(
            4,
            "Reciprocal Rank Fusion (RRF) for Hybrid Search",
            "Reciprocal Rank Fusion combines ranked candidates from heterogeneous retrieval pipelines, such as lexical BM25 and dense vector HNSW, without requiring calibrated score normalization. The formula RRF_Score(d) = 1 / (60 + rank_lexical) + 1 / (60 + rank_dense) rewards documents retrieved near the top of either or both modalities.",
            Some("https://msmarco.org/passages/rrf_005".into()),
        ),
        DocRecord::new(
            5,
            "Cross-Encoder L2 Neural Reranking",
            "A Cross-Encoder feeds the concatenation of query tokens and document passage tokens through deep transformer layers to model full cross-attention token interactions. In two-stage retrieval architectures, the top 50 candidates from Reciprocal Rank Fusion are scored with a cross-encoder such as bge-reranker-base to deliver superior nDCG@10 relevance.",
            Some("https://msmarco.org/passages/ce_006".into()),
        ),
        DocRecord::new(
            6,
            "BM25 Ranking Function in Information Retrieval",
            "BM25 is a probabilistic term-matching relevance function. It incorporates term frequency saturation controlled by parameter k1 and document length normalization governed by parameter b. Robertson-Spärck Jones IDF penalizes frequent terms across the corpus, establishing a strong baseline for lexical passage retrieval.",
            Some("https://msmarco.org/passages/bm25_007".into()),
        ),
        DocRecord::new(
            7,
            "Rust Concurrency and Memory Safety",
            "Rust ensures memory safety without a garbage collector through its ownership, borrowing, and lifetime rules. Its concurrency primitives, including Rayon work-stealing thread pools and Tokio async runtimes, enable high-throughput multi-core batch indexing and sub-millisecond query evaluation without data races.",
            Some("https://msmarco.org/passages/rust_008".into()),
        ),
        DocRecord::new(
            8,
            "MS MARCO Passage Ranking Benchmark",
            "MS MARCO (Microsoft Machine Reading Comprehension) is a large-scale information retrieval dataset comprising 8.8 million web passages extracted from Bing search results along with real human queries. The standard validation metric is Mean Reciprocal Rank at 10 (MRR@10) and normalized Discounted Cumulative Gain at 10 (nDCG@10).",
            Some("https://msmarco.org/passages/msmarco_009".into()),
        ),
        DocRecord::new(
            9,
            "Memory-Mapped File I/O for Search Engines",
            "Memory mapping (mmap) allows disk-backed append-only document tables to be mapped directly into the process virtual address space. By keeping a fixed-width offset table (DocID * 8 bytes), the operating system page cache transparently handles fast random access to passage text without loading the entire 8.8 million string corpus into RAM.",
            Some("https://msmarco.org/passages/mmap_010".into()),
        ),
        DocRecord::new(
            10,
            "SIMD Vector Intrinsics and AVX2 Acceleration",
            "Single Instruction Multiple Data (SIMD) architectures, including x86 AVX2 and ARM NEON, execute arithmetic operations on 128-bit, 256-bit, or 512-bit vector registers simultaneously. In quantized search engines, SIMD instructions accelerate 8-bit integer dot products and Elias-Fano bitmask operations across posting lists.",
            Some("https://msmarco.org/passages/simd_011".into()),
        ),
        DocRecord::new(
            11,
            "Zero-Allocation Tokenizer and Porter Stemming",
            "High-throughput retrieval pipelines require zero-allocation lexers that process byte slices without allocating heap strings. The Porter stemming algorithm reduces inflected English words to their base grammatical roots (e.g., programming to program), expanding lexical recall across morphological word variants.",
            Some("https://msmarco.org/passages/token_012".into()),
        ),
        DocRecord::new(
            12,
            "Transformer Self-Attention and ColBERT Late Interaction",
            "Self-attention allows tokens in a transformer encoder to attend to every other token with quadratic complexity. Late interaction architectures such as ColBERT compute token-level representations independently and evaluate MaxSim cross-product matrices at query time, striking a balance between dense bi-encoders and full cross-encoders.",
            Some("https://msmarco.org/passages/colbert_013".into()),
        ),
        DocRecord::new(
            13,
            "p99 Latency Profiling and Tail Variance",
            "The 99th percentile (p99) latency measures the response time of the slowest 1% of queries in a distributed retrieval system. Maintaining sub-5ms p99 latency under high queries-per-second (QPS) requires minimizing lock contention, avoiding memory allocations on hot paths, and aggressive early pruning in Block-Max WAND.",
            Some("https://msmarco.org/passages/latency_014".into()),
        ),
        DocRecord::new(
            14,
            "Criterion.rs Microbenchmarking for Systems Code",
            "Criterion.rs provides statistical microbenchmarking for Rust programs. It detects performance regressions, models execution variance using linear regression, and computes confidence intervals for hot loop functions such as SIMD integer dot products, Elias-Fano decompression, and HNSW beam exploration.",
            Some("https://msmarco.org/passages/criterion_015".into()),
        ),
    ]
}
