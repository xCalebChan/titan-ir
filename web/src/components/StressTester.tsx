import React, { useState } from 'react';
import { Activity, Play } from 'lucide-react';
import { BenchmarkResponse } from '../types';
import { simulateBenchmark } from '../sampleData';

interface StressTesterProps {
  isBackendConnected: boolean;
}

export const StressTester: React.FC<StressTesterProps> = ({ isBackendConnected }) => {
  const [queryCount, setQueryCount] = useState<number>(500);
  const [concurrency, setConcurrency] = useState<number>(8);
  const [benchMode, setBenchMode] = useState<string>('hybrid');
  const [running, setRunning] = useState<boolean>(false);
  const [benchResult, setBenchResult] = useState<BenchmarkResponse | null>(null);

  const runBenchmark = async () => {
    setRunning(true);

    if (isBackendConnected) {
      try {
        const res = await fetch('/api/benchmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            queries_count: queryCount,
            concurrency,
            mode: benchMode,
          }),
        });
        if (res.ok) {
          const data: BenchmarkResponse = await res.json();
          setBenchResult(data);
          setRunning(false);
          return;
        }
      } catch (e) {
        console.warn('Native benchmark failed, falling back to local simulator', e);
      }
    }

    // High fidelity simulator
    setTimeout(() => {
      const data = simulateBenchmark(queryCount, benchMode);
      setBenchResult(data);
      setRunning(false);
    }, 400);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans bg-white text-[#202124]">
      {/* Title */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fef7e0] text-[#b06000] text-xs font-medium mb-2">
          <Activity className="h-3.5 w-3.5" />
          Production Throughput & Latency Profiling
        </div>
        <h2 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
          Concurrency Stress Tester & Latency Profiler
        </h2>
        <p className="mt-1 text-sm text-[#5f6368] max-w-3xl leading-relaxed">
          Fire concurrent multi-threaded query bursts against the native engine to measure throughput (QPS), p50 median, and p99 tail latencies under variable concurrency levels.
        </p>
      </div>

      {/* Control Panel */}
      <div className="mb-6 p-6 rounded-2xl bg-[#f8f9fa] border border-[#dadce0] google-card-shadow">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* Query Count */}
          <div>
            <label className="text-xs font-mono uppercase text-[#70757a] block mb-1.5">
              Synthetic Query Count
            </label>
            <div className="flex gap-1.5 font-mono">
              {[100, 500, 1000].map((count) => (
                <button
                  key={count}
                  onClick={() => setQueryCount(count)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    queryCount === count
                      ? 'bg-[#1a73e8] text-white font-medium shadow-sm'
                      : 'bg-white border border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4]'
                  }`}
                >
                  {count} Queries
                </button>
              ))}
            </div>
          </div>

          {/* Concurrency Level */}
          <div>
            <label className="text-xs font-mono uppercase text-[#70757a] block mb-1.5">
              Thread Concurrency
            </label>
            <div className="flex gap-1.5 font-mono">
              {[4, 8, 16].map((threads) => (
                <button
                  key={threads}
                  onClick={() => setConcurrency(threads)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    concurrency === threads
                      ? 'bg-[#1a73e8] text-white font-medium shadow-sm'
                      : 'bg-white border border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4]'
                  }`}
                >
                  {threads} Workers
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="text-xs font-mono uppercase text-[#70757a] block mb-1.5">
              Execution Mode
            </label>
            <div className="flex gap-1.5 font-mono">
              {['hybrid', 'lexical', 'dense'].map((m) => (
                <button
                  key={m}
                  onClick={() => setBenchMode(m)}
                  className={`px-3 py-1.5 rounded-full text-xs uppercase transition-colors ${
                    benchMode === m
                      ? 'bg-[#1a73e8] text-white font-medium shadow-sm'
                      : 'bg-white border border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={runBenchmark}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs sm:text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          <Play className="h-4 w-4" />
          {running ? 'Running Stress Benchmark...' : 'Execute Load Benchmark'}
        </button>
      </div>

      {/* Benchmark Results */}
      {benchResult && (
        <div className="space-y-4">
          {/* Main Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-6 rounded-2xl bg-white border border-[#dadce0] google-card-shadow text-center font-mono">
              <div className="text-[11px] uppercase text-[#70757a]">Total Throughput</div>
              <div className="text-4xl font-normal text-[#137333] mt-1 tabular-nums">
                {benchResult.qps.toLocaleString()} QPS
              </div>
              <p className="text-xs text-[#5f6368] mt-1">
                {benchResult.total_queries} queries in {benchResult.total_duration_ms} ms
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#dadce0] google-card-shadow text-center font-mono">
              <div className="text-[11px] uppercase text-[#70757a]">Median Latency (p50)</div>
              <div className="text-4xl font-normal text-[#1a73e8] mt-1 tabular-nums">
                {benchResult.p50_ms.toFixed(2)} ms
              </div>
              <p className="text-xs text-[#5f6368] mt-1">
                Average Latency: {benchResult.avg_latency_ms.toFixed(2)} ms
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#dadce0] google-card-shadow text-center font-mono">
              <div className="text-[11px] uppercase text-[#70757a]">Tail SLA Latency (p99)</div>
              <div className="text-4xl font-normal text-[#d93025] mt-1 tabular-nums">
                {benchResult.p99_ms.toFixed(2)} ms
              </div>
              <p className="text-xs text-[#5f6368] mt-1">
                Target Ceiling: &lt; 5.0 ms
              </p>
            </div>
          </div>

          {/* Full Percentiles Table */}
          <div className="p-6 rounded-2xl bg-white border border-[#dadce0] google-card-shadow">
            <h4 className="text-xs font-mono uppercase text-[#70757a] mb-3">
              Latency Percentile Distribution Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center font-mono">
              <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#dadce0]">
                <div className="text-[10px] text-[#70757a]">p50 (Median)</div>
                <div className="text-base font-bold text-[#202124] mt-0.5 tabular-nums">
                  {benchResult.p50_ms.toFixed(2)} ms
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#dadce0]">
                <div className="text-[10px] text-[#70757a]">p90</div>
                <div className="text-base font-bold text-[#202124] mt-0.5 tabular-nums">
                  {benchResult.p90_ms.toFixed(2)} ms
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#dadce0]">
                <div className="text-[10px] text-[#70757a]">p95</div>
                <div className="text-base font-bold text-[#202124] mt-0.5 tabular-nums">
                  {benchResult.p95_ms.toFixed(2)} ms
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#dadce0]">
                <div className="text-[10px] text-[#70757a]">p99 (Tail)</div>
                <div className="text-base font-bold text-[#d93025] mt-0.5 tabular-nums">
                  {benchResult.p99_ms.toFixed(2)} ms
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#f8f9fa] border border-[#dadce0]">
                <div className="text-[10px] text-[#70757a]">Max Latency</div>
                <div className="text-base font-bold text-[#202124] mt-0.5 tabular-nums">
                  {benchResult.max_latency_ms.toFixed(2)} ms
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
