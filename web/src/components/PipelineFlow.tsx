import React, { useState } from 'react';
import { Layers, Zap, Search, Cpu, CheckCircle2, ArrowRight, Sparkles, Clock, Database } from 'lucide-react';
import { MathFormula } from './MathFormula';

interface StageDetail {
  id: string;
  name: string;
  crate: string;
  role: string;
  standardAlgorithm: string;
  stepToImprove: string;
  mathFormula?: string;
  complexity: string;
  keyFeature: string;
}

const STAGES: StageDetail[] = [
  {
    id: 'ingestion',
    name: '1. Document Storage & Memory Mapping',
    crate: 'crates/index-core/src/doc_store.rs',
    role: 'Document Ingestion & Flat Storage',
    standardAlgorithm: 'Append-only binary flat file with fixed-width offset table (DocID * 8 bytes) mapped via mmap',
    stepToImprove: 'TODO: Chunk-compressed columnar storage using Zstandard dictionary compression for large passage payloads.',
    complexity: 'O(1) random lookup, 0 heap string RAM copies',
    keyFeature: 'Documents are serialized into a flat binary format. An in-memory 64-bit offset table maps each DocID to its file position, enabling zero-copy string slice reads (&str) directly from the OS page cache.',
  },
  {
    id: 'lexical',
    name: '2. Standard Lexical Search (Inverted Index + BM25)',
    crate: 'crates/lexical-engine/src/bm25.rs',
    role: 'Sparse Keyword Relevance Retrieval',
    standardAlgorithm: 'Standard Inverted Index with Robertson-Spärck Jones BM25 probabilistic term scoring',
    stepToImprove: 'TODO (Step to Improve): Block-Max WAND dynamic pruning & Elias-Fano quasi-succinct bitvectors to skip non-competitive 128-doc blocks without scoring them.',
    mathFormula: 'BM25(D, Q) = \\sum_{t \\in Q} \\ln\\left(1 + \\frac{N - n(t) + 0.5}{n(t) + 0.5}\\right) \\cdot \\frac{f(t, D) \\cdot (k_1 + 1)}{f(t, D) + k_1 \\cdot \\left(1 - b + b \\cdot \\frac{|D|}{\\text{avgdl}}\\right)}',
    complexity: 'O(|Q| · avg_posting_len), sorted min-heap top-K accumulation',
    keyFeature: 'Tokenizes and stems query terms via a zero-allocation lexer. Retrieves posting lists containing term frequencies and document lengths, evaluating standard BM25 with k₁ = 1.2 and b = 0.75 for exact keyword precision.',
  },
  {
    id: 'dense',
    name: '3. Standard Dense Vector Search (Cosine Similarity)',
    crate: 'crates/dense-engine/src/embedder.rs',
    role: 'Dense Semantic Vector Retrieval',
    standardAlgorithm: 'Exact Cosine Similarity (Normalized Dot Product) over 384-dimensional dense floating-point vectors (k-NN)',
    stepToImprove: 'TODO (Step to Improve): Hierarchical Navigable Small World (HNSW) graph indexing and 8-bit Scalar Quantization (SQ8) with AVX2 SIMD integer dot products for sub-millisecond approximate nearest neighbors.',
    mathFormula: 'S_{\\text{dense}}(Q, D) = \\cos(Q, D) = \\frac{Q \\cdot D}{\\|Q\\| \\|D\\|} = \\sum_{i=1}^{d} Q_i \\cdot D_i \\quad (\\text{for } L_2\\text{-normalized vectors})',
    complexity: 'O(N · d) exact scan; guarantees 100% recall without graph approximation distortion',
    keyFeature: 'Generates 384-dimensional dense embeddings for documents and queries. Calculates exact cosine similarity to reliably match conceptual synonyms and natural language intent without keyword overlap.',
  },
  {
    id: 'fusion',
    name: '4. Standard Hybrid Score Fusion',
    crate: 'crates/reranker/src/rrf.rs',
    role: 'Lexical & Semantic Score Combination',
    standardAlgorithm: 'Normalized Linear Score Combination (α · BM25_norm + (1 - α) · Cosine) / Reciprocal Rank Fusion',
    stepToImprove: 'TODO (Step to Improve): Two-Stage Neural Cross-Encoder Reranking via ONNX Runtime (bge-reranker-base full cross-attention on top-50 candidate pool).',
    mathFormula: '\\text{Score}_{\\text{hybrid}}(d) = \\alpha \\cdot \\text{BM25}_{\\text{norm}}(d) + (1 - \\alpha) \\cdot \\text{Cosine}(d)',
    complexity: 'O(K \\log K) rank sorting across candidates',
    keyFeature: 'Merges lexical BM25 scores and semantic cosine similarities into a single calibrated ranking, ensuring both exact keyword identifiers and semantic intent are surfaced.',
  },
];

