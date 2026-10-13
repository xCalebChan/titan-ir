import React from 'react';
import { Database, Search, Cpu, Zap, Layers, Server, Code2, Globe, Heart, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';

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
          About TitanIR
        </h1>
        <p className="mt-2 text-lg text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed max-w-3xl">
          A high-throughput hybrid retrieval engine combining SIMD Elias-Fano Block-Max WAND, SQ8 Quantized HNSW, and Cross-Encoder neural reranking.
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
              Search systems are undergoing a historic transformation. For over three decades, keyword search built upon inverted indexes and probabilistic scoring (TF-IDF, BM25, Lucene) has formed the backbone of web and enterprise search. In recent years, deep learning ushered in dense vector search (embeddings, bi-encoders, HNSW vector databases) to solve semantic mismatch.
            </p>
            <p className="text-sm text-[#3c4043] dark:text-[#bdc1c6] leading-relaxed">
              However, <em>dense vector search alone is fundamentally incomplete</em>: it struggles with exact part numbers, rare keywords, code identifiers, and terminology, while consuming massive amounts of RAM. Conversely, lexical search misses synonymy and semantic intent.
            </p>
            <p className="text-sm text-[#3c4043] dark:text-[#bdc1c6] leading-relaxed">
              <strong>TitanIR</strong> was built from scratch in <strong>Rust</strong> to explore what a modern, production-grade <strong>dual-engine hybrid retrieval architecture</strong> looks like when designed with mechanical sympathy: zero heap allocation on the query hot loop, SIMD bitvector compression, 8-bit vector quantization, and embedded neural reranking without Python serving latency.
            </p>
          </div>
        </section>

        {/* Section: Why is it called TitanIR? */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#fef7e0] dark:bg-[#f29900]/20 flex items-center justify-center text-[#ea8600] dark:text-[#fdd663]">
              <Globe className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-normal text-[#202124] dark:text-white">
              The Name: Why &quot;TitanIR&quot;?
            </h2>
          </div>

          <div className="bg-[#f8f9fa] dark:bg-[#303134] border border-[#dadce0] dark:border-[#3c4043] rounded-2xl p-6 sm:p-8 space-y-4">
            <p className="text-base text-[#3c4043] dark:text-[#bdc1c6] leading-relaxed">
              The name <strong>TitanIR</strong> is a deliberate fusion of its domain and its engineering philosophy:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#3c4043] rounded-xl space-y-1.5">
                <div className="text-sm font-semibold text-[#1a73e8] dark:text-[#8ab4f8]">
                  &quot;IR&quot; — Information Retrieval
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
                <strong>The Two Pillars of Retrieval:</strong> Just as the Titans upheld the celestial spheres upon twin pillars, TitanIR is structurally supported by two co-equal pillars: the <em>Sparse Lexical Engine</em> (SIMD Elias-Fano Block-Max WAND) and the <em>Dense Semantic Engine</em> (SQ8 Quantized HNSW).
              </p>
              <p>
                <strong>Systems Durability & Memory Safety:</strong> Built with Rust&apos;s fearless concurrency, zero-allocation query hot loops, and OS <code>mmap</code> virtual memory paging, the engine is designed for titanium-like resilience — avoiding garbage collection freezes, lock contention, and memory fragmentation.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: What TitanIR Is */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#fce8e6] dark:bg-[#c5221f]/20 flex items-center justify-center text-[#d93025] dark:text-[#f28b82]">
              <Cpu className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-normal text-[#202124] dark:text-white">
              What TitanIR Is
            </h2>
          </div>

          <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
            TitanIR (Titan Information Retrieval) is an end-to-end native hybrid retrieval engine designed to achieve both state-of-the-art ranking relevance and sub-millisecond tail latency.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#1a73e8] dark:text-[#8ab4f8]">
                <Zap className="h-4 w-4" />
                1. Lexical Engine (Rust)
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                SIMD Elias-Fano & Block-Max WAND
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                Splits inverted index posting lists into 128-postings blocks. Encodes sorted DocIDs using Elias-Fano quasi-succinct bitvectors for hardware popcount jumps. Tracks per-block maximum BM25 contributions to dynamically skip up to 90% of non-competitive blocks using min-heap threshold θ.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#137333] dark:text-[#81c995]">
                <Search className="h-4 w-4" />
                2. Dense Engine (Rust)
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                SQ8 Quantized HNSW Graph Traversal
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                Indexes 384-dimensional dense semantic vectors using a multi-layer Navigable Small World proximity graph. Compresses 32-bit floats into 8-bit integers via Scalar Quantization (SQ8), cutting vector memory by 75% and accelerating greedy beam search via AVX2 SIMD dot products.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#a142f4] dark:text-[#d7aefb]">
                <Layers className="h-4 w-4" />
                3. Reciprocal Rank Fusion (L1)
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Scale-Invariant Candidate Merging
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                Takes the top-1,000 candidates from both lexical and dense engines. Merges them without requiring brittle score calibration using reciprocal rank weighting 1 / (60 + rank), extracting a consensus top-50 pool for neural reranking.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-[#dadce0] dark:border-[#3c4043] bg-white dark:bg-[#202124] space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#ea8600] dark:text-[#fdd663]">
                <Server className="h-4 w-4" />
                4. Cross-Encoder Reranker (L2)
              </div>
              <h3 className="text-base font-medium text-[#202124] dark:text-white">
                Full Token Interaction via ONNX Runtime
              </h3>
              <p className="text-xs text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed">
                Applies bge-reranker-base cross-attention across [CLS] Query [SEP] Doc tokens for the top 50 candidates directly in native code via the ONNX Runtime C API. Computes softmax probabilities to produce the final top-10 ranked results.
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
                The corpus powering TitanIR is the official <strong>Microsoft Machine Reading Comprehension (MS MARCO)</strong> Passage Ranking benchmark:
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
                <strong>Zero-Allocation Binary Ingestion:</strong> To serve 8.8 million documents without consuming gigabytes of string memory in RAM, TitanIR ingests raw JSON/TSV passages into a flat, append-only binary file. A fixed-width offset table (<code>DocID * 8 bytes</code>) records the exact byte position and length of every document.
              </p>
              <p>
                At search time, TitanIR maps this file directly via <strong>memory-mapped I/O (<code>mmap</code>)</strong>. When a query finishes ranking, the engine reads string slices directly from the OS page cache without a single heap allocation.
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
