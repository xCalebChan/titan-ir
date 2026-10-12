import React, { useState } from 'react';
import { Layers, Zap, GitBranch, Cpu, Filter, CheckCircle2, ChevronRight, Code } from 'lucide-react';

interface StageDetail {
  id: string;
  name: string;
  crate: string;
  role: string;
  algorithm: string;
  mathFormula?: string;
  complexity: string;
  keyFeature: string;
}

const STAGES: StageDetail[] = [
  {
    id: 'ingestion',
    name: 'Corpus Ingestion & Flat Storage',
    crate: 'crates/index-core/src/doc_store.rs',
    role: 'Document Ingestion & Binary Storage',
    algorithm: 'Fixed-width offset table (DocID * 8 bytes) mapped via mmap',
    complexity: 'O(1) random access, zero heap RAM strings',
    keyFeature: 'Appends raw JSON/UTF-8 documents to a flat append-only binary file. The OS page cache serves random accesses on-demand without loading 8.8M documents into application memory.',
  },
  {
    id: 'lexical',
    name: 'Lexical Engine: SIMD Elias-Fano & BMW',
    crate: 'crates/lexical-engine/src/wand.rs',
    role: 'Sparse Keyword Inverted Retrieval',
    algorithm: 'Elias-Fano bitvector compression + Block-Max WAND dynamic pruning',
    mathFormula: 'BM25(D, Q) = \\sum_{t \\in Q} IDF(t) \\cdot \\frac{f(t, D) \\cdot (k_1 + 1)}{f(t, D) + k_1 \\cdot (1 - b + b \\cdot \\frac{|D|}{\\text{avgdl}})}',
    complexity: 'Sub-linear pruning, skips up to 90% of posting blocks',
    keyFeature: 'Splits posting lists into 128-postings blocks with max_doc_id and max_term_score. Dynamically skips blocks whose maximum theoretical BM25 score cannot surpass top-K heap threshold theta.',
  },
  {
    id: 'dense',
    name: 'Dense Engine: SQ8 Quantized HNSW',
    crate: 'crates/dense-engine/src/hnsw.rs',
    role: 'Dense Semantic Vector Retrieval',
    algorithm: 'Hierarchical Navigable Small World + 8-bit Scalar Quantization',
    mathFormula: 'v_{\\text{quant}} = \\left\\lfloor \\frac{v - v_{\\min}}{v_{\\max} - v_{\\min}} \\cdot 255 \\right\\rceil',
    complexity: 'O(\\log N) greedy beam search navigation',
    keyFeature: 'Compresses 384-dimensional embedding vectors by 4x (1.54 GB down to 384 MB per 1M docs). Uses heuristic edge selection to enforce neighbor diversity and avoid clustering traps.',
  },
  {
    id: 'rrf',
    name: 'Reciprocal Rank Fusion (L1)',
    crate: 'crates/reranker/src/rrf.rs',
    role: 'Candidate Merging & Normalization-Free Fusion',
    algorithm: 'Rank-based candidate deduplication and reciprocal weighting',
    mathFormula: 'RRF\\_Score(d) = \\frac{1}{60 + \\text{rank}_{\\text{lexical}}(d)} + \\frac{1}{60 + \\text{rank}_{\\text{dense}}(d)}',
    complexity: 'O(K \\log K) merging across 1,000 top candidates',
    keyFeature: 'Fuses heterogeneous lexical and vector scores without requiring cross-calibration. Documents ranking near the top of either or both pipelines bubble to the top 50 pool.',
  },
  {
    id: 'reranker',
    name: 'Cross-Encoder Reranker (L2)',
    crate: 'crates/reranker/src/cross_encoder.rs',
    role: 'Deep Neural Cross-Attention Relevance Scoring',
    algorithm: 'Full token-level interaction matrix with logistic sigmoid activation',
    mathFormula: 'P(\\text{relevant} \\mid Q, D) = \\sigma\\left(\\text{Transformer}([Q; [SEP]; D])\\right)',
    complexity: 'O(K \\cdot |Q| \\cdot |D|) on top 50 candidates only',
    keyFeature: 'Scores (Query, DocText) pairs to capture fine-grained semantic nuances and syntactic alignment, lifting nDCG@10 from 0.589 up to 0.671.',
  },
];