export const PipelineFlow: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<StageDetail>(STAGES[1]);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans bg-white text-[#202124]">
      {/* Title */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium mb-2">
          <Layers className="h-3.5 w-3.5" />
          End-to-End System Blueprint
        </div>
        <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
          Retrieval Pipeline Architecture
        </h2>
        <p className="mt-1 text-sm text-[#5f6368] max-w-3xl leading-relaxed">
          Standard hybrid search architecture combining <strong>Inverted Index BM25</strong> with <strong>Dense Vector Cosine Similarity</strong> and <strong>Linear Hybrid Fusion</strong>, with an explicit roadmap of advanced optimizations (TODO).
        </p>
      </div>

      {/* Visual Pipeline Layout */}
      <div className="p-6 rounded-2xl bg-[#f8f9fa] border border-[#dadce0] google-card-shadow mb-6">
        {/* Top: Corpus Ingestion */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setSelectedStage(STAGES[0])}
            className={`w-full max-w-md px-5 py-3 rounded-xl border transition-all text-center ${
              selectedStage.id === 'ingestion'
                ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-sm'
                : 'bg-white border-[#dadce0] hover:bg-[#f1f3f4]'
            }`}
          >
            <div className="text-[11px] uppercase font-mono text-[#70757a] tracking-wider">Document Storage</div>
            <div className="text-sm font-medium text-[#202124]">MS MARCO Benchmark Corpus (8.8M Docs)</div>
            <div className="text-xs text-[#5f6368] font-mono mt-0.5">Append-Only Binary File · mmap Offset Table</div>
          </button>
        </div>

        {/* Dual Engines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {/* Lexical Engine */}
          <button
            onClick={() => setSelectedStage(STAGES[1])}
            className={`text-left p-4 sm:p-5 rounded-xl border transition-all ${
              selectedStage.id === 'lexical'
                ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-sm'
                : 'bg-white border-[#dadce0] hover:bg-[#f1f3f4]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium uppercase text-[#1a73e8] tracking-wider flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[#1a73e8]" /> Standard Lexical Search
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] font-mono border border-[#dadce0]">
                Standard BM25
              </span>
            </div>
            <h4 className="text-sm font-medium text-[#202124]">Inverted Index & Probabilistic BM25</h4>
            <ul className="text-xs text-[#5f6368] space-y-1 mt-2.5 font-sans">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#137333]" /> Standard term frequency & document length normalization</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#137333]" /> Robertson-Spärck Jones IDF term weighting</li>
              <li className="flex items-center gap-1.5 text-[#b06000]"><Clock className="h-3.5 w-3.5" /> <em>TODO (Roadmap): Block-Max WAND Pruning & Elias-Fano</em></li>
            </ul>
          </button>

          {/* Dense Engine */}
          <button
            onClick={() => setSelectedStage(STAGES[2])}
            className={`text-left p-4 sm:p-5 rounded-xl border transition-all ${
              selectedStage.id === 'dense'
                ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-sm'
                : 'bg-white border-[#dadce0] hover:bg-[#f1f3f4]'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium uppercase text-[#137333] tracking-wider flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-[#137333]" /> Standard Dense Search
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e6f4ea] text-[#137333] font-mono border border-[#dadce0]">
                Cosine k-NN
              </span>
            </div>
            <h4 className="text-sm font-medium text-[#202124]">Vector Space & Cosine Similarity</h4>
            <ul className="text-xs text-[#5f6368] space-y-1 mt-2.5 font-sans">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#137333]" /> Exact normalized vector dot product (100% recall)</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#137333]" /> 384-dimensional dense semantic embeddings</li>
              <li className="flex items-center gap-1.5 text-[#b06000]"><Clock className="h-3.5 w-3.5" /> <em>TODO (Roadmap): HNSW Graph Traversal & SQ8 SIMD</em></li>
            </ul>
          </button>
        </div>

        {/* Hybrid Fusion */}
        <div className="flex justify-center my-4">
          <button
            onClick={() => setSelectedStage(STAGES[3])}
            className={`w-full max-w-lg p-4 rounded-xl border transition-all text-center ${
              selectedStage.id === 'fusion'
                ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-sm'
                : 'bg-white border-[#dadce0] hover:bg-[#f1f3f4]'
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xs font-medium uppercase text-[#202124] tracking-wider">
                Standard Hybrid Score Fusion
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f3f4] text-[#5f6368] font-mono border border-[#dadce0]">
                Linear α-Interpolation & RRF
              </span>
            </div>
            <p className="text-xs text-[#5f6368] font-mono">
              Score = α · BM25_norm + (1 - α) · Cosine_sim
            </p>
            <p className="text-[11px] text-[#b06000] mt-1 font-sans">
              <em>TODO (Roadmap): Cross-Encoder Transformer Reranking (bge-reranker-base)</em>
            </p>
          </button>
        </div>
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="p-6 rounded-2xl bg-white border border-[#dadce0] google-card-shadow space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dadce0] pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#70757a] tracking-wider">Stage Deep Dive</span>
            <h3 className="text-xl font-normal text-[#202124] mt-0.5">{selectedStage.name}</h3>
          </div>
          <div className="font-mono text-xs text-[#5f6368] px-3 py-1 rounded-full bg-[#f8f9fa] border border-[#dadce0] self-start sm:self-auto">
            {selectedStage.crate}
          </div>
        </div>

        {/* Standard vs Steps to Improve side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#1a73e8]">
              <CheckCircle2 className="h-4 w-4" />
              Standard Algorithm (Active Baseline)
            </div>
            <p className="text-xs sm:text-sm text-[#3c4043] leading-relaxed">
              {selectedStage.standardAlgorithm}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#fef7e0]/40 border border-[#fbbc05]/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#b06000]">
              <Sparkles className="h-4 w-4" />
              Step to Improve / Optimization Roadmap (TODO)
            </div>
            <p className="text-xs sm:text-sm text-[#3c4043] leading-relaxed">
              {selectedStage.stepToImprove}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <h5 className="text-xs font-mono uppercase text-[#70757a] mb-1">Complexity & Access Pattern</h5>
            <p className="text-xs sm:text-sm text-[#3c4043] leading-relaxed font-mono">{selectedStage.complexity}</p>
          </div>
          <div>
            <h5 className="text-xs font-mono uppercase text-[#70757a] mb-1">Architectural Role</h5>
            <p className="text-xs sm:text-sm text-[#3c4043] leading-relaxed font-sans">{selectedStage.role}</p>
          </div>
        </div>

        {selectedStage.mathFormula && (
          <div>
            <h5 className="text-xs font-mono uppercase text-[#70757a] mb-1">Mathematical Formulation</h5>
            <div className="p-3.5 rounded-xl bg-[#f8f9fa] border border-[#dadce0] text-sm text-[#202124]">
              <MathFormula formula={selectedStage.mathFormula} />
            </div>
          </div>
        )}

        <div>
          <h5 className="text-xs font-mono uppercase text-[#70757a] mb-1">Engineering Implementation</h5>
          <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed bg-[#f8f9fa] p-3.5 rounded-xl border border-[#dadce0] font-sans">
            {selectedStage.keyFeature}
          </p>
        </div>
      </div>
    </div>
  );
};
