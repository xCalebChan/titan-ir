import React, { useState, useEffect } from 'react';
import { 
  Database, Upload, FileText, CheckCircle2, Sparkles, RefreshCw, 
  Trash2, ArrowRight, ExternalLink, AlertCircle, FileCode, Layers, Search
} from 'lucide-react';
import { 
  getActiveDataset, setActiveDatasetId, getCustomDataset, 
  saveCustomDataset, parseDatasetText, MSMARCO_DATASET_META, 
  AIML_DATASET_META, SYSTEMS_DATASET_META, subscribeDatasetChange 
} from '../datasetStore';
import { DocumentPassage, DatasetMeta } from '../types';

interface DatasetManagerProps {
  onNavigateToSearch?: (suggestedQuery?: string) => void;
  onClose?: () => void;
}

export const DatasetManager: React.FC<DatasetManagerProps> = ({
  onNavigateToSearch,
  onClose,
}) => {
  const [activeInfo, setActiveInfo] = useState(() => getActiveDataset());
  const [customInfo, setCustomInfo] = useState(() => getCustomDataset());

  // Importer state
  const [datasetName, setDatasetName] = useState('My Custom Corpus');
  const [rawText, setRawText] = useState('');
  const [format, setFormat] = useState<'auto' | 'json' | 'csv' | 'lines'>('auto');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<DocumentPassage[]>([]);
  const [indexingStats, setIndexingStats] = useState<{
    docCount: number;
    tokenCount: number;
    vocabCount: number;
    durationMs: number;
  } | null>(null);

  // Sync when active dataset changes
  useEffect(() => {
    const unsubscribe = subscribeDatasetChange(() => {
      setActiveInfo(getActiveDataset());
      setCustomInfo(getCustomDataset());
    });
    return unsubscribe;
  }, []);

  const handleSelectPreset = (id: string, suggestedQuery?: string) => {
    setActiveDatasetId(id);
    if (onNavigateToSearch && suggestedQuery) {
      onNavigateToSearch(suggestedQuery);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDatasetName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        runPreview(content, format);
      }
    };
    reader.readAsText(file);
  };

  const runPreview = (text: string, fmt: 'auto' | 'json' | 'csv' | 'lines') => {
    setParseError(null);
    setIndexingStats(null);
    if (!text.trim()) {
      setParsedPreview([]);
      return;
    }

    const result = parseDatasetText(text, fmt);
    if (result.success) {
      setParsedPreview(result.passages);
    } else {
      setParseError(result.error || 'Failed to parse dataset.');
      setParsedPreview([]);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    runPreview(val, format);
  };

  const handleFormatChange = (newFmt: 'auto' | 'json' | 'csv' | 'lines') => {
    setFormat(newFmt);
    if (rawText) {
      runPreview(rawText, newFmt);
    }
  };

  const loadSampleJSON = () => {
    const sample = JSON.stringify(
      [
        {
          title: "Quantum Computing & Qubit Superposition",
          body: "Quantum computing harnesses principles of quantum mechanics such as superposition and entanglement to solve intractable problems in cryptography, material science, and optimization.",
          url: "https://example.com/quantum"
        },
        {
          title: "CRISPR-Cas9 Gene Editing",
          body: "CRISPR-Cas9 is a revolutionary biomolecular technology that allows geneticists to add, remove, or alter sections of the DNA sequence with surgical precision.",
          url: "https://example.com/crispr"
        },
        {
          title: "James Webb Space Telescope Discoveries",
          body: "The James Webb Space Telescope uses infrared astronomy to peer back over 13.5 billion years to observe the formation of the universe's earliest stars and galaxies.",
          url: "https://example.com/jwst"
        },
        {
          title: "Solid-State Battery Technology",
          body: "Solid-state batteries replace flammable liquid electrolytes with solid ceramics or polymers, increasing energy density by up to 80% and eliminating thermal runaway risk.",
          url: "https://example.com/batteries"
        }
      ],
      null,
      2
    );
    setDatasetName('Science & Technology Frontier');
    setFormat('json');
    setRawText(sample);
    runPreview(sample, 'json');
  };

  const loadSampleCSV = () => {
    const sample = `Title,Body,URL
PostgreSQL MVCC Architecture,"PostgreSQL implements Multi-Version Concurrency Control (MVCC) where write operations create new row tuples rather than overwriting existing data, avoiding table read locks.",https://postgresql.org
Redis In-Memory Data Structures,"Redis is an in-memory key-value data store that supports strings, hashes, sorted sets, streams, and bitmaps with sub-millisecond read latency.",https://redis.io
Apache Kafka Event Streaming,"Kafka provides a distributed, partitioned, replicated commit log service designed for high-throughput real-time event ingestion and pub-sub stream processing.",https://kafka.apache.org
CockroachDB Distributed SQL,"CockroachDB is a cloud-native distributed SQL database that uses Raft consensus for cross-node replication and serializable transaction isolation.",https://cockroachlabs.com`;
    setDatasetName('Modern Database Systems');
    setFormat('csv');
    setRawText(sample);
    runPreview(sample, 'csv');
  };

  const loadSampleLines = () => {
    const sample = `Rust Borrow Checker: The Rust compiler statically verifies memory safety and guarantees race-free concurrency by enforcing strict ownership and borrow rules at compile time.
Go Goroutines & Channels: Go implements lightweight user-space goroutines scheduled by a work-stealing runtime over OS threads, communicating via CSP channels.
Python Global Interpreter Lock: CPython uses a Global Interpreter Lock (GIL) to protect reference-counted memory management from concurrent multi-threaded execution.
TypeScript Static Typing: TypeScript is a typed superset of JavaScript that compiles to plain JavaScript, providing compile-time type safety and advanced generic interfaces.`;
    setDatasetName('Programming Languages Core');
    setFormat('lines');
    setRawText(sample);
    runPreview(sample, 'lines');
  };

  const handleBuildIndex = () => {
    if (parsedPreview.length === 0) return;

    const start = performance.now();
    // Compute simple indexing telemetry
    let totalTokens = 0;
    const vocab = new Set<string>();

    parsedPreview.forEach((p) => {
      const words = (p.title + ' ' + p.body).toLowerCase().split(/\s+/).filter(w => w.length > 2);
      totalTokens += words.length;
      words.forEach(w => vocab.add(w));
    });

    const elapsed = Number((performance.now() - start).toFixed(2));

    saveCustomDataset(datasetName, parsedPreview);
    setIndexingStats({
      docCount: parsedPreview.length,
      tokenCount: totalTokens,
      vocabCount: vocab.size,
      durationMs: Math.max(0.8, elapsed),
    });
  };

  const handleClearCustom = () => {
    try {
      localStorage.removeItem('titan_custom_dataset_v1');
    } catch {}
    setCustomInfo(null);
    if (activeInfo.meta.is_custom) {
      setActiveDatasetId('msmarco');
    }
  };

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 font-sans bg-white text-[#202124]">
      {/* Header */}
      <div className="mb-6 border-b border-[#dadce0] pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium mb-2">
            <Database className="h-3.5 w-3.5" />
            Dataset Ingestion & Search Target
          </div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
            Dataset Manager & Custom Corpus Importer
          </h1>
          <p className="mt-1 text-sm text-[#5f6368] max-w-2xl leading-relaxed">
            Select a pre-loaded information retrieval benchmark, or import your own document dataset (JSON, CSV, or Text) to build an in-memory inverted index and execute BM25 & dense vector search.
          </p>
        </div>

        {/* Active Dataset Pill */}
        <div className="p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-xl text-left sm:text-right shrink-0">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#70757a]">
            Active Search Corpus
          </div>
          <div className="text-sm font-medium text-[#202124] flex items-center gap-1.5 justify-start sm:justify-end mt-0.5">
            <span className="h-2 w-2 rounded-full bg-[#34a853]" />
            {activeInfo.meta.name}
          </div>
          <div className="text-xs text-[#5f6368] font-mono">
            {activeInfo.meta.document_count} passages indexed
          </div>
        </div>
      </div>

      {/* Preset Benchmarks Grid */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#70757a] mb-3">
          1. Select Built-in Retrieval Benchmark
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* MS MARCO */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              activeInfo.meta.id === 'msmarco'
                ? 'bg-[#e8f0fe]/60 border-[#1a73e8] shadow-sm'
                : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0]">
                Standard IR
              </span>
              {activeInfo.meta.id === 'msmarco' && (
                <span className="text-xs font-medium text-[#1a73e8] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active
                </span>
              )}
            </div>
            <h3 className="text-base font-medium text-[#202124] mb-1">
              MS MARCO Passage Benchmark
            </h3>
            <p className="text-xs text-[#5f6368] leading-relaxed mb-3">
              Standard TREC information retrieval corpus. Covers search engine indexing, WAND pruning, Elias-Fano, and HNSW graphs.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#e8eaed]">
              <span className="text-[11px] font-mono text-[#70757a]">15 Curated Passages</span>
              <button
                onClick={() => handleSelectPreset('msmarco', 'Block-Max WAND dynamic pruning')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                  activeInfo.meta.id === 'msmarco'
                    ? 'bg-[#1a73e8] text-white'
                    : 'bg-[#f1f3f4] text-[#3c4043] hover:bg-[#e8f0fe] hover:text-[#1a73e8]'
                }`}
              >
                {activeInfo.meta.id === 'msmarco' ? 'Currently Active' : 'Activate & Search'}
              </button>
            </div>
          </div>

          {/* AI & ML */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              activeInfo.meta.id === 'ai-ml'
                ? 'bg-[#e8f0fe]/60 border-[#1a73e8] shadow-sm'
                : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0]">
                AI & Deep Learning
              </span>
              {activeInfo.meta.id === 'ai-ml' && (
                <span className="text-xs font-medium text-[#1a73e8] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active
                </span>
              )}
            </div>
            <h3 className="text-base font-medium text-[#202124] mb-1">
              AI & Machine Learning Knowledge Base
            </h3>
            <p className="text-xs text-[#5f6368] leading-relaxed mb-3">
              Technical corpus on Transformers, RAG pipelines, FlashAttention, LoRA fine-tuning, ColBERT, and Vector Databases.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#e8eaed]">
              <span className="text-[11px] font-mono text-[#70757a]">8 Technical Passages</span>
              <button
                onClick={() => handleSelectPreset('ai-ml', 'transformer self attention RAG architecture')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                  activeInfo.meta.id === 'ai-ml'
                    ? 'bg-[#1a73e8] text-white'
                    : 'bg-[#f1f3f4] text-[#3c4043] hover:bg-[#e8f0fe] hover:text-[#1a73e8]'
                }`}
              >
                {activeInfo.meta.id === 'ai-ml' ? 'Currently Active' : 'Activate & Search'}
              </button>
            </div>
          </div>

          {/* Systems */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              activeInfo.meta.id === 'systems'
                ? 'bg-[#e8f0fe]/60 border-[#1a73e8] shadow-sm'
                : 'bg-white border-[#dadce0] hover:border-[#bdc1c6]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0]">
                Systems & OS
              </span>
              {activeInfo.meta.id === 'systems' && (
                <span className="text-xs font-medium text-[#1a73e8] flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Active
                </span>
              )}
            </div>
            <h3 className="text-base font-medium text-[#202124] mb-1">
              Systems & Distributed Computing
            </h3>
            <p className="text-xs text-[#5f6368] leading-relaxed mb-3">
              Core systems topics: Linux virtual memory page tables, LSM storage trees, Raft consensus, zero-copy io_uring, and SIMD.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[#e8eaed]">
              <span className="text-[11px] font-mono text-[#70757a]">8 Systems Passages</span>
              <button
                onClick={() => handleSelectPreset('systems', 'linux virtual memory page tables mmap')}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer ${
                  activeInfo.meta.id === 'systems'
                    ? 'bg-[#1a73e8] text-white'
                    : 'bg-[#f1f3f4] text-[#3c4043] hover:bg-[#e8f0fe] hover:text-[#1a73e8]'
                }`}
              >
                {activeInfo.meta.id === 'systems' ? 'Currently Active' : 'Activate & Search'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Dataset Importer Section */}
      <div className="border border-[#dadce0] bg-white rounded-2xl p-6 sm:p-8 space-y-6 google-card-shadow">
        <div className="border-b border-[#dadce0] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#1a73e8]" />
              <h2 className="text-lg font-medium text-[#202124]">
                2. Import Your Own Custom Dataset
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#5f6368]">
              Paste documents or upload a file. The engine will parse text, build an inverted index, and make it immediately searchable.
            </p>
          </div>

          {/* Quick Template Fillers */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[#70757a]">Load Template:</span>
            <button
              onClick={loadSampleJSON}
              className="px-2.5 py-1 rounded-full bg-[#f8f9fa] border border-[#dadce0] text-xs font-mono text-[#3c4043] hover:bg-[#e8f0fe] hover:text-[#1a73e8] transition-colors cursor-pointer"
            >
              JSON
            </button>
            <button
              onClick={loadSampleCSV}
              className="px-2.5 py-1 rounded-full bg-[#f8f9fa] border border-[#dadce0] text-xs font-mono text-[#3c4043] hover:bg-[#e8f0fe] hover:text-[#1a73e8] transition-colors cursor-pointer"
            >
              CSV
            </button>
            <button
              onClick={loadSampleLines}
              className="px-2.5 py-1 rounded-full bg-[#f8f9fa] border border-[#dadce0] text-xs font-mono text-[#3c4043] hover:bg-[#e8f0fe] hover:text-[#1a73e8] transition-colors cursor-pointer"
            >
              Plain Text
            </button>
          </div>
        </div>

        {/* Dataset Metadata Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-8">
            <label className="block text-xs font-medium text-[#3c4043] mb-1">
              Dataset Name
            </label>
            <input
              type="text"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="e.g. My Research Papers, Customer Feedback, Code Snippets"
              className="w-full px-3.5 py-2 rounded-xl border border-[#dfe1e5] focus:outline-none focus:border-[#1a73e8] text-sm text-[#202124]"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-medium text-[#3c4043] mb-1">
              Format Parsing Mode
            </label>
            <div className="flex items-center gap-1">
              {(['auto', 'json', 'csv', 'lines'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => handleFormatChange(fmt)}
                  className={`flex-1 py-2 rounded-lg text-xs font-mono uppercase transition-colors cursor-pointer ${
                    format === fmt
                      ? 'bg-[#1a73e8] text-white font-medium'
                      : 'bg-[#f8f9fa] border border-[#dadce0] text-[#5f6368] hover:bg-[#f1f3f4]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Upload or Paste Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#70757a]">
            <span>Paste document content or upload file (.json, .csv, .tsv, .txt)</span>
            <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8f9fa] border border-[#dadce0] text-[#1a73e8] hover:bg-[#e8f0fe] cursor-pointer transition-colors">
              <Upload className="h-3.5 w-3.5" />
              <span>Choose File</span>
              <input
                type="file"
                accept=".json,.csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <textarea
            value={rawText}
            onChange={handleTextChange}
            rows={8}
            placeholder={`Paste dataset here...\n\nExample JSON:\n[\n  {"title": "Doc 1", "body": "Passage text goes here"}\n]\n\nExample CSV:\nTitle,Body,URL\nMy Document,Passage content,https://example.com`}
            className="w-full p-3.5 font-mono text-xs rounded-xl border border-[#dfe1e5] focus:outline-none focus:border-[#1a73e8] text-[#202124] bg-[#fafafa] leading-relaxed resize-y"
          />

          {parseError && (
            <div className="flex items-center gap-2 p-3 bg-[#fce8e6] border border-[#f5c2c7] text-[#c5221f] rounded-xl text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* Parsed Preview Table */}
        {parsedPreview.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-[#202124]">
                Parsed Preview ({parsedPreview.length} Documents Found)
              </div>
              <span className="text-xs font-mono text-[#70757a]">
                Showing first {Math.min(parsedPreview.length, 3)} of {parsedPreview.length}
              </span>
            </div>

            <div className="border border-[#dadce0] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8f9fa] border-b border-[#dadce0] text-[#5f6368] font-mono">
                  <tr>
                    <th className="py-2.5 px-3 w-16">DocID</th>
                    <th className="py-2.5 px-3 w-1/4">Title</th>
                    <th className="py-2.5 px-3">Passage Body Snippet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dadce0]">
                  {parsedPreview.slice(0, 3).map((doc) => (
                    <tr key={doc.doc_id} className="hover:bg-[#f8f9fa]">
                      <td className="py-2 px-3 font-mono text-[#70757a]">#{doc.doc_id}</td>
                      <td className="py-2 px-3 font-medium text-[#202124]">{doc.title}</td>
                      <td className="py-2 px-3 text-[#5f6368] line-clamp-1">{doc.body}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Indexing Action Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-[#5f6368]">
                Ready to build in-memory inverted index and vector representations.
              </div>

              <button
                onClick={handleBuildIndex}
                className="px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Build Search Index & Activate</span>
              </button>
            </div>
          </div>
        )}

        {/* Indexing Telemetry Banner */}
        {indexingStats && (
          <div className="p-4 bg-[#e6f4ea] border border-[#ceead6] rounded-xl space-y-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#137333] font-medium text-sm">
              <CheckCircle2 className="h-4 w-4" />
              <span>Successfully Indexed & Activated &quot;{datasetName}&quot;</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-[#137333] pt-1">
              <div>Documents: <span className="font-bold text-[#0d652d]">{indexingStats.docCount}</span></div>
              <div>Total Tokens: <span className="font-bold text-[#0d652d]">{indexingStats.tokenCount}</span></div>
              <div>Unique Vocab: <span className="font-bold text-[#0d652d]">{indexingStats.vocabCount}</span></div>
              <div>Build Latency: <span className="font-bold text-[#0d652d]">{indexingStats.durationMs}ms</span></div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => onNavigateToSearch && onNavigateToSearch(parsedPreview[0]?.title || '')}
                className="px-4 py-1.5 rounded-full bg-[#137333] hover:bg-[#0d652d] text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Search This Dataset Now</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              {onClose && (
                <button
                  onClick={onClose}
                  className="text-xs text-[#137333] hover:underline cursor-pointer"
                >
                  Close Manager
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Custom Dataset Status if saved */}
        {customInfo && (
          <div className="pt-4 border-t border-[#dadce0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[#70757a]">Saved Custom Corpus:</span>
              <span className="font-medium text-[#202124]">{customInfo.meta.name}</span>
              <span className="text-[#5f6368]">({customInfo.meta.document_count} docs)</span>
            </div>

            <div className="flex items-center gap-2">
              {activeInfo.meta.id !== 'custom' ? (
                <button
                  onClick={() => setActiveDatasetId('custom')}
                  className="px-3 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc] font-medium transition-colors cursor-pointer"
                >
                  Switch to this Custom Dataset
                </button>
              ) : (
                <span className="text-[#137333] font-medium flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Currently Active
                </span>
              )}

              <button
                onClick={handleClearCustom}
                className="text-[#c5221f] hover:text-[#a50e0e] p-1 rounded hover:bg-[#fce8e6] transition-colors cursor-pointer"
                title="Delete saved custom dataset"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
