import React from 'react';
import { Gauge, Database, ArrowRight, ShieldCheck, Search, BookOpen, Terminal } from 'lucide-react';

interface HeroProps {
  onExploreSearch: () => void;
  onExploreArchitecture: () => void;
  onExploreDictionary?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreSearch,
  onExploreArchitecture,
  onExploreDictionary,
}) => {
  return (
    <div className="relative border-b border-zinc-800 bg-zinc-950 pt-10 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Top architecture label */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
            Systems Architecture Blueprint: Dual-Engine Hybrid Retrieval in Rust
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            TitanIR Systems Engine
          </h1>

          <p className="mt-3.5 text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
            High-Throughput Hybrid Search uniting <span className="text-zinc-200 font-medium">SIMD Elias-Fano Block-Max WAND</span> with <span className="text-zinc-200 font-medium">SQ8 Quantized HNSW Graphs</span> and <span className="text-zinc-200 font-medium">L2 Cross-Encoder Neural Reranking</span>.
          </p>

          {/* Action buttons */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onExploreSearch}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs sm:text-sm transition-colors"
            >
              <Search className="h-4 w-4" />
              Launch Query Console
            </button>
            <button
              onClick={onExploreArchitecture}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white font-medium text-xs sm:text-sm transition-colors"
            >
              View Pipeline Architecture
              <ArrowRight className="h-4 w-4 text-zinc-500" />
            </button>
            {onExploreDictionary && (
              <button
                onClick={onExploreDictionary}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-850 hover:text-white font-medium text-xs sm:text-sm transition-colors"
              >
                <BookOpen className="h-4 w-4 text-zinc-500" />
                Technical Dictionary
              </button>
            )}
          </div>
        </div>

        {/* Systems Metric Cards */}
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Median Latency</span>
              <Gauge className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">&lt; 0.40 ms</div>
            <p className="text-xs text-zinc-500 mt-1">Sub-millisecond p50 on multi-term queries</p>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Vector RAM</span>
              <Database className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              384 MB <span className="text-xs text-zinc-400 font-normal">(-75%)</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">SQ8 scalar quantization per 1M docs</p>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">MS MARCO nDCG@10</span>
              <Terminal className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">
              0.671 <span className="text-xs text-zinc-400 font-normal">(+36%)</span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Full 4-stage pipeline retrieval accuracy</p>
          </div>

          <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Memory Allocation</span>
              <ShieldCheck className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="text-2xl font-bold text-white font-mono tabular-nums">0 Alloc</div>
            <p className="text-xs text-zinc-500 mt-1">Zero heap allocation in query hot loop</p>
          </div>
        </div>
      </div>
    </div>
  );
};
