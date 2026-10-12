import React, { useState } from 'react';
import { Zap, ShieldCheck, Eye, FastForward, Terminal } from 'lucide-react';

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
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono mb-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-400" />
          Lexical Query Optimization
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Block-Max WAND Pruning Simulator
        </h2>
        <p className="mt-1 text-sm text-zinc-400 max-w-3xl">
          Observe how the engine dynamically skips entire 128-document Elias-Fano compressed blocks when their theoretical upper-bound BM25 contribution cannot beat heap threshold <span className="font-mono text-zinc-200">θ</span>.
        </p>
      </div>

      {/* Threshold Slider Controller */}
      <div className="mb-6 p-5 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3 font-mono">
          <div>
            <div className="text-[11px] uppercase text-zinc-500">Top-K Heap Minimum Threshold</div>
            <div className="text-xl font-bold text-zinc-100 tabular-nums">
              θ = {theta.toFixed(1)}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] uppercase text-zinc-500">Pruning Efficiency</div>
            <div className="text-xl font-bold text-zinc-100 tabular-nums">
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
          className="w-full accent-zinc-300 cursor-pointer h-2 bg-zinc-800 rounded"
        />

        <div className="flex justify-between text-[11px] text-zinc-500 font-mono mt-2">
          <span>θ = 1.0 (Early Query Stage)</span>
          <span>θ = 4.5 (Mid Query Saturation)</span>
          <span>θ = 8.0 (Late Deep Heap Saturation)</span>
        </div>
      </div>

      {/* Visual Blocks Grid */}
      <div className="space-y-4">
        {Object.entries(TERM_POSTING_BLOCKS).map(([term, blocks]) => (
          <div key={term} className="p-4 sm:p-5 rounded-lg bg-zinc-900/60 border border-zinc-800">
            <div className="flex items-center justify-between mb-3 font-mono">
              <span className="text-xs text-white font-semibold flex items-center gap-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">TERM</span>
                &quot;{term}&quot;
              </span>
              <span className="text-xs text-zinc-500">5 Elias-Fano Blocks (640 Postings)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {blocks.map((block) => {
                const isSkipped = block.maxScore < theta * 0.45;
                return (
                  <div
                    key={block.blockIdx}
                    className={`p-3 rounded-md border font-mono transition-colors ${
                      isSkipped
                        ? 'bg-zinc-950 border-zinc-850 text-zinc-500 opacity-60'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span>Block #{block.blockIdx}</span>
                      <span className={`font-semibold ${isSkipped ? 'text-zinc-500' : 'text-zinc-100'}`}>
                        {isSkipped ? 'SKIPPED' : 'SCORED'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-white">{block.docRange}</div>

                    <div className="mt-2 text-[11px] space-y-0.5 pt-1.5 border-t border-zinc-800">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Max DocID:</span>
                        <span className="text-zinc-300 tabular-nums">#{block.maxDocId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Upper Score:</span>
                        <span className="text-zinc-300 tabular-nums">{block.maxScore.toFixed(2)}</span>
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
