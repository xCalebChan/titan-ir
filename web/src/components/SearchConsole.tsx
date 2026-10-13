import React, { useState, useEffect } from 'react';
import { Search, X, Sliders, ExternalLink, Sparkles, Zap, GitBranch, Cpu, BookOpen, Layers, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { SearchResponse, SearchHit } from '../types';
import { QUERY_SUGGESTIONS, simulateLocalSearch } from '../sampleData';

interface SearchConsoleProps {
  isBackendConnected: boolean;
  onNavigateTab?: (tab: string) => void;
  externalQuery?: string;
}

export const SearchConsole: React.FC<SearchConsoleProps> = ({
  isBackendConnected,
  onNavigateTab,
  externalQuery,
}) => {
  const [query, setQuery] = useState(externalQuery || '');
  const [hasSearched, setHasSearched] = useState(Boolean(externalQuery));
  const [mode, setMode] = useState<'hybrid' | 'lexical' | 'dense'>('hybrid');
  const [topK, setTopK] = useState(10);
  const [rrfK, setRrfK] = useState(60);
  const [rerank, setRerank] = useState(true);
  const [rerankCandidates, setRerankCandidates] = useState(50);
  const [showTools, setShowTools] = useState(false);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SearchResponse | null>(null);

  useEffect(() => {
    if (externalQuery && externalQuery !== query) {
      setQuery(externalQuery);
      executeSearch(externalQuery, mode);
    }
  }, [externalQuery]);

  const executeSearch = async (targetQuery = query, targetMode = mode) => {
    if (!targetQuery.trim()) return;
    setLoading(true);
    setHasSearched(true);

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

  const handlePresetClick = (preset: string) => {
    setQuery(preset);
    executeSearch(preset, mode);
  };

  const handleFeelingLucky = () => {
    const randomQuery = QUERY_SUGGESTIONS[Math.floor(Math.random() * QUERY_SUGGESTIONS.length)];
    setQuery(randomQuery);
    executeSearch(randomQuery, mode);
  };

  // 1. GOOGLE HOME VIEW (Initial State before searching)
  if (!hasSearched) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 font-sans bg-white">
        <div className="max-w-2xl mx-auto w-full text-center my-auto">
          {/* Google Logo */}
          <div className="select-none mb-6">
            <span className="text-6xl sm:text-7xl font-normal tracking-tight">
              <span className="text-[#4285f4]">T</span>
              <span className="text-[#ea4335]">i</span>
              <span className="text-[#fbbc05]">t</span>
              <span className="text-[#4285f4]">a</span>
              <span className="text-[#34a853]">n</span>
              <span className="text-[#ea4335] ml-1 font-medium">Search</span>
            </span>
            <div className="mt-2 text-xs font-mono uppercase tracking-wider text-[#70757a]">
              Full-Text & Vector Search Engine (TitanSearch) · MS MARCO 8.8M Dataset
            </div>
          </div>

          {/* Google Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              executeSearch();
            }}
            className="w-full relative mb-6"
          >
            <div className="relative flex items-center w-full rounded-full border border-[#dfe1e5] hover:border-transparent hover:google-search-shadow focus-within:google-search-shadow focus-within:border-transparent transition-all bg-white px-4 py-3">
              <Search className="h-5 w-5 text-[#9aa0a6] mr-3 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 8.8M passages or technical concepts..."
                className="w-full text-base text-[#202124] focus:outline-none placeholder-[#80868b]"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-[#70757a] hover:text-[#202124] mr-2"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Google Search Buttons */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] rounded text-sm text-[#3c4043] font-normal transition-colors"
              >
                Titan Search
              </button>
              <button
                type="button"
                onClick={handleFeelingLucky}
                className="px-4 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] rounded text-sm text-[#3c4043] font-normal transition-colors"
              >
                I&apos;m Feeling Lucky
              </button>
            </div>
          </form>

          {/* Quick Presets */}
          <div className="mt-4 text-xs text-[#70757a]">
            <span>Try searching: </span>
            <div className="inline-flex flex-wrap justify-center gap-2 mt-2">
              {QUERY_SUGGESTIONS.slice(0, 4).map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset)}
                  className="text-[#1a0dab] hover:underline"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Google Home Footer */}
        <div className="max-w-4xl mx-auto w-full text-center text-xs text-[#70757a] border-t border-[#dadce0] pt-4 mt-8 space-y-1">
          <div>Built by an engineer at Mozilla · Interested in modern hybrid search & information retrieval</div>
          <div className="text-[11px] text-[#9aa0a6] font-mono">
            Rust 2021 · SIMD Elias-Fano · SQ8 Quantized HNSW · ONNX Runtime Cross-Encoder
          </div>
        </div>
      </div>
    );
  }

  // 2. GOOGLE SEARCH RESULTS VIEW
  return (
    <div className="bg-white min-h-[calc(100vh-4rem)] font-sans">
      {/* Google Sub-header / Tabs Bar */}
      <div className="border-b border-[#dadce0] bg-white sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile search bar if on small screen */}
          <div className="md:hidden py-2.5">
            <div className="relative flex items-center w-full rounded-full border border-[#dfe1e5] px-3 py-2 text-sm">
              <Search className="h-4 w-4 text-[#9aa0a6] mr-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                className="w-full text-sm text-[#202124] focus:outline-none"
              />
              <button
                onClick={() => executeSearch()}
                className="ml-2 text-xs font-medium text-[#1a73e8]"
              >
                Go
              </button>
            </div>
          </div>

          {/* Google Search Mode Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto text-sm text-[#5f6368] font-normal scrollbar-none">
            <button
              onClick={() => {
                setMode('hybrid');
                executeSearch(query, 'hybrid');
              }}
              className={`flex items-center gap-1.5 py-3 border-b-2 whitespace-nowrap transition-colors ${
                mode === 'hybrid'
                  ? 'border-[#1a73e8] text-[#1a73e8] font-medium'
                  : 'border-transparent hover:text-[#202124]'
              }`}
            >
              <Search className="h-4 w-4" />
              All (Hybrid)
            </button>

            <button
              onClick={() => {
                setMode('lexical');
                executeSearch(query, 'lexical');
              }}
              className={`flex items-center gap-1.5 py-3 border-b-2 whitespace-nowrap transition-colors ${
                mode === 'lexical'
                  ? 'border-[#1a73e8] text-[#1a73e8] font-medium'
                  : 'border-transparent hover:text-[#202124]'
              }`}
            >
              <Zap className="h-4 w-4" />
              Lexical (BM25)
            </button>

            <button
              onClick={() => {
                setMode('dense');
                executeSearch(query, 'dense');
              }}
              className={`flex items-center gap-1.5 py-3 border-b-2 whitespace-nowrap transition-colors ${
                mode === 'dense'
                  ? 'border-[#1a73e8] text-[#1a73e8] font-medium'
                  : 'border-transparent hover:text-[#202124]'
              }`}
            >
              <GitBranch className="h-4 w-4" />
              Dense (SQ8 HNSW)
            </button>

            {onNavigateTab && (
              <>
                <button
                  onClick={() => onNavigateTab('dictionary')}
                  className="flex items-center gap-1.5 py-3 border-b-2 border-transparent hover:text-[#202124] whitespace-nowrap"
                >
                  <BookOpen className="h-4 w-4" />
                  Dictionary
                </button>

                <button
                  onClick={() => onNavigateTab('pipeline')}
                  className="flex items-center gap-1.5 py-3 border-b-2 border-transparent hover:text-[#202124] whitespace-nowrap"
                >
                  <Layers className="h-4 w-4" />
                  Architecture
                </button>

                <button
                  onClick={() => onNavigateTab('about')}
                  className="flex items-center gap-1.5 py-3 border-b-2 border-transparent hover:text-[#202124] whitespace-nowrap"
                >
                  <Info className="h-4 w-4" />
                  About
                </button>
              </>
            )}

            <button
              onClick={() => setShowTools(!showTools)}
              className={`flex items-center gap-1 py-3 border-b-2 border-transparent ml-auto text-xs whitespace-nowrap ${
                showTools ? 'text-[#1a73e8]' : 'hover:text-[#202124]'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              Tools
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Tools Strip (Top-K, Rerank tuning) */}
      {showTools && (
        <div className="border-b border-[#dadce0] bg-[#f8f9fa] py-3 text-xs text-[#3c4043]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-6 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#70757a]">Top-K:</span>
              <select
                value={topK}
                onChange={(e) => {
                  setTopK(Number(e.target.value));
                  executeSearch();
                }}
                className="bg-white border border-[#dadce0] rounded px-2 py-0.5"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#70757a]">L2 Cross-Encoder:</span>
              <button
                onClick={() => {
                  setRerank(!rerank);
                  executeSearch();
                }}
                className={`px-2 py-0.5 rounded ${
                  rerank ? 'bg-[#1a73e8] text-white' : 'bg-white border border-[#dadce0]'
                }`}
              >
                {rerank ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#70757a]">RRF k:</span>
              <span>{rrfK}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Telemetry line: "About X results (0.38 milliseconds)" */}
        {response && (
          <div className="text-xs text-[#70757a] mb-5">
            About {response.results.length} results ({response.timing.total_ms} milliseconds)
          </div>
        )}

        {/* Google 2-Column Layout: Results on Left, Knowledge Panel on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Search Results (8 cols) */}
          <div className="lg:col-span-8 space-y-7">
            {loading ? (
              <div className="py-12 text-sm text-[#70757a]">
                Retrieving and reranking candidates across lexical and vector indexes...
              </div>
            ) : response && response.results.length > 0 ? (
              response.results.map((hit, idx) => (
                <div key={hit.doc_id} className="max-w-2xl font-sans">
                  {/* Google Breadcrumb / URL */}
                  <div className="flex items-center gap-2 text-xs text-[#202124] mb-1">
                    <span className="text-[#70757a] truncate">https://titansearch.engine › doc › #{hit.doc_id}</span>
                  </div>

                  {/* Google Blue Link Title */}
                  <h3 className="text-xl font-normal text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                    {hit.title}
                  </h3>

                  {/* Google Snippet Body */}
                  <p className="mt-1 text-sm text-[#4d5156] leading-relaxed">
                    {hit.snippet}
                  </p>

                  {/* Technical Meta Line */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#70757a]">
                    <span className="font-semibold text-[#137333]">Score: {hit.final_score.toFixed(4)}</span>
                    {hit.lexical_score !== undefined && (
                      <span>BM25: {hit.lexical_score.toFixed(2)}</span>
                    )}
                    {hit.dense_score !== undefined && (
                      <span>Dense: {hit.dense_score.toFixed(3)}</span>
                    )}
                    {hit.rrf_score !== undefined && (
                      <span>RRF: {hit.rrf_score.toFixed(4)}</span>
                    )}
                    {hit.rerank_score !== undefined && (
                      <span className="text-[#1a73e8] font-medium">L2: {hit.rerank_score.toFixed(4)}</span>
                    )}
                    {hit.url && (
                      <a
                        href={hit.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#70757a] hover:text-[#1a0dab] ml-auto flex items-center gap-0.5"
                      >
                        source <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-[#70757a] text-sm">
                No matching passages found for &quot;{query}&quot;. Try a broader term.
              </div>
            )}
          </div>

          {/* Right Column: Google Knowledge Panel Card (4 cols) */}
          <div className="lg:col-span-4">
            <div className="border border-[#dadce0] rounded-2xl p-5 bg-white google-card-shadow space-y-4 sticky top-36">
              {/* Header */}
              <div className="border-b border-[#dadce0] pb-3">
                <span className="text-xs uppercase tracking-wider text-[#70757a] font-mono">
                  Engine Knowledge Panel
                </span>
                <h3 className="text-xl font-normal text-[#202124] mt-0.5">
                  TitanSearch Engine
                </h3>
                <p className="text-xs text-[#5f6368] mt-0.5">
                  Full-Text & Vector Search Platform
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-[#3c4043] leading-relaxed">
                TitanSearch combines <strong>SIMD Elias-Fano Block-Max WAND</strong>, <strong>SQ8 Quantized HNSW</strong>, and <strong>L2 Cross-Encoder reranking</strong> in native Rust to serve MS MARCO benchmark queries in sub-milliseconds.
              </p>

              {/* Live Query Telemetry */}
              {response && (
                <div className="bg-[#f8f9fa] border border-[#dadce0] rounded-xl p-3 space-y-2 text-xs font-mono">
                  <div className="text-[11px] font-semibold text-[#202124] uppercase tracking-wider">
                    Query Telemetry
                  </div>
                  <div className="flex justify-between text-[#5f6368]">
                    <span>Total Latency:</span>
                    <span className="font-bold text-[#137333]">{response.timing.total_ms} ms</span>
                  </div>
                  <div className="flex justify-between text-[#5f6368]">
                    <span>Lexical WAND:</span>
                    <span>{response.timing.lexical_ms} ms</span>
                  </div>
                  <div className="flex justify-between text-[#5f6368]">
                    <span>Dense HNSW:</span>
                    <span>{response.timing.dense_ms} ms</span>
                  </div>
                  <div className="flex justify-between text-[#5f6368]">
                    <span>L2 Rerank:</span>
                    <span>{response.timing.rerank_ms} ms</span>
                  </div>
                  <div className="flex justify-between text-[#5f6368] border-t border-[#dadce0] pt-1">
                    <span>Blocks Skipped:</span>
                    <span className="text-[#1a73e8]">{response.metrics.blocks_skipped} / {response.metrics.blocks_skipped + response.metrics.blocks_evaluated}</span>
                  </div>
                  <div className="flex justify-between text-[#5f6368]">
                    <span>Pruning Efficiency:</span>
                    <span className="text-[#137333] font-semibold">{response.metrics.pruning_ratio_pct.toFixed(1)}%</span>
                  </div>
                </div>
              )}

              {/* Metadata Attributes */}
              <div className="space-y-2 text-xs border-t border-[#dadce0] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#70757a]">Engine Language:</span>
                  <span className="font-medium text-[#202124]">Rust 2021 Edition</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#70757a]">Corpus:</span>
                  <span className="font-medium text-[#202124]">MS MARCO (8.8M Docs)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#70757a]">Author Context:</span>
                  <span className="font-medium text-[#1a73e8]">Mozilla Engineer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#70757a]">Evaluation nDCG:</span>
                  <span className="font-medium text-[#137333]">0.671 (+36% over BM25)</span>
                </div>
              </div>

              {/* Action Links */}
              {onNavigateTab && (
                <div className="border-t border-[#dadce0] pt-3 flex flex-col gap-1.5 text-xs">
                  <button
                    onClick={() => onNavigateTab('about')}
                    className="text-left text-[#1a0dab] hover:underline flex items-center justify-between"
                  >
                    <span>Read About TitanSearch & Dataset</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onNavigateTab('dictionary')}
                    className="text-left text-[#1a0dab] hover:underline flex items-center justify-between"
                  >
                    <span>Browse Technical Dictionary</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onNavigateTab('pipeline')}
                    className="text-left text-[#1a0dab] hover:underline flex items-center justify-between"
                  >
                    <span>Inspect Pipeline Architecture</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
