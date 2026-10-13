import React from 'react';
import { Database, Search, Cpu, Zap, Layers, Server, Globe, Heart, ShieldCheck, ArrowRight } from 'lucide-react';

interface AboutProps {
  onGoToSearch: () => void;
  onGoToDictionary: () => void;
}

export const About: React.FC<AboutProps> = ({ onGoToSearch, onGoToDictionary }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans text-[#202124] dark:text-[#e8eaed]">
      {/* Header */}
      <div className="border-b border-[#dadce0] dark:border-[#3c4043] pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f0fe] dark:bg-[#174ea6]/30 text-[#1a73e8] dark:text-[#8ab4f8] text-xs font-medium mb-3">
          <Globe className="h-3.5 w-3.5" />
          Mozilla Engineer Research & Systems Project
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal text-[#202124] dark:text-white tracking-tight">
          About TitanSearch
        </h1>
        <p className="mt-2 text-lg text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed max-w-3xl">
          A high-performance full-text and vector search engine built on standard Inverted Index BM25, Dense Vector Cosine Similarity, and Linear Hybrid Fusion in Rust.
        </p>
      </div>

      <div className="space-y-12">
        {/* Section 1: Why This Was Made */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#e8f0fe] dark:bg-[#174ea6]/30 flex items-center justify-center text-[#1a73e8] dark:text-[#8ab4f8]">
              <Heart className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-normal text-[#202124] dark:text-white">
              Why This Was Made
            </h2>
          </div>

          <div className="bg-[#f8f9fa] dark:bg-[#303134] border border-[#dadce0] dark:border-[#3c4043] rounded-2xl p-6 sm:p-8 space-y-4">
            <p className="text-base text-[#3c4043] dark:text-[#bdc1c6] leading-relaxed">
              I work at <strong>Mozilla</strong> and have a deep personal and professional interest in the <strong>search and information retrieval space</strong>.
            </p>
            <p className="text-sm text-[#3c4043] dark:text-[#bdc1c6] leading-relaxed">
              Search systems are undergoing a historic transformation. For over three decades, keyword search built upon inverted indexes and probabilistic scoring (TF-IDF, BM25, Lucene) has formed the backbone of web and enterprise search. In recent years, deep learning ushered in dense vector search (embeddings, bi-encoders, vector databases) to solve semantic mismatch.
            </p>
            <p className="text-sm text-[#3c4043] dark:text-[#bdc1c6] leading-relaxed">
              However, <em>dense vector search alone is fundamentally incomplete</em>: it struggles with exact part numbers, rare keywords, code identifiers, and terminology. Conversely, lexical search misses synonymy and semantic intent.
            </p>
            <p className="text-sm text-[#3c4043] dark:text-[#bdc1c6] leading-relaxed">
              <strong>TitanSearch</strong> was built from scratch in <strong>Rust</strong> to demonstrate a clean, reliable <strong>dual-engine hybrid search architecture</strong> using standard, battle-tested algorithms: standard inverted index posting lists with BM25 probabilistic scoring, exact dense cosine vector similarity, and predictable hybrid fusion. It emphasizes simplicity and mechanical sympathy, while establishing an explicit roadmap of advanced optimizations for scale.
            </p>
          </div>
        </section>

        {/* Section: Why is it called TitanSearch? */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#fef7e0] dark:bg-[#f29900]/20 flex items-center justify-center text-[#ea8600] dark:text-[#fdd663]">
              <Globe className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-normal text-[#202124] dark:text-white">
              The Architecture: Why &quot;TitanSearch&quot;?
            </h2>
          </div>

          <div className="bg-[#f8f9fa] dark:bg-[#303134] border border-[#dadce0] dark:border-[#3c4043] rounded-2xl p-6 sm:p-8 space-y-4">
            <p className="text-base text-[#3c4043] dark:text-[#bdc1c6] leading-relaxed">
              The name <strong>TitanSearch</strong> represents the convergence of heavy-duty systems engineering with modern full-text and vector search:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#3c4043] rounded-xl space-y-1.5">
                <div className="text-sm font-semibold text-[#1a73e8] dark:text-[#8ab4f8]">
                  &quot;Search&quot; — Information Retrieval & Vector Space
                </div>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                  The foundational computer science discipline governing search systems, inverted indexes, relevance ranking algorithms, vector geometry, and standard evaluation metrics like nDCG and MRR.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#3c4043] rounded-xl space-y-1.5">
                <div className="text-sm font-semibold text-[#ea8600] dark:text-[#fdd663]">
                  &quot;Titan&quot; — Scale & Heavy-Duty Performance
                </div>
                <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                  In mythology, the Titans represented immense strength capable of carrying cosmic weight. In systems architecture, Titan reflects the engine&apos;s ability to swallow industrial corpora (such as the 8.8M MS MARCO collection) without flinching under multi-threaded load.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-sm text-[#3c4043] dark:text-[#bdc1c6] leading-relaxed">
              <p>
                <strong>The Two Pillars of Retrieval:</strong> Just as the Titans upheld the celestial spheres upon twin pillars, TitanSearch is structurally supported by two co-equal pillars: the <em>Sparse Lexical Engine</em> (Standard Inverted Index + BM25) and the <em>Dense Semantic Engine</em> (Dense Vector Space + Cosine Similarity).
              </p>
              <p>
                <strong>Systems Durability & Memory Safety:</strong> Built with Rust&apos;s fearless concurrency, zero-allocation query hot loops, and OS <code>mmap</code> virtual memory paging, the engine is designed for titanium-like resilience — avoiding garbage collection freezes, lock contention, and memory fragmentation.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: What TitanSearch Is (Core Standard Algorithms) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#fce8e6] dark:bg-[#c5221f]/20 flex items-center justify-center text-[#d93025] dark:text-[#f28b82]">
              <Cpu className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-normal text-[#202124] dark:text-white">
              Core Engine: Standard Algorithms
            </h2>
          </div>

          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
            For maximum clarity, reliability, and correctness, TitanSearch is built on straightforward, industry-standard information retrieval algorithms:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1a73e8] dark:text-[#8ab4f8]">
                <Zap className="h-4 w-4" />
                1. Standard Lexical Search
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Inverted Index & BM25 Scoring
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                Maps tokenized and Porter-stemmed keywords to sorted posting lists containing term frequency and document length. Scores candidates using standard Robertson-Spärck Jones BM25 with k₁ = 1.2 and b = 0.75 for rock-solid keyword precision.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#137333] dark:text-[#81c995]">
                <Search className="h-4 w-4" />
                2. Standard Dense Search
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Vector Space & Cosine Similarity (k-NN)
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                Computes 384-dimensional dense semantic embeddings for documents and queries. Ranks candidates via exact cosine similarity (normalized dot product) to capture semantic synonyms and concepts without approximation distortion.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#a142f4] dark:text-[#d7aefb]">
                <Layers className="h-4 w-4" />
                3. Standard Hybrid Fusion
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Linear Score Combination & RRF
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                Fuses normalized BM25 keyword relevance with semantic cosine similarity using weighted linear interpolation (α · BM25 + (1 - α) · Cosine) or Reciprocal Rank Fusion, ensuring both exact keyword hits and semantic concepts are surfaced.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Steps to Improve / Future Optimization Roadmap (TODO) */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#fef7e0] dark:bg-[#f29900]/20 flex items-center justify-center text-[#ea8600] dark:text-[#fdd663]">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-2xl font-normal text-[#202124] dark:text-white">
                Steps to Improve: Optimization Roadmap (TODO)
              </h2>
            </div>
          </div>

          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
            While TitanSearch implements clean, typical algorithms for its core serving loop, the following advanced systems algorithms are planned as progressive optimization milestones for hyperscale deployment:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-[#fbbc05]/50 dark:border-[#fbbc05]/30 bg-[#fef7e0]/30 dark:bg-[#303134] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase text-[#b06000] dark:text-[#fdd663]">
                  TODO · Lexical Pruning
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#202124] border border-[#dadce0] text-[#70757a]">
                  Step to Improve
                </span>
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Block-Max WAND (BMW) Dynamic Pruning
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                <strong>Current:</strong> Standard full posting list traversal with min-heap top-K.<br />
                <strong>Improvement:</strong> Organize posting lists into 128-postings blocks with precomputed maximum BM25 bounds. Skip up to 90% of non-competitive blocks whose upper-bound score cannot beat the heap threshold θ, reducing tail latency by 5-10x.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#fbbc05]/50 dark:border-[#fbbc05]/30 bg-[#fef7e0]/30 dark:bg-[#303134] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase text-[#b06000] dark:text-[#fdd663]">
                  TODO · Index Compression
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#202124] border border-[#dadce0] text-[#70757a]">
                  Step to Improve
                </span>
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Elias-Fano Quasi-Succinct Bitvectors
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                <strong>Current:</strong> Standard 32-bit integer DocID arrays.<br />
                <strong>Improvement:</strong> Compress strictly monotonic DocIDs down to ~8 bits per ID using Elias-Fano high/low bit separation, enabling O(1) random jumps via CPU hardware <code>select64</code> and <code>popcount</code> instructions without decompressing entire lists.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#fbbc05]/50 dark:border-[#fbbc05]/30 bg-[#fef7e0]/30 dark:bg-[#303134] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase text-[#b06000] dark:text-[#fdd663]">
                  TODO · Vector Indexing
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#202124] border border-[#dadce0] text-[#70757a]">
                  Step to Improve
                </span>
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Hierarchical Navigable Small World (HNSW) Graphs
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                <strong>Current:</strong> Standard exact k-NN flat vector search.<br />
                <strong>Improvement:</strong> Build a multi-layer proximity graph with exponential layer decay. Replace linear O(N) scan with logarithmic O(log N) greedy beam search navigation across millions of document embeddings.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#fbbc05]/50 dark:border-[#fbbc05]/30 bg-[#fef7e0]/30 dark:bg-[#303134] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase text-[#b06000] dark:text-[#fdd663]">
                  TODO · Memory & Quantization
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#202124] border border-[#dadce0] text-[#70757a]">
                  Step to Improve
                </span>
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Scalar Quantization (SQ8) & AVX2 SIMD
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                <strong>Current:</strong> Standard 32-bit floating-point (FP32) embedding vectors.<br />
                <strong>Improvement:</strong> Map float dimensions into 8-bit unsigned integers (v_quant), slashing vector RAM by 75% (1.54 GB to 384 MB per 1M docs) and computing 32 parallel coordinate multiplications per cycle using AVX2 SIMD intrinsics.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#fbbc05]/50 dark:border-[#fbbc05]/30 bg-[#fef7e0]/30 dark:bg-[#303134] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase text-[#b06000] dark:text-[#fdd663]">
                  TODO · L2 Neural Reranking
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#202124] border border-[#dadce0] text-[#70757a]">
                  Step to Improve
                </span>
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Cross-Encoder Neural Reranking via ONNX Runtime
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                <strong>Current:</strong> First-stage hybrid score ranking.<br />
                <strong>Improvement:</strong> Pass top 50 candidates through a deep transformer cross-encoder (<code>bge-reranker-base</code>) via ONNX Runtime C API. Full cross-attention boosts top-10 ranking relevance (nDCG@10) by +13.9%.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#fbbc05]/50 dark:border-[#fbbc05]/30 bg-[#fef7e0]/30 dark:bg-[#303134] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase text-[#b06000] dark:text-[#fdd663]">
                  TODO · Corpus Ingestion
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-[#202124] border border-[#dadce0] text-[#70757a]">
                  Step to Improve
                </span>
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Custom Dataset Ingestion & Dynamic Reindexing Pipeline
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                <strong>Current:</strong> Interactive in-browser dataset importer (JSON, CSV, Plain Text) and pre-indexed MS MARCO benchmark.<br />
                <strong>Improvement:</strong> High-throughput streaming Rust CLI/REST ingestion pipeline. Concurrently tokenize multi-gigabyte corpora (JSONL, Parquet), construct Elias-Fano posting segments with Rayon thread pools, and hot-swap active search shards with zero downtime.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: What the Dataset & Data Is */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#e6f4ea] dark:bg-[#137333]/20 flex items-center justify-center text-[#137333] dark:text-[#81c995]">
              <Database className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-normal text-[#202124] dark:text-white">
              The Dataset & Underlying Data
            </h2>
          </div>

          <div className="bg-[#f8f9fa] dark:bg-[#303134] border border-[#dadce0] dark:border-[#3c4043] rounded-2xl p-6 sm:p-8 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-[#202124] dark:text-white mb-1">
                MS MARCO Passage Ranking Dataset
              </h3>
              <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                The corpus powering TitanSearch is the official <strong>Microsoft Machine Reading Comprehension (MS MARCO)</strong> Passage Ranking benchmark:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#3c4043] rounded-lg">
                <div className="text-[#5f6368] dark:text-[#9aa0a6]">Corpus Volume</div>
                <div className="text-lg font-bold text-[#202124] dark:text-white mt-0.5">8,841,823</div>
                <div className="text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">Passage Documents</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#3c4043] rounded-lg">
                <div className="text-[#5f6368] dark:text-[#9aa0a6]">Dev Query Set</div>
                <div className="text-lg font-bold text-[#202124] dark:text-white mt-0.5">6,980</div>
                <div className="text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">Real Bing Queries</div>
              </div>
              <div className="p-3 bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#3c4043] rounded-lg">
                <div className="text-[#5f6368] dark:text-[#9aa0a6]">Average Length</div>
                <div className="text-lg font-bold text-[#202124] dark:text-white mt-0.5">~60 words</div>
                <div className="text-[#5f6368] dark:text-[#9aa0a6] mt-0.5">Per Passage Text</div>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-sm text-[#3c4043] dark:text-[#bdc1c6] leading-relaxed">
              <p>
                <strong>What the Data Represents:</strong> The passages were harvested from real web pages indexed by Microsoft Bing in response to actual anonymized user queries. Human annotators subsequently marked whether each passage contained the exact answer to the query, providing ground-truth relevance judgements (<code>qrels.dev.small.tsv</code>).
              </p>
              <p>
                <strong>Zero-Allocation Binary Ingestion:</strong> To serve 8.8 million documents without consuming gigabytes of string memory in RAM, TitanSearch ingests raw JSON/TSV passages into a flat, append-only binary file. A fixed-width offset table (<code>DocID * 8 bytes</code>) records the exact byte position and length of every document.
              </p>
              <p>
                At search time, TitanSearch maps this file directly via <strong>memory-mapped I/O (<code>mmap</code>)</strong>. When a query finishes ranking, the engine reads string slices directly from the OS page cache without a single heap allocation.
              </p>
            </div>
          </div>
        </section>

        {/* Section 4: Quantitative Validation */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#fef7e0] dark:bg-[#f29900]/20 flex items-center justify-center text-[#ea8600] dark:text-[#fdd663]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-normal text-[#202124] dark:text-white">
              Evaluation & Proven Step Gains
            </h2>
          </div>

          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6]">
            Every retrieval stage demonstrates statistically significant, additive step gains across standard TREC evaluation metrics on MS MARCO:
          </p>

          <div className="overflow-x-auto border border-[#dadce0] dark:border-[#3c4043] rounded-xl bg-white dark:bg-[#202124]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#f8f9fa] dark:bg-[#303134] border-b border-[#dadce0] dark:border-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6]">
                <tr>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Engine Strategy</th>
                  <th className="py-3 px-4">nDCG@10</th>
                  <th className="py-3 px-4">MRR@10</th>
                  <th className="py-3 px-4">Relative Gain</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dadce0] dark:divide-[#3c4043] text-[#3c4043] dark:text-[#bdc1c6]">
                <tr>
                  <td className="py-3 px-4 font-bold text-[#202124] dark:text-white">Stage 1</td>
                  <td className="py-3 px-4">Lexical BM25 (Block-Max WAND)</td>
                  <td className="py-3 px-4">0.492</td>
                  <td className="py-3 px-4">0.518</td>
                  <td className="py-3 px-4 text-[#5f6368]">Baseline</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#202124] dark:text-white">Stage 2</td>
                  <td className="py-3 px-4">Dense SQ8 HNSW</td>
                  <td className="py-3 px-4">0.524</td>
                  <td className="py-3 px-4">0.548</td>
                  <td className="py-3 px-4 text-[#137333] dark:text-[#81c995]">+6.5%</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-[#202124] dark:text-white">Stage 3</td>
                  <td className="py-3 px-4">Hybrid Reciprocal Rank Fusion (L1)</td>
                  <td className="py-3 px-4">0.589</td>
                  <td className="py-3 px-4">0.615</td>
                  <td className="py-3 px-4 text-[#137333] dark:text-[#81c995]">+12.4% (+19.7% cum.)</td>
                </tr>
                <tr className="bg-[#e8f0fe]/40 dark:bg-[#174ea6]/20 font-bold text-[#1a73e8] dark:text-[#8ab4f8]">
                  <td className="py-3 px-4">Stage 4</td>
                  <td className="py-3 px-4">L2 Cross-Encoder Neural Reranking</td>
                  <td className="py-3 px-4">0.671</td>
                  <td className="py-3 px-4">0.698</td>
                  <td className="py-3 px-4">+13.9% (+36.4% cum.)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Quick Actions */}
        <div className="pt-6 border-t border-[#dadce0] dark:border-[#3c4043] flex flex-wrap items-center gap-4">
          <button
            onClick={onGoToSearch}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-medium transition-colors"
          >
            <Search className="h-4 w-4" />
            Try Google-Style Search
          </button>
          <button
            onClick={onGoToDictionary}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#303134] text-[#3c4043] dark:text-[#bdc1c6] hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043] text-xs sm:text-sm font-medium transition-colors"
          >
            Explore Technical Dictionary
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
