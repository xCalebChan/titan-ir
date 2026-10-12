import React, { useState, useEffect } from 'react';
import { Search, Zap, GitBranch, Cpu, Sliders, Clock, ExternalLink, ShieldCheck, Filter, Terminal } from 'lucide-react';
import { SearchResponse, SearchHit } from '../types';
import { QUERY_SUGGESTIONS, simulateLocalSearch } from '../sampleData';

interface SearchConsoleProps {
  isBackendConnected: boolean;
}

export const SearchConsole: React.FC<SearchConsoleProps> = ({ isBackendConnected }) => {
  const [query, setQuery] = useState('Block-Max WAND dynamic pruning inverted index');
  const [mode, setMode] = useState<'hybrid' | 'lexical' | 'dense'>('hybrid');
  const [topK, setTopK] = useState(10);
  const [rrfK, setRrfK] = useState(60);
  const [rerank, setRerank] = useState(true);
  const [rerankCandidates, setRerankCandidates] = useState(50);
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);

  const executeSearch = async (targetQuery = query, targetMode = mode) => {
    if (!targetQuery.trim()) return;
    setLoading(true);

    if (isBackendConnected) {
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: targetQuery,
            mode: targetMode,
            top_k: topK,
            rrf_k: rrfK,
            rerank,
            rerank_candidates: rerankCandidates,
          }),
        });
        if (res.ok) {
          const data: SearchResponse = await res.json();
          setResponse(data);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Backend fetch failed, falling back to local hybrid engine', e);
      }
    }

    // In-browser simulation fallback
    setTimeout(() => {
      const localData = simulateLocalSearch(targetQuery, targetMode, topK, rrfK, rerank);
      setResponse(localData);
      setLoading(false);
    }, 35);
  };

  useEffect(() => {
    executeSearch();
  }, [mode]);

  const handleSuggestionClick = (preset: string) => {
    setQuery(preset);
    executeSearch(preset, mode);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono mb-2">
            <Terminal className="h-3.5 w-3.5 text-zinc-400" />
            Query Serving Path
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Hybrid Retrieval Console
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl mt-0.5">
            Execute sub-millisecond queries combining SIMD Elias-Fano Bitsets, SQ8 Quantized HNSW, and Cross-Encoder L2 reranking.
          </p>
        </div>

        {/* Mode Selector - Flat segmented control */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-md self-start sm:self-auto">
          <button
            onClick={() => setMode('hybrid')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mode === 'hybrid'
                ? 'bg-zinc-200 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Hybrid (RRF + L2)
          </button>
          <button
            onClick={() => setMode('lexical')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mode === 'lexical'
                ? 'bg-zinc-200 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lexical (WAND BM25)
          </button>
          <button
            onClick={() => setMode('dense')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mode === 'dense'
                ? 'bg-zinc-200 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Dense (SQ8 HNSW)
          </button>
        </div>
      </div>

      {/* Main Search Input */}
      <div className="relative mb-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
            placeholder="Type your technical query or select a preset below..."
            className="w-full pl-10 pr-28 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded border text-xs flex items-center gap-1 transition-colors ${
                showFilters
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-200'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Tuning Parameters"
            >
              <Sliders className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => executeSearch()}
              disabled={loading}
              className="px-3.5 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-medium transition-colors"
            >
              {loading ? 'Running...' : 'Execute'}
            </button>
          </div>
        </div>
      </div>

      {/* Query Preset Pills */}
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        <span className="text-xs font-mono text-zinc-500 flex items-center gap-1 mr-1">
          <Filter className="h-3 w-3" /> Presets:
        </span>
        {QUERY_SUGGESTIONS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(preset)}
            className="text-xs px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors font-mono"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Expandable Parameter Tuning Drawer */}
      {showFilters && (
        <div className="mb-6 p-4 rounded-lg bg-zinc-900/90 border border-zinc-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              Top-K Candidates ({topK})
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full accent-zinc-300"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              RRF Constant k ({rrfK})
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={rrfK}
              onChange={(e) => setRrfK(Number(e.target.value))}
              className="w-full accent-zinc-300"
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block mb-1">
              L2 Rerank Pool ({rerankCandidates})
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={rerankCandidates}
              onChange={(e) => setRerankCandidates(Number(e.target.value))}
              className="w-full accent-zinc-300"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start sm:gap-3 pt-2 sm:pt-4">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              L2 Cross-Encoder:
            </label>
            <button
              onClick={() => setRerank(!rerank)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                rerank
                  ? 'bg-zinc-200 text-zinc-950'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {rerank ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      )}

      {/* Performance & Execution Telemetry Bar */}
      {response && (
        <div className="mb-6 p-3.5 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center font-mono">
            <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
              <div className="text-[10px] uppercase text-zinc-500">Total Latency</div>
              <div className="text-base font-bold text-zinc-100 tabular-nums">
                {response.timing.total_ms} ms
              </div>
            </div>

            <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
              <div className="text-[10px] uppercase text-zinc-500">Lexical WAND</div>
              <div className="text-sm font-semibold text-zinc-300 tabular-nums">
                {response.timing.lexical_ms} ms
              </div>
            </div>

            <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
              <div className="text-[10px] uppercase text-zinc-500">Dense HNSW</div>
              <div className="text-sm font-semibold text-zinc-300 tabular-nums">
                {response.timing.dense_ms} ms
              </div>
            </div>

            <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
              <div className="text-[10px] uppercase text-zinc-500">L2 Reranking</div>
              <div className="text-sm font-semibold text-zinc-300 tabular-nums">
                {response.timing.rerank_ms} ms
              </div>
            </div>

            <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
              <div className="text-[10px] uppercase text-zinc-500">Blocks Skipped</div>
              <div className="text-sm font-semibold text-zinc-300 tabular-nums">
                {response.metrics.blocks_skipped} / {response.metrics.blocks_skipped + response.metrics.blocks_evaluated}
              </div>
            </div>

            <div className="p-2 rounded bg-zinc-950 border border-zinc-850">
              <div className="text-[10px] uppercase text-zinc-500">Pruning Ratio</div>
              <div className="text-sm font-semibold text-zinc-200 tabular-nums">
                {response.metrics.pruning_ratio_pct.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      {response && response.results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 px-1 font-mono">
            <span>SHOWING TOP {response.results.length} RANKED PASSAGES</span>
            <span>MODE: {response.mode.toUpperCase()}</span>
          </div>

          {response.results.map((hit, index) => (
            <div
              key={hit.doc_id}
              className="p-4 sm:p-5 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-zinc-300 font-mono text-xs font-semibold border border-zinc-700 shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-white">
                      {hit.title}
                    </h4>
                    <span className="text-[11px] text-zinc-500 font-mono">DocID: #{hit.doc_id}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono">
                  <div className="text-sm font-semibold text-zinc-100 tabular-nums">
                    {hit.final_score.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase">
                    {mode === 'hybrid' && hit.rerank_score !== undefined
                      ? 'L2 Cross-Encoder'
                      : mode === 'hybrid'
                      ? 'RRF Score'
                      : mode === 'lexical'
                      ? 'BM25 Score'
                      : 'Cosine Sim'}
                  </div>
                </div>
              </div>

              {/* Snippet */}
              <p className="mt-2.5 text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans pl-9">
                {hit.snippet}
              </p>

              {/* Score Decomposition Bar */}
              <div className="mt-3.5 pt-3 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-3 text-xs pl-9">
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
                  {hit.lexical_score !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                      BM25: {hit.lexical_score.toFixed(2)}
                    </span>
                  )}
                  {hit.dense_score !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                      Dense: {hit.dense_score.toFixed(3)}
                    </span>
                  )}
                  {hit.rrf_score !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 border border-zinc-800">
                      RRF: {hit.rrf_score.toFixed(4)}
                    </span>
                  )}
                  {hit.rerank_score !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-200 border border-zinc-700">
                      L2 Neural: {hit.rerank_score.toFixed(4)}
                    </span>
                  )}
                </div>

                {hit.url && (
                  <a
                    href={hit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
                  >
                    <span>{hit.url}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
