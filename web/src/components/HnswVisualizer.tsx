import React, { useState } from 'react';
import { GitBranch, Layers, ShieldCheck, ChevronRight, Play, RotateCcw } from 'lucide-react';

export const HnswVisualizer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [useDiversityHeuristic, setUseDiversityHeuristic] = useState<boolean>(true);

  const steps = [
    {
      title: '1. Entry Point at Top Layer (Layer 2)',
      desc: 'Query vector enters at top layer entry point (DocID 3). Evaluates long-range highway edges to jump quickly across semantic space.',
      activeLayer: 2,
      activeNodes: [3, 7],
      hopDist: '0.85 -> 0.42',
    },
    {
      title: '2. Greedy Descent to Layer 1',
      desc: 'Local minimum reached at Layer 2 (DocID 7). Steps down to Layer 1 at DocID 7, exploring intermediate cluster neighbors.',
      activeLayer: 1,
      activeNodes: [7, 10, 14],
      hopDist: '0.42 -> 0.28',
    },
    {
      title: '3. Ground Layer Beam Search (Layer 0)',
      desc: 'Transitions to Layer 0 with efSearch=64 beam priority queue. Conducts dense approximate nearest neighbor exploration.',
      activeLayer: 0,
      activeNodes: [14, 2, 5, 8],
      hopDist: '0.28 -> 0.12',
    },
    {
      title: '4. Top-K Candidates Extraction',
      desc: 'Identifies closest semantic neighbors with SQ8 SIMD dot products. Returns deduplicated top candidates to Reciprocal Rank Fusion.',
      activeLayer: 0,
      activeNodes: [2, 5],
      hopDist: 'Top Hits: DocID #2 (0.98), DocID #5 (0.94)',
    },
  ];

  const handleNextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  const current = steps[currentStep];

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/40 text-cyan-300 text-xs font-semibold mb-3">
          <GitBranch className="h-3.5 w-3.5 text-cyan-400" /> Vector Retrieval Component
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          HNSW Multi-Layer Graph & Beam Search
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Visualize hierarchical navigable small-world traversal from sparse highway layers down to dense ground-layer beam search.
        </p>
      </div>

      {/* Traversal Step Controller */}
      <div className="mb-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
            Traversal Step {currentStep + 1} of {steps.length}
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">{current.title}</h3>
          <p className="text-xs text-slate-300 max-w-xl mt-1">{current.desc}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleNextStep}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-600/20"
          >
            <Play className="h-3.5 w-3.5" /> Next Traversal Hop
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
            title="Reset to Entry Point"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Multi-Layer Visual Representation */}
      <div className="space-y-6 mb-8">
        {/* Layer 2: Highway Layer */}
        <div className={`p-5 rounded-2xl border transition-all ${
          current.activeLayer === 2
            ? 'bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
            : 'bg-slate-900/60 border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">
                LAYER 2
              </span>
              <span className="text-sm font-bold text-white">Highway Express Routing (Logarithmic Step Decay)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">M = 4 connections | Exponential decay ml=0.36</span>
          </div>

          <div className="h-24 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-around px-8 relative overflow-hidden">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
              current.activeNodes.includes(3)
                ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/30 animate-pulse'
                : 'bg-slate-800 text-slate-300'
            }`}>
              #3 (EP)
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-cyan-500/40 relative">
              <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-cyan-400"></div>
            </div>

            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
              current.activeNodes.includes(7)
                ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/30'
                : 'bg-slate-800 text-slate-300'
            }`}>
              #7
            </div>
          </div>
        </div>

        {/* Layer 1: Intermediate Routing */}
        <div className={`p-5 rounded-2xl border transition-all ${
          current.activeLayer === 1
            ? 'bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
            : 'bg-slate-900/60 border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">
                LAYER 1
              </span>
              <span className="text-sm font-bold text-white">Cluster Routing (Medium Density)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">M = 8 connections</span>
          </div>

          <div className="h-24 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-around px-8 relative overflow-hidden">
            {[3, 7, 10, 14].map((id) => (
              <div
                key={id}
                className={`h-9 w-9 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                  current.activeNodes.includes(id)
                    ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                #{id}
              </div>
            ))}
          </div>
        </div>

        {/* Layer 0: Ground Dense Layer */}
        <div className={`p-5 rounded-2xl border transition-all ${
          current.activeLayer === 0
            ? 'bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/30'
            : 'bg-slate-900/60 border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">
                LAYER 0
              </span>
              <span className="text-sm font-bold text-white">Ground Layer: Dense Beam Search (efSearch = 64)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">M0 = 32 connections (2x capacity)</span>
          </div>

          <div className="h-28 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-around px-4 relative overflow-hidden flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((id) => (
              <div
                key={id}
                className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-[11px] font-bold transition-all ${
                  current.activeNodes.includes(id)
                    ? 'bg-cyan-400 text-slate-950 ring-4 ring-cyan-400/40 scale-110 shadow-lg'
                    : 'bg-slate-800/80 text-slate-400'
                }`}
              >
                #{id}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Heuristic Diversity Edge Selection Guarantee Card */}
      <div className="p-6 rounded-2xl bg-cyan-950/20 border border-cyan-900/40 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            Heuristic Edge Selection: Diversity Enforcement (Algorithm 4)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans mt-2">
            Standard KNN edge selection causes isolated cluster bottlenecks where nodes connect only to nearby duplicates. TitanIR enforces diversity pruning: a candidate node <span className="font-mono text-cyan-300">e</span> is linked to base node <span className="font-mono text-cyan-300">u</span> only if <span className="font-mono text-cyan-300">dist(e, u) &lt; dist(e, r)</span> for all already selected neighbors <span className="font-mono text-cyan-300">r</span>. This eliminates clustering traps, guaranteeing high recall while beam searching.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">HNSW PARAMETERS</div>
          <div>M: <span className="text-cyan-400">16</span> | M0: <span className="text-cyan-400">32</span></div>
          <div>efConstruction: <span className="text-cyan-400">100</span></div>
          <div>efSearch: <span className="text-cyan-400">64</span></div>
          <div>Metric: <span className="text-emerald-400">Cosine via SQ8</span></div>
        </div>
      </div>
    </div>
  );
};
