import React, { useState } from 'react';
import { Zap, ShieldCheck, Eye, FastForward } from 'lucide-react';

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
      // A block is skipped if its max possible score alone cannot contribute enough to reach theta in the heap
      if (b.maxScore < theta * 0.45) {
        skippedBlocks++;
      }
    });
  });

  const efficiencyPct = ((skippedBlocks / totalBlocks) * 100).toFixed(1);

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/40 text-indigo-300 text-xs font-semibold mb-3">
          <Zap className="h-3.5 w-3.5 text-indigo-400" /> Core Systems Component
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Block-Max WAND Pruning Simulator
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Observe how the engine dynamically skips entire 128-document Elias-Fano compressed blocks when their theoretical upper-bound BM25 contribution cannot beat heap threshold <span className="font-mono text-indigo-300">θ</span>.
        </p>
      </div>

      {/* Threshold Slider Controller */}
      <div className="mb-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs uppercase font-semibold text-slate-400">Top-K Heap Minimum Threshold</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">
              θ = {theta.toFixed(1)}
            </div>
          </div>

          {/* Efficiency Gauge */}
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-xs uppercase font-semibold text-slate-400">Pruning Efficiency</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {efficiencyPct}% Skipped
              </div>
            </div>
            <div className="text-xs text-slate-400 font-mono hidden sm:block">
              {skippedBlocks} of {totalBlocks} Blocks Bypassed
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
          className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        <div className="flex justify-between text-xs text-slate-400 font-mono mt-2">
          <span>θ = 1.0 (Low Threshold / Early Query Phase)</span>
          <span>θ = 4.5 (Mid Query Heap Fill)</span>
          <span>θ = 8.0 (High Threshold / Deep Heap Saturation)</span>
        </div>
      </div>

      {/* Visual Blocks Grid */}
      <div className="space-y-6">
        {Object.entries(TERM_POSTING_BLOCKS).map(([term, blocks]) => (
          <div key={term} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">TERM</span>
                "{term}"
              </span>
              <span className="text-xs text-slate-400 font-mono">5 Elias-Fano Blocks (640 Postings)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {blocks.map((block) => {
                const isSkipped = block.maxScore < theta * 0.45;
                return (
                  <div
                    key={block.blockIdx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isSkipped
                        ? 'bg-amber-950/20 border-amber-900/50 opacity-60 hover:opacity-100'
                        : 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Block #{block.blockIdx}</span>
                      <span className={`font-semibold ${isSkipped ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {isSkipped ? 'SKIPPED' : 'EVAL'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-white font-mono">{block.docRange}</div>

                    <div className="mt-2 text-[11px] text-slate-400 font-mono space-y-0.5">
                      <div>max_doc_id: <span className="text-slate-200">{block.maxDocId}</span></div>
                      <div>max_score: <span className={isSkipped ? 'text-amber-400 font-semibold' : 'text-emerald-400 font-semibold'}>{block.maxScore.toFixed(2)}</span></div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                      {isSkipped ? (
                        <span className="text-amber-400/90 flex items-center gap-1">
                          <FastForward className="h-3 w-3" /> Jump past block
                        </span>
                      ) : (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Elias-Fano decode
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Theoretical Proof Card */}
      <div className="mt-8 p-6 rounded-2xl bg-indigo-950/20 border border-indigo-900/40">
        <h4 className="text-base font-bold text-indigo-300 flex items-center gap-2 mb-2">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
          Block-Max WAND Pruning Invariant
        </h4>
        <p className="text-sm text-slate-300 leading-relaxed font-sans">
          Let block B have upper-bound term score max score S(t, D) &le; max_term_score. If the sum of maximum block scores for all active query terms cannot exceed &theta;, no document in that block can enter the top-K min-heap. Therefore, <span className="text-indigo-400 font-semibold">100% of postings in that block can be skipped without decompression</span>, guaranteeing zero false negatives while running in sub-milliseconds.
        </p>
      </div>
    </div>
  );
};
