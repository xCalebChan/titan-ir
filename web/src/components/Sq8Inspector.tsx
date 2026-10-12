import React, { useState } from 'react';
import { Cpu, Database, Zap, Calculator, CheckCircle2 } from 'lucide-react';

export const Sq8Inspector: React.FC = () => {
  const [corpusSize, setCorpusSize] = useState<number>(1_000_000);
  const dim = 384;

  const fp32Bytes = corpusSize * dim * 4;
  const sq8Bytes = corpusSize * dim * 1;
  const fp32Mb = (fp32Bytes / (1024 * 1024)).toFixed(1);
  const sq8Mb = (sq8Bytes / (1024 * 1024)).toFixed(1);
  const ramSavedMb = ((fp32Bytes - sq8Bytes) / (1024 * 1024)).toFixed(1);

  // Sample vector dimension values
  const sampleFp32 = [0.428, -0.812, 0.915, -0.104, 0.732, -0.651, 0.289, 0.045];
  const minVal = -0.812;
  const maxVal = 0.915;
  const diff = maxVal - minVal;

  const sampleSq8 = sampleFp32.map((val) =>
    Math.round(((val - minVal) / diff) * 255)
  );

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/40 text-cyan-300 text-xs font-semibold mb-3">
          <Cpu className="h-3.5 w-3.5 text-cyan-400" /> Vector Compression & SIMD Acceleration
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Scalar Quantization (SQ8) & SIMD Dot Products
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Transform 32-bit floating-point dimensions into 8-bit unsigned integers, cutting vector RAM by 75% and enabling AVX2/NEON integer dot products.
        </p>
      </div>

      {/* Memory Reduction Calculator */}
      <div className="mb-8 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Corpus Vector RAM Calculator (384-dim Embeddings)</h3>
          </div>

          <div className="flex items-center gap-2">
            {[100_000, 1_000_000, 5_000_000, 10_000_000].map((size) => (
              <button
                key={size}
                onClick={() => setCorpusSize(size)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  corpusSize === size
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {size >= 1_000_000 ? `${size / 1_000_000}M Docs` : `${size / 1000}k Docs`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Uncompressed FP32 RAM</div>
            <div className="text-2xl font-bold text-slate-300 font-mono mt-1">{fp32Mb} MB</div>
            <div className="text-xs text-slate-400 mt-1">4 bytes × 384 dims × {corpusSize.toLocaleString()} docs</div>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
            <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">Quantized SQ8 RAM (TitanIR)</div>
            <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">{sq8Mb} MB</div>
            <div className="text-xs text-cyan-300/80 mt-1">1 byte × 384 dims × {corpusSize.toLocaleString()} docs</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40">
            <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Net RAM Saved</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">-{ramSavedMb} MB</div>
            <div className="text-xs text-emerald-300/80 mt-1 font-semibold">4.0x Memory Compression Ratio (-75%)</div>
          </div>
        </div>
      </div>

      {/* Coordinate Quantization Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* FP32 Coordinates */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              Original FP32 Dimensions (32-bit floats)
            </h4>
            <span className="text-xs text-slate-400 font-mono">4 Bytes / Coord</span>
          </div>

          <div className="space-y-2">
            {sampleFp32.map((val, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 font-mono text-xs">
                <span className="text-slate-400">dim[{idx}]</span>
                <span className={val >= 0 ? 'text-indigo-300' : 'text-rose-300'}>{val.toFixed(4)}</span>
                <span className="text-[10px] text-slate-500">IEEE 754 float32</span>
              </div>
            ))}
          </div>
        </div>

        {/* SQ8 Quantized Coordinates */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-lg shadow-cyan-950/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Quantized SQ8 Dimensions (8-bit uints)
            </h4>
            <span className="text-xs text-cyan-400 font-mono">1 Byte / Coord</span>
          </div>

          <div className="space-y-2">
            {sampleSq8.map((val, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 font-mono text-xs">
                <span className="text-slate-400">dim_quant[{idx}]</span>
                <span className="text-cyan-400 font-bold">{val}</span>
                <span className="text-[10px] text-cyan-500/80">uint8 (0 - 255)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SIMD Integer Dot Product Acceleration */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-400" />
          SIMD Asymmetric Dot Product (ADC)
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed font-sans mb-4">
          To maintain extreme retrieval precision, query vectors remain unquantized in FP32 while document vectors are stored in SQ8. Asymmetric Distance Computation avoids quantizing the query and executes across unrolled 32-byte chunks:
        </p>

        <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-xs text-indigo-300 border border-slate-800 overflow-x-auto">
          {"\\langle Q, D \\rangle = D_{\\min} \\sum_{i=1}^{d} Q_i + \\frac{D_{\\text{diff}}}{255} \\sum_{i=1}^{d} \\left( Q_i \\cdot D_{\\text{quant}}[i] \\right)"}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">AVX2 256-bit Vectorized</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">ARM NEON Compatible</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">&lt; 0.05% Quantization Error</span>
          </div>
        </div>
      </div>
    </div>
  );
};
