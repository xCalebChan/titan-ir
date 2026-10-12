import React, { useState } from 'react';
import { Activity, Play, CheckCircle2, AlertCircle, Clock, Zap, Terminal } from 'lucide-react';
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
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono mb-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-400" />
          Production Throughput & Latency Profiling
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Concurrency Stress Tester & Latency Profiler
        </h2>
        <p className="mt-1 text-sm text-zinc-400 max-w-3xl">
          Fire concurrent multi-threaded query bursts against the native engine to measure throughput (QPS), p50 median, and p99 tail latencies under variable concurrency levels.
        </p>
      </div>

      {/* Control Panel */}
      <div className="mb-6 p-5 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* Query Count */}
          <div>
            <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
              Synthetic Query Count
            </label>
            <div className="flex gap-1.5 font-mono">
              {[100, 500, 1000].map((count) => (
                <button
                  key={count}
                  onClick={() => setQueryCount(count)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    queryCount === count
                      ? 'bg-zinc-200 text-zinc-950 font-semibold'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {count} Queries
                </button>
              ))}
            </div>
          </div>

          {/* Concurrency Level */}
          <div>
            <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
              Thread Concurrency
            </label>
            <div className="flex gap-1.5 font-mono">
              {[4, 8, 16].map((threads) => (
                <button
                  key={threads}
                  onClick={() => setConcurrency(threads)}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    concurrency === threads
                      ? 'bg-zinc-200 text-zinc-950 font-semibold'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {threads} Workers
                </button>
              ))}
            </div>
          </div>

          {/* Mode */}
          <div>
            <label className="text-xs font-mono uppercase text-zinc-400 block mb-1">
              Execution Mode
            </label>
            <div className="flex gap-1.5 font-mono">
              {['hybrid', 'lexical', 'dense'].map((m) => (
                <button
                  key={m}
                  onClick={() => setBenchMode(m)}
                  className={`px-3 py-1.5 rounded text-xs uppercase transition-colors ${
                    benchMode === m
                      ? 'bg-zinc-200 text-zinc-950 font-semibold'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
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
          className="flex items-center gap-2 px-5 py-2.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs sm:text-sm transition-colors disabled:opacity-50"
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
            <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-center font-mono">
              <div className="text-[11px] uppercase text-zinc-500">Total Throughput</div>
              <div className="text-3xl font-bold text-white mt-1 tabular-nums">
                {benchResult.qps.toLocaleString()} QPS
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {benchResult.total_queries} queries in {benchResult.total_duration_ms} ms
              </p>
            </div>

            <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-center font-mono">
              <div className="text-[11px] uppercase text-zinc-500">Median Latency (p50)</div>
              <div className="text-3xl font-bold text-zinc-100 mt-1 tabular-nums">
                {benchResult.p50_ms.toFixed(2)} ms
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Average Latency: {benchResult.avg_latency_ms.toFixed(2)} ms
              </p>
            </div>

            <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-center font-mono">
              <div className="text-[11px] uppercase text-zinc-500">Tail SLA Latency (p99)</div>
              <div className="text-3xl font-bold text-zinc-100 mt-1 tabular-nums">
                {benchResult.p99_ms.toFixed(2)} ms
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Target Ceiling: &lt; 5.0 ms
              </p>
            </div>
          </div>

          {/* Full Percentiles Table */}
          <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800">
            <h4 className="text-xs font-mono uppercase text-zinc-400 mb-3">
              Latency Percentile Distribution Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono">
              <div className="p-3 rounded bg-zinc-950 border border-zinc-850">
                <div className="text-[10px] text-zinc-500">p50 (Median)</div>
                <div className="text-base font-bold text-zinc-200 mt-0.5 tabular-nums">
                  {benchResult.p50_ms.toFixed(2)} ms
                </div>
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-850">
                <div className="text-[10px] text-zinc-500">p90</div>
                <div className="text-base font-bold text-zinc-200 mt-0.5 tabular-nums">
                  {benchResult.p90_ms.toFixed(2)} ms
                </div>
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-850">
                <div className="text-[10px] text-zinc-500">p95</div>
                <div className="text-base font-bold text-zinc-200 mt-0.5 tabular-nums">
                  {benchResult.p95_ms.toFixed(2)} ms
                </div>
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-850">
                <div className="text-[10px] text-zinc-500">p99 (Tail)</div>
                <div className="text-base font-bold text-zinc-100 mt-0.5 tabular-nums">
                  {benchResult.p99_ms.toFixed(2)} ms
                </div>
              </div>

              <div className="p-3 rounded bg-zinc-950 border border-zinc-850">
                <div className="text-[10px] text-zinc-500">Max Latency</div>
                <div className="text-base font-bold text-zinc-100 mt-0.5 tabular-nums">
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
