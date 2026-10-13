import React, { useState } from 'react';
import { Cpu, Calculator } from 'lucide-react';
import { MathFormula } from './MathFormula';

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
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans bg-white text-[#202124]">
      {/* Title */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fce8e6] text-[#d93025] text-xs font-medium mb-2">
          <Cpu className="h-3.5 w-3.5" />
          Vector Compression & AVX2 Acceleration
        </div>
        <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
          Scalar Quantization (SQ8) & SIMD Dot Products
        </h2>
        <p className="mt-1 text-sm text-[#5f6368] max-w-3xl leading-relaxed">
          Transform 32-bit floating-point dimensions into 8-bit unsigned integers, cutting vector RAM by 75% and enabling AVX2/NEON integer dot products.
        </p>
      </div>

      {/* Memory Reduction Calculator */}
      <div className="mb-6 p-6 rounded-2xl bg-[#f8f9fa] border border-[#dadce0] google-card-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#1a73e8]" />
            <h3 className="text-base font-medium text-[#202124]">Corpus Vector RAM Calculator (384-dim Embeddings)</h3>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            {[100_000, 1_000_000, 5_000_000, 10_000_000].map((size) => (
              <button
                key={size}
                onClick={() => setCorpusSize(size)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  corpusSize === size
                    ? 'bg-[#1a73e8] text-white font-medium shadow-sm'
                    : 'bg-white border border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4]'
                }`}
              >
                {size >= 1_000_000 ? `${size / 1_000_000}M Docs` : `${size / 1000}k Docs`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
          <div className="p-4 rounded-xl bg-white border border-[#dadce0]">
            <div className="text-[11px] uppercase text-[#70757a]">Uncompressed FP32 RAM</div>
            <div className="text-2xl font-bold text-[#202124] mt-1 tabular-nums">{fp32Mb} MB</div>
            <div className="text-[11px] text-[#70757a] mt-1">4 bytes × 384 dims × {corpusSize.toLocaleString()} docs</div>
          </div>

          <div className="p-4 rounded-xl bg-[#e8f0fe] border border-[#1a73e8]">
            <div className="text-[11px] uppercase text-[#1a73e8]">Quantized SQ8 RAM (TitanIR)</div>
            <div className="text-2xl font-bold text-[#1a73e8] mt-1 tabular-nums">{sq8Mb} MB</div>
            <div className="text-[11px] text-[#1a73e8] mt-1">1 byte × 384 dims × {corpusSize.toLocaleString()} docs</div>
          </div>

          <div className="p-4 rounded-xl bg-[#e6f4ea] border border-[#ceead6]">
            <div className="text-[11px] uppercase text-[#137333]">Net RAM Saved</div>
            <div className="text-2xl font-bold text-[#137333] mt-1 tabular-nums">-{ramSavedMb} MB</div>
            <div className="text-[11px] text-[#137333] mt-1">4.0x Memory Compression (-75%)</div>
          </div>
        </div>
      </div>

      {/* Coordinate Quantization Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* FP32 Coordinates */}
        <div className="p-5 rounded-2xl bg-white border border-[#dadce0] google-card-shadow">
          <div className="flex items-center justify-between mb-3 font-mono">
            <h4 className="text-xs font-semibold text-[#202124]">
              Original FP32 Dimensions (32-bit floats)
            </h4>
            <span className="text-[11px] text-[#70757a]">4 Bytes / Coord</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {sampleFp32.map((val, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#f8f9fa] border border-[#dadce0]">
                <span className="text-[#70757a]">dim[{idx}]</span>
                <span className="text-[#202124] font-medium tabular-nums">{val.toFixed(4)}</span>
                <span className="text-[10px] text-[#9aa0a6]">IEEE 754 f32</span>
              </div>
            ))}
          </div>
        </div>

        {/* SQ8 Quantized Coordinates */}
        <div className="p-5 rounded-2xl bg-white border border-[#dadce0] google-card-shadow">
          <div className="flex items-center justify-between mb-3 font-mono">
            <h4 className="text-xs font-semibold text-[#1a73e8]">
              Quantized SQ8 Dimensions (8-bit uints)
            </h4>
            <span className="text-[11px] text-[#1a73e8]">1 Byte / Coord</span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {sampleSq8.map((val, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#e8f0fe] border border-[#d2e3fc]">
                <span className="text-[#1a73e8]">dim_quant[{idx}]</span>
                <span className="text-[#1a73e8] font-bold tabular-nums">{val}</span>
                <span className="text-[10px] text-[#1a73e8]">uint8 (0 - 255)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SIMD Integer Dot Product Acceleration */}
      <div className="p-6 rounded-2xl bg-[#f8f9fa] border border-[#dadce0] google-card-shadow">
        <h4 className="text-sm font-semibold text-[#202124] mb-1.5">
          SIMD Asymmetric Dot Product (ADC)
        </h4>
        <p className="text-xs text-[#5f6368] leading-relaxed font-sans mb-3">
          To maintain retrieval precision, query vectors remain unquantized in FP32 while document vectors are stored in SQ8. Asymmetric Distance Computation avoids quantizing the query and executes across unrolled 32-byte chunks using AVX2:
        </p>

        <div className="p-3.5 rounded-xl bg-white border border-[#dadce0] overflow-x-auto text-sm">
          <MathFormula formula="\\langle Q, D \\rangle = D_{\\min} \\sum_{i=1}^{d} Q_i + \\frac{D_{\\text{diff}}}{255} \\sum_{i=1}^{d} \\left( Q_i \\cdot D_{\\text{quant}}[i] \\right)" />
        </div>
      </div>
    </div>
  );
};