export const PipelineFlow: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<StageDetail>(STAGES[1]);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          System Architecture & Pipeline Flow
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Click on any pipeline component below to inspect its data structures, time complexity, and Rust implementation crate.
        </p>
      </div>

      {/* Visual Pipeline Layout */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md mb-8">
        {/* Top: Corpus Ingestion */}
        <div className="flex justify-center mb-6">
          <div
            onClick={() => setSelectedStage(STAGES[0])}
            className={`cursor-pointer px-6 py-3 rounded-xl border transition-all text-center ${
              selectedStage.id === 'ingestion'
                ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs uppercase font-semibold text-slate-400 tracking-wider">Corpus Ingestion</div>
            <div className="text-sm font-bold text-white">MS MARCO / Wikipedia Dump (8.8M Docs)</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">mmap Offset Table (DocID * 8 bytes)</div>
          </div>
        </div>

        {/* Fork Arrow */}
        <div className="flex justify-center -my-3">
          <div className="w-1/2 border-t-2 border-indigo-500/40 relative">
            <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-indigo-500"></div>
            <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-indigo-500"></div>
          </div>
        </div>

        {/* Dual Engines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          {/* Lexical Engine */}
          <div
            onClick={() => setSelectedStage(STAGES[1])}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              selectedStage.id === 'lexical'
                ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-indigo-400 tracking-wider flex items-center gap-1.5">
                <Zap className="h-4 w-4" /> Lexical Engine (Rust)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/20">
                O(log N) Pruning
              </span>
            </div>
            <h4 className="text-base font-bold text-white">SIMD Elias-Fano & Block-Max WAND</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 mt-3 font-mono">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Zero-allocation Porter Stemmer</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 128-posting Elias-Fano blocks</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Dynamic score upper bounds (theta)</li>
            </ul>
          </div>

          {/* Dense Engine */}
          <div
            onClick={() => setSelectedStage(STAGES[2])}
            className={`cursor-pointer p-5 rounded-xl border transition-all ${
              selectedStage.id === 'dense'
                ? 'bg-cyan-600/20 border-cyan-500 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                <GitBranch className="h-4 w-4" /> Dense Engine (Rust)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono border border-cyan-500/20">
                -75% RAM (SQ8)
              </span>
            </div>
            <h4 className="text-base font-bold text-white">Quantized HNSW Graph Traversal</h4>
            <ul className="text-xs text-slate-300 space-y-1.5 mt-3 font-mono">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> SQ8 8-bit Scalar Quantization</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Multi-layer navigable small world</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Heuristic diversity edge selection</li>
            </ul>
          </div>
        </div>

        {/* Join Arrow */}
        <div className="flex justify-center -my-3">
          <div className="w-1/2 border-b-2 border-indigo-500/40 relative">
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 rotate-45 border-r-2 border-b-2 border-indigo-400"></div>
          </div>
        </div>

        {/* L1 Fusion Node */}
        <div className="flex justify-center mt-6 mb-4">
          <div
            onClick={() => setSelectedStage(STAGES[3])}
            className={`cursor-pointer px-6 py-3.5 rounded-xl border transition-all text-center max-w-md w-full ${
              selectedStage.id === 'rrf'
                ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/20'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs uppercase font-semibold text-purple-400 tracking-wider">Reciprocal Rank Fusion (L1)</div>
            <div className="text-sm font-bold text-white">Merge Top-1,000 Deduplicated Candidates</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">RRF Score = 1/(60 + rank_lex) + 1/(60 + rank_dense)</div>
          </div>
        </div>

        <div className="flex justify-center my-2 text-indigo-400">
          <ChevronRight className="h-5 w-5 rotate-90" />
        </div>

        {/* L2 Reranker Node */}
        <div className="flex justify-center">
          <div
            onClick={() => setSelectedStage(STAGES[4])}
            className={`cursor-pointer px-6 py-3.5 rounded-xl border transition-all text-center max-w-md w-full ${
              selectedStage.id === 'reranker'
                ? 'bg-emerald-600/20 border-emerald-500 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-xs uppercase font-semibold text-emerald-400 tracking-wider">Cross-Encoder Reranker (L2)</div>
            <div className="text-sm font-bold text-white">Neural Token Cross-Attention on Top 50</div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">Yields Final Top-10 Results (nDCG@10 = 0.671)</div>
          </div>
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">{selectedStage.role}</span>
            <h3 className="text-xl font-bold text-white">{selectedStage.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono flex items-center gap-1.5">
              <Code className="h-3.5 w-3.5 text-indigo-400" />
              {selectedStage.crate}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Architecture & Mechanism</h5>
            <p className="text-sm text-slate-200 leading-relaxed">{selectedStage.keyFeature}</p>

            <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Complexity & Guarantees</div>
              <div className="text-sm text-emerald-400 font-mono font-medium">{selectedStage.complexity}</div>
            </div>
          </div>

          <div>
            {selectedStage.mathFormula && (
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Mathematical Formulation</h5>
                <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800 overflow-x-auto">
                  {selectedStage.mathFormula}
                </div>
              </div>
            )}

            <div className="mt-4">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Algorithmic Design</h5>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                {selectedStage.algorithm}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
