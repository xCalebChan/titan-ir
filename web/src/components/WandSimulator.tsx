import React, { useState } from 'react';
import { Zap, ShieldCheck, Eye, FastForward, Sliders } from 'lucide-react';

interface SimulatedBlock {
  blockIdx: number;
  docRange: string;
  maxDocId: number;
  maxScore: number;
}

const TERM_POSTING_BLOCKS: Record<string, SimulatedBlock[]> = {
  'wand': [
    { blockIdx: 0, docRange: 'Docs 0 - 127', maxDocId: 125, maxScore: 3.42 },
    { blockIdx: 1, docRange: 'Docs 128 - 255', maxDocId: 251, maxScore: 2.15 },
    { blockIdx: 2, docRange: 'Docs 256 - 383', maxDocId: 380, maxScore: 3.88 },
    { blockIdx: 3, docRange: 'Docs 384 - 511', maxDocId: 508, maxScore: 1.84 },
    { blockIdx: 4, docRange: 'Docs 512 - 639', maxDocId: 635, maxScore: 3.12 },
  ],
  'block': [
    { blockIdx: 0, docRange: 'Docs 0 - 127', maxDocId: 120, maxScore: 2.85 },
    { blockIdx: 1, docRange: 'Docs 128 - 255', maxDocId: 248, maxScore: 3.10 },
    { blockIdx: 2, docRange: 'Docs 256 - 383', maxDocId: 375, maxScore: 2.05 },
    { blockIdx: 3, docRange: 'Docs 384 - 511', maxDocId: 502, maxScore: 3.45 },
    { blockIdx: 4, docRange: 'Docs 512 - 639', maxDocId: 628, maxScore: 1.95 },
  ],
  'elias': [
    { blockIdx: 0, docRange: 'Docs 0 - 127', maxDocId: 118, maxScore: 3.90 },
    { blockIdx: 1, docRange: 'Docs 128 - 255', maxDocId: 245, maxScore: 1.70 },
    { blockIdx: 2, docRange: 'Docs 256 - 383', maxDocId: 370, maxScore: 3.65 },
    { blockIdx: 3, docRange: 'Docs 384 - 511', maxDocId: 495, maxScore: 1.60 },
    { blockIdx: 4, docRange: 'Docs 512 - 639', maxDocId: 620, maxScore: 2.75 },
  ],
};

export const WandSimulator: React.FC = () => {
  const [theta, setTheta] = useState<number>(5.5);

  let totalBlocks = 0;
  let skippedBlocks = 0;

  Object.values(TERM_POSTING_BLOCKS).forEach((blocks) => {
    blocks.forEach((b) => {
      totalBlocks++;
      if (b.maxScore < theta * 0.45) {
        skippedBlocks++;
      }
    });
  });

  const efficiencyPct = ((skippedBlocks / totalBlocks) * 100).toFixed(1);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans bg-white text-[#202124]">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium mb-2">
          <Zap className="h-3.5 w-3.5" />
          Lexical Query Optimization
        </div>
        <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
          Block-Max WAND Pruning Simulator
        </h2>
        <p className="mt-1 text-sm text-[#5f6368] max-w-3xl leading-relaxed">
          Observe how the engine dynamically skips entire 128-document Elias-Fano compressed blocks when their theoretical upper-bound BM25 contribution cannot beat heap threshold <span className="font-mono text-[#1a73e8]">θ</span>.
        </p>
      </div>

      {/* Threshold Slider Controller */}
      <div className="mb-6 p-6 rounded-2xl bg-[#f8f9fa] border border-[#dadce0] google-card-shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 font-mono">
          <div>
            <div className="text-[11px] uppercase text-[#70757a]">Top-K Heap Minimum Threshold</div>
            <div className="text-2xl font-bold text-[#1a73e8] tabular-nums">
              θ = {theta.toFixed(1)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] uppercase text-[#70757a]">Pruning Efficiency</div>
            <div className="text-2xl font-bold text-[#137333] tabular-nums">
              {efficiencyPct}% Skipped ({skippedBlocks}/{totalBlocks} Blocks)
            </div>
          </div>
        </div>

        <input
          type="range"
          min="1.0"
          max="8.0"
          step="0.1"
          value={theta}
          onChange={(e) => setTheta(parseFloat(e.target.value))}
          className="w-full accent-[#1a73e8] cursor-pointer h-2 bg-[#dadce0] rounded"
        />

        <div className="flex justify-between text-[11px] text-[#70757a] font-mono mt-2">
          <span>θ = 1.0 (Early Query Stage)</span>
          <span>θ = 4.5 (Mid Query Saturation)</span>
          <span>θ = 8.0 (Late Deep Heap Saturation)</span>
        </div>
      </div>

      {/* Visual Blocks Grid */}
      <div className="space-y-4">
        {Object.entries(TERM_POSTING_BLOCKS).map(([term, blocks]) => (
          <div key={term} className="p-5 rounded-2xl bg-white border border-[#dadce0] google-card-shadow">
            <div className="flex items-center justify-between mb-3 font-mono">
              <span className="text-sm text-[#202124] font-medium flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0]">TERM</span>
                &quot;{term}&quot;
              </span>
              <span className="text-xs text-[#70757a]">5 Elias-Fano Blocks (640 Postings)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {blocks.map((block) => {
                const isSkipped = block.maxScore < theta * 0.45;
                return (
                  <div
                    key={block.blockIdx}
                    className={`p-3.5 rounded-xl border font-mono transition-all ${
                      isSkipped
                        ? 'bg-[#f8f9fa] border-[#dadce0] text-[#70757a] opacity-50'
                        : 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span>Block #{block.blockIdx}</span>
                      <span className={`font-semibold ${isSkipped ? 'text-[#70757a]' : 'text-[#1a73e8]'}`}>
                        {isSkipped ? 'SKIPPED' : 'SCORED'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#202124]">{block.docRange}</div>

                    <div className="mt-2 text-[11px] space-y-0.5 pt-1.5 border-t border-[#dadce0]">
                      <div className="flex justify-between">
                        <span className="text-[#70757a]">Max DocID:</span>
                        <span className="tabular-nums font-medium text-[#202124]">#{block.maxDocId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#70757a]">Upper Score:</span>
                        <span className="tabular-nums font-medium text-[#202124]">{block.maxScore.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
