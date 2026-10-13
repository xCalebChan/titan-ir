import React, { useState } from 'react';
import { GitBranch, Play, RotateCcw, ChevronRight } from 'lucide-react';

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
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans bg-white text-[#202124]">
      {/* Title */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e6f4ea] text-[#137333] text-xs font-medium mb-2">
          <GitBranch className="h-3.5 w-3.5" />
          Dense Vector ANN Traversal
        </div>
        <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
          HNSW Graph Traversal Visualizer
        </h2>
        <p className="mt-1 text-sm text-[#5f6368] max-w-3xl leading-relaxed">
          Step through greedy logarithmic navigation across the Hierarchical Navigable Small World layers, from top sparse express highways down to dense base-layer beam searches.
        </p>
      </div>

      {/* Traversal Step Controller */}
      <div className="mb-6 p-6 rounded-2xl bg-[#f8f9fa] border border-[#dadce0] google-card-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono text-[#70757a] uppercase tracking-wider">
            Traversal Step {currentStep + 1} of {steps.length}
          </span>
          <h3 className="text-lg font-medium text-[#202124] mt-0.5">{current.title}</h3>
          <p className="text-xs text-[#5f6368] max-w-xl mt-1 leading-relaxed">{current.desc}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleNextStep}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Play className="h-3.5 w-3.5" /> Next Hop
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-full bg-white border border-[#dadce0] hover:bg-[#f1f3f4] text-[#5f6368] text-xs transition-colors"
            title="Reset to Entry Point"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Multi-Layer Visual Representation */}
      <div className="space-y-4 mb-6">
        {/* Layer 2 */}
        <div className={`p-5 rounded-2xl border transition-all ${
          current.activeLayer === 2
            ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-sm'
            : 'bg-white border-[#dadce0] opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#1a73e8] font-bold border border-[#1a73e8]">
                LAYER 2
              </span>
              <span className="text-xs font-medium text-[#202124]">Highway Express Routing (Logarithmic Step Decay)</span>
            </div>
            <span className="text-[11px] text-[#70757a]">M = 4 connections | ml = 0.36</span>
          </div>

          <div className="h-20 bg-white rounded-xl border border-[#dadce0] flex items-center justify-around px-8 relative overflow-hidden">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-colors ${
              current.activeNodes.includes(3)
                ? 'bg-[#1a73e8] text-white font-bold shadow-sm'
                : 'bg-[#f1f3f4] text-[#5f6368]'
            }`}>
              #3
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-[#dadce0]" />

            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-colors ${
              current.activeNodes.includes(7)
                ? 'bg-[#1a73e8] text-white font-bold shadow-sm'
                : 'bg-[#f1f3f4] text-[#5f6368]'
            }`}>
              #7
            </div>
          </div>
        </div>

        {/* Layer 1 */}
        <div className={`p-5 rounded-2xl border transition-all ${
          current.activeLayer === 1
            ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-sm'
            : 'bg-white border-[#dadce0] opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#1a73e8] font-bold border border-[#1a73e8]">
                LAYER 1
              </span>
              <span className="text-xs font-medium text-[#202124]">Intermediate Cluster Routing</span>
            </div>
            <span className="text-[11px] text-[#70757a]">M = 8 connections</span>
          </div>

          <div className="h-20 bg-white rounded-xl border border-[#dadce0] flex items-center justify-around px-6 relative overflow-hidden">
            {[3, 7, 12, 19].map((nodeId) => (
              <React.Fragment key={nodeId}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-colors ${
                  current.activeNodes.includes(nodeId)
                    ? 'bg-[#1a73e8] text-white font-bold shadow-sm'
                    : 'bg-[#f1f3f4] text-[#5f6368]'
                }`}>
                  #{nodeId}
                </div>
                {nodeId !== 19 && <div className="h-0.5 flex-1 mx-2 bg-[#dadce0]" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Layer 0 */}
        <div className={`p-5 rounded-2xl border transition-all ${
          current.activeLayer === 0
            ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-sm'
            : 'bg-white border-[#dadce0] opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-[#1a73e8] font-bold border border-[#1a73e8]">
                LAYER 0 (BASE)
              </span>
              <span className="text-xs font-medium text-[#202124]">Dense Vector Graph (All 1M Documents)</span>
            </div>
            <span className="text-[11px] text-[#70757a]">M = 16 connections | Heuristic Diversity Algorithm 4</span>
          </div>

          <div className="h-20 bg-white rounded-xl border border-[#dadce0] flex items-center justify-around px-4 relative overflow-hidden">
            {[19, 42, 88, 105, 342, 610].map((nodeId) => (
              <div
                key={nodeId}
                className={`h-8 w-8 rounded-full flex items-center justify-center font-mono text-xs font-semibold transition-colors ${
                  current.activeNodes.includes(nodeId)
                    ? 'bg-[#1a73e8] text-white font-bold shadow-sm'
                    : 'bg-[#f1f3f4] text-[#5f6368]'
                }`}
              >
                #{nodeId}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Traversal State Footnote */}
      <div className="p-4 rounded-xl bg-[#f8f9fa] border border-[#dadce0] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-[#3c4043]">
          <ChevronRight className="h-3.5 w-3.5 text-[#1a73e8]" />
          <span>CURRENT ACTION: {current.action}</span>
        </div>
        <span className="text-[#70757a] hidden sm:block">1,000,000 Graph Nodes · Traversal: 0.28ms</span>
      </div>
    </div>
  );
};
