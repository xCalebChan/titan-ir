import React, { useState } from 'react';
import { GitBranch, Play, RotateCcw, ChevronRight, Terminal } from 'lucide-react';

interface TraversalStep {
  step: number;
  activeLayer: number;
  activeNodes: number[];
  title: string;
  desc: string;
  action: string;
}

export const HnswVisualizer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps: TraversalStep[] = [
    {
      step: 0,
      activeLayer: 2,
      activeNodes: [3],
      title: 'Entry Point at Top Layer (Layer 2)',
      desc: 'Traversal begins at global entry point Node #3. The engine inspects sparse highway neighbors.',
      action: 'Evaluate distance between query vector Q and Node #3 neighbors.',
    },
    {
      step: 1,
      activeLayer: 2,
      activeNodes: [3, 7],
      title: 'Highway Hop on Layer 2',
      desc: 'Neighbor Node #7 is strictly closer to query vector Q than Node #3 (cosine dist 0.42 vs 0.68).',
      action: 'Greedy hop to Node #7. Local minimum reached on Layer 2. Drop down to Layer 1.',
    },
    {
      step: 2,
      activeLayer: 1,
      activeNodes: [7, 12, 19],
      title: 'Intermediate Cluster Routing (Layer 1)',
      desc: 'From Node #7, inspect intermediate density neighbors. Node #19 is closest to Q.',
      action: 'Hop to Node #19. No neighbor is closer on Layer 1. Drop down to Layer 0.',
    },
    {
      step: 3,
      activeLayer: 0,
      activeNodes: [19, 42, 88, 105],
      title: 'Dense Beam Search on Layer 0 (ef_search = 64)',
      desc: 'Explore candidate pool on full 1M-document graph. Expand neighbors with heuristic diversity pruning.',
      action: 'Discover final top-K nearest semantic neighbors [Doc #88, Doc #105, Doc #42].',
    },
  ];

  const current = steps[currentStep];

  const handleNextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono mb-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-400" />
          Dense Vector ANN Traversal
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          HNSW Graph Traversal Visualizer
        </h2>
        <p className="mt-1 text-sm text-zinc-400 max-w-3xl">
          Step through greedy logarithmic navigation across the Hierarchical Navigable Small World layers, from top sparse express highways down to dense base-layer beam searches.
        </p>
      </div>

      {/* Traversal Step Controller */}
      <div className="mb-6 p-5 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
            Traversal Step {currentStep + 1} of {steps.length}
          </span>
          <h3 className="text-base font-bold text-white mt-0.5">{current.title}</h3>
          <p className="text-xs text-zinc-400 max-w-xl mt-1 leading-relaxed">{current.desc}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleNextStep}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-colors"
          >
            <Play className="h-3.5 w-3.5" /> Next Hop
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs transition-colors"
            title="Reset to Entry Point"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Multi-Layer Visual Representation */}
      <div className="space-y-4 mb-6">
        {/* Layer 2 */}
        <div className={`p-4 sm:p-5 rounded-lg border transition-colors ${
          current.activeLayer === 2
            ? 'bg-zinc-900 border-zinc-600'
            : 'bg-zinc-950/70 border-zinc-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                LAYER 2
              </span>
              <span className="text-xs font-semibold text-white">Highway Express Routing (Logarithmic Step Decay)</span>
            </div>
            <span className="text-[11px] text-zinc-500">M = 4 connections | ml = 0.36</span>
          </div>

          <div className="h-20 bg-zinc-950 rounded border border-zinc-850 flex items-center justify-around px-8 relative overflow-hidden">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-colors ${
              current.activeNodes.includes(3)
                ? 'bg-zinc-100 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              #3
            </div>

            <div className="h-px flex-1 mx-4 bg-zinc-700" />

            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-colors ${
              current.activeNodes.includes(7)
                ? 'bg-zinc-100 text-zinc-950 font-bold'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              #7
            </div>
          </div>
        </div>

        {/* Layer 1 */}
        <div className={`p-4 sm:p-5 rounded-lg border transition-colors ${
          current.activeLayer === 1
            ? 'bg-zinc-900 border-zinc-600'
            : 'bg-zinc-950/70 border-zinc-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                LAYER 1
              </span>
              <span className="text-xs font-semibold text-white">Intermediate Cluster Routing</span>
            </div>
            <span className="text-[11px] text-zinc-500">M = 8 connections</span>
          </div>

          <div className="h-20 bg-zinc-950 rounded border border-zinc-850 flex items-center justify-around px-6 relative overflow-hidden">
            {[3, 7, 12, 19].map((nodeId) => (
              <React.Fragment key={nodeId}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-colors ${
                  current.activeNodes.includes(nodeId)
                    ? 'bg-zinc-100 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-400'
                }`}>
                  #{nodeId}
                </div>
                {nodeId !== 19 && <div className="h-px flex-1 mx-2 bg-zinc-800" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Layer 0 */}
        <div className={`p-4 sm:p-5 rounded-lg border transition-colors ${
          current.activeLayer === 0
            ? 'bg-zinc-900 border-zinc-600'
            : 'bg-zinc-950/70 border-zinc-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                LAYER 0 (BASE)
              </span>
              <span className="text-xs font-semibold text-white">Dense Vector Graph (All 1M Documents)</span>
            </div>
            <span className="text-[11px] text-zinc-500">M = 16 connections | Heuristic Diversity Algorithm 4</span>
          </div>

          <div className="h-20 bg-zinc-950 rounded border border-zinc-850 flex items-center justify-around px-4 relative overflow-hidden">
            {[19, 42, 88, 105, 342, 610].map((nodeId) => (
              <div
                key={nodeId}
                className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-colors ${
                  current.activeNodes.includes(nodeId)
                    ? 'bg-zinc-100 text-zinc-950 font-bold'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                #{nodeId}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traversal State Footnote */}
      <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-300">
          <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
          <span>CURRENT ACTION: {current.action}</span>
        </div>
        <span className="text-zinc-500 hidden sm:block">Total Graph Nodes: 1,000,000 | Traversal Time: 0.28ms</span>
      </div>
    </div>
  );
};
