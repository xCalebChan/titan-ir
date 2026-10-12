import React from 'react';
import { Zap, Cpu, Gauge, Database, ArrowRight, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onExploreSearch: () => void;
  onExploreArchitecture: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreSearch, onExploreArchitecture }) => {
  return (
    <div className="relative overflow-hidden pt-10 pb-12 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[200px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-700/30 text-indigo-300 text-xs font-medium mb-6 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Production Blueprint: Dual-Engine Hybrid Retrieval in Rust
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Titan<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-cyan-400">IR</span> Engine
          </h1>
          
          <p className="mt-4 text-lg text-slate-300 font-light leading-relaxed">
            High-Throughput Hybrid Search combining <span className="text-indigo-400 font-medium">SIMD Elias-Fano Block-Max WAND</span> with <span className="text-cyan-400 font-medium">SQ8 Quantized HNSW Graph Traversal</span> and <span className="text-purple-400 font-medium">L2 Cross-Encoder Neural Reranking</span>.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onExploreSearch}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-indigo-400 transition-all hover:scale-[1.02]"
            >
              <Zap className="h-4 w-4" />
              Launch Hybrid Query Console
            </button>
            <button
              onClick={onExploreArchitecture}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-sm hover:bg-slate-800 transition-all"
            >
              Explore Architecture Blueprint
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Core Specs Metric Strip */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Gauge className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Median Latency</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">&lt; 0.40 ms</div>
            <p className="text-xs text-slate-400 mt-1">Sub-millisecond p50 on standard queries</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <Database className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vector RAM</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">384 MB <span className="text-xs text-emerald-400 font-normal">(-75%)</span></div>
            <p className="text-xs text-slate-400 mt-1">SQ8 scalar quantization per 1M docs</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-purple-400 mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Relevance nDCG@10</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">0.671 <span className="text-xs text-purple-400 font-normal">(+36%)</span></div>
            <p className="text-xs text-slate-400 mt-1">MS MARCO benchmark validation</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Memory Safety</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">0 Alloc</div>
            <p className="text-xs text-slate-400 mt-1">Zero heap alloc on query hot loop</p>
          </div>
        </div>
      </div>
    </div>
  );
};
