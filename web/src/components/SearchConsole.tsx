import React, { useState, useEffect } from 'react';
import { Search, Zap, GitBranch, Cpu, Sliders, Clock, ExternalLink, ShieldCheck, Sparkles, Filter } from 'lucide-react';
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
    }, 40);
  };

  useEffect(() => {
    executeSearch();
  }, [mode, topK, rrfK, rerank, rerankCandidates]);

  const handleSuggestionClick = (suggested: string) => {
    setQuery(suggested);
    executeSearch(suggested, mode);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-indigo-400" />
            Hybrid Retrieval Console
          </h2>
          <p className="text-sm text-slate-400">
            Query across SIMD Elias-Fano Bitsets, SQ8 Quantized HNSW, and Cross-Encoder L2 reranking in sub-milliseconds.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setMode('hybrid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'hybrid'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Hybrid (RRF + L2)
          </button>
          <button
            onClick={() => setMode('lexical')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'lexical'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Lexical (WAND BM25)
          </button>
          <button
            onClick={() => setMode('dense')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'dense'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            Dense (SQ8 HNSW)
          </button>
        </div>
      </div>

      {/* Main Search Input */}
      <div className="relative mb-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
            placeholder="Type your technical query or select a preset below..."
            className="w-full pl-12 pr-32 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-base font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-xl"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
                showFilters
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title="Tuning Parameters"
            >
              <Sliders className="h-4 w-4" />
            </button>
            <button
              onClick={() => executeSearch()}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Query Suggestion Pills */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
          <Filter className="h-3 w-3" /> Quick Presets:
        </span>
        {QUERY_SUGGESTIONS.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(preset)}
            className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all font-mono"
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Expandable Parameter Tuning Drawer */}
      {showFilters && (
        <div className="mb-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in duration-200">
          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              Top-K Results ({topK})
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              RRF Constant k ({rrfK})
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={rrfK}
              onChange={(e) => setRrfK(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
              L2 Rerank Candidates ({rerankCandidates})
            </label>
            <input
              type="range"
              min="20"
              max="100"
              value={rerankCandidates}
              onChange={(e) => setRerankCandidates(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start sm:gap-4 pt-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              L2 Cross-Encoder
            </label>
            <button
              onClick={() => setRerank(!rerank)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                rerank
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {rerank ? 'ENABLED' : 'OFF'}
            </button>
          </div>
        </div>
      )}

      {/* Performance & Execution Telemetry Bar */}
      {response && (
        <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center">
            {/* Total Latency */}
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Total Latency</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                {response.timing.total_ms} ms
              </div>
            </div>

            {/* Lexical WAND time */}
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Lexical WAND</div>
              <div className="text-base font-bold text-indigo-400 font-mono">
                {response.timing.lexical_ms} ms
              </div>
            </div>

            {/* Dense HNSW time */}
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Dense HNSW</div>
              <div className="text-base font-bold text-cyan-400 font-mono">
                {response.timing.dense_ms} ms
              </div>
            </div>

            {/* L2 Rerank time */}
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400">L2 Reranking</div>
              <div className="text-base font-bold text-purple-400 font-mono">
                {response.timing.rerank_ms} ms
              </div>
            </div>

            {/* Dynamic Pruning Ratio */}
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Blocks Skipped</div>
              <div className="text-base font-bold text-amber-400 font-mono">
                {response.metrics.blocks_skipped} / {response.metrics.blocks_skipped + response.metrics.blocks_evaluated}
              </div>
            </div>

            {/* Pruning Efficiency */}
            <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Pruning Ratio</div>
              <div className="text-base font-bold text-emerald-400 font-mono">
                {response.metrics.pruning_ratio_pct.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results List */}
      {response && response.results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
            <span>SHOWING TOP {response.results.length} RANKED PASSAGES</span>
            <span>MODE: {response.mode.toUpperCase()}</span>
          </div>

          {response.results.map((hit, index) => (
            <div
              key={hit.doc_id}
              className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all hover:bg-slate-900 shadow-md group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 font-bold font-mono text-xs border border-indigo-500/30">
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {hit.title}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">DocID: {hit.doc_id}</span>
                  </div>
                </div>

                {/* Overall Score Pill */}
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    Score: {hit.final_score.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    {mode === 'hybrid' && hit.rerank_score !== undefined ? 'Cross-Encoder Softmax' : mode === 'hybrid' ? 'RRF Fusion' : mode === 'lexical' ? 'BM25 Score' : 'Cosine Distance'}
                  </div>
                </div>
              </div>

              {/* Snippet */}
              <p className="mt-3 text-sm text-slate-300 leading-relaxed font-sans">
                {hit.snippet}
              </p>

              {/* Score Decomposition Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  {hit.lexical_score !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-indigo-500/20">
                      BM25: {hit.lexical_score.toFixed(2)}
                    </span>
                  )}
                  {hit.dense_score !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-cyan-500/20">
                      Dense Cos: {hit.dense_score.toFixed(3)}
                    </span>
                  )}
                  {hit.rrf_score !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 border border-purple-500/20">
                      RRF: {hit.rrf_score.toFixed(4)}
                    </span>
                  )}
                  {hit.rerank_score !== undefined && (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-emerald-500/20">
                      L2 Neural: {hit.rerank_score.toFixed(4)}
                    </span>
                  )}
                </div>

                {hit.url && (
                  <a
                    href={hit.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-400 transition-colors font-mono"
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
