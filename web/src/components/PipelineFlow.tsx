import React, { useState } from 'react';
import { Layers, Zap, GitBranch, Cpu, Filter, CheckCircle2, ChevronRight, Code, Terminal } from 'lucide-react';

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
    mathFormula: 'S(Q, D) = \\sigma(W \\cdot \\text{BERT}_{\\text{pool}}(\\text{[CLS]} \\circ Q \\circ \\text{[SEP]} \\circ D))',
    complexity: 'O((|Q| + |D|)^2) evaluated strictly over top-50 candidates',
    keyFeature: 'Loads native ONNX Runtime C bindings (bge-reranker-base) directly in native code without Python serving overhead. Yields the final +13.9% boost in nDCG@10.',
  },
];

export const PipelineFlow: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<StageDetail>(STAGES[1]);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono mb-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-400" />
          End-to-End System Blueprint
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Retrieval Pipeline Architecture
        </h2>
        <p className="mt-1 text-sm text-zinc-400 max-w-3xl">
          Dual-engine retrieval pipeline: concurrent sparse inverted and dense vector searches merged via Reciprocal Rank Fusion and finalized with Cross-Encoder attention. Click any stage to inspect.
        </p>
      </div>

      {/* Visual Pipeline Layout */}
      <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 mb-8">
        {/* Top: Corpus Ingestion */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setSelectedStage(STAGES[0])}
            className={`w-full max-w-md px-5 py-3 rounded-lg border transition-colors text-center ${
              selectedStage.id === 'ingestion'
                ? 'bg-zinc-850 border-zinc-600'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="text-[11px] uppercase font-mono text-zinc-500 tracking-wider">Corpus Ingestion</div>
            <div className="text-sm font-semibold text-white">MS MARCO / Wikipedia Corpus (8.8M Docs)</div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">mmap Fixed-Width Offset Table (DocID * 8 bytes)</div>
          </button>
        </div>

        {/* Dual Engines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {/* Lexical Engine */}
          <button
            onClick={() => setSelectedStage(STAGES[1])}
            className={`text-left p-4 sm:p-5 rounded-lg border transition-colors ${
              selectedStage.id === 'lexical'
                ? 'bg-zinc-850 border-zinc-600'
                : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono uppercase text-zinc-300 tracking-wider flex items-center gap-1.5 font-semibold">
                <Zap className="h-3.5 w-3.5 text-zinc-400" /> Lexical Engine (Rust)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono border border-zinc-700">
                O(log N) Pruning
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white">SIMD Elias-Fano & Block-Max WAND</h4>
            <ul className="text-xs text-zinc-400 space-y-1.5 mt-2.5 font-mono">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" /> Zero-allocation Porter Stemmer</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" /> 128-posting Elias-Fano blocks</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" /> Dynamic score upper bounds (theta)</li>
            </ul>
          </button>

          {/* Dense Engine */}
          <button
            onClick={() => setSelectedStage(STAGES[2])}
            className={`text-left p-4 sm:p-5 rounded-lg border transition-colors ${
              selectedStage.id === 'dense'
                ? 'bg-zinc-850 border-zinc-600'
                : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-mono uppercase text-zinc-300 tracking-wider flex items-center gap-1.5 font-semibold">
                <GitBranch className="h-3.5 w-3.5 text-zinc-400" /> Dense Engine (Rust)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono border border-zinc-700">
                -75% RAM (SQ8)
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white">Quantized HNSW Graph Traversal</h4>
            <ul className="text-xs text-zinc-400 space-y-1.5 mt-2.5 font-mono">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" /> SQ8 8-bit Scalar Quantization</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" /> Multi-layer navigable small world</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-zinc-400" /> Heuristic diversity edge selection</li>
            </ul>
          </button>
        </div>

        {/* L1 Fusion */}
        <div className="flex justify-center my-4">
          <button
            onClick={() => setSelectedStage(STAGES[3])}
            className={`w-full max-w-lg p-4 rounded-lg border transition-colors text-center ${
              selectedStage.id === 'rrf'
                ? 'bg-zinc-850 border-zinc-600'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase text-zinc-300 font-semibold tracking-wider">
                Reciprocal Rank Fusion (L1)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono border border-zinc-700">
                Top-1,000 Candidates
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              1 / (60 + rank_lexical) + 1 / (60 + rank_dense)
            </p>
          </button>
        </div>

        {/* L2 Reranking */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setSelectedStage(STAGES[4])}
            className={`w-full max-w-md p-4 rounded-lg border transition-colors text-center ${
              selectedStage.id === 'reranker'
                ? 'bg-zinc-850 border-zinc-600'
                : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase text-zinc-300 font-semibold tracking-wider">
                Cross-Encoder Reranker (L2)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono border border-zinc-700">
                Top-50 Evaluated
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              ONNX Runtime C API · bge-reranker-base · Softmax Top-10
            </p>
          </button>
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-850 pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-500 tracking-wider">Active Stage Inspection</span>
            <h3 className="text-lg font-bold text-white mt-0.5">{selectedStage.name}</h3>
          </div>
          <div className="font-mono text-xs text-zinc-300 px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 self-start sm:self-auto">
            {selectedStage.crate}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-xs font-mono uppercase text-zinc-500 mb-1">Algorithmic Strategy</h5>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">{selectedStage.algorithm}</p>
          </div>
          <div>
            <h5 className="text-xs font-mono uppercase text-zinc-500 mb-1">Complexity & Overhead</h5>
            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-mono">{selectedStage.complexity}</p>
          </div>
        </div>

        {selectedStage.mathFormula && (
          <div>
            <h5 className="text-xs font-mono uppercase text-zinc-500 mb-1">Mathematical Formulation</h5>
            <div className="p-3 rounded bg-zinc-950 border border-zinc-850 font-mono text-xs sm:text-sm text-zinc-200 overflow-x-auto">
              {selectedStage.mathFormula}
            </div>
          </div>
        )}

        <div>
          <h5 className="text-xs font-mono uppercase text-zinc-500 mb-1">Engineering Implementation</h5>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed bg-zinc-950/60 p-3 rounded border border-zinc-850 font-sans">
            {selectedStage.keyFeature}
          </p>
        </div>
      </div>
    </div>
  );
};
