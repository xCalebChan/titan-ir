import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SearchConsole } from './components/SearchConsole';
import { About } from './components/About';
import { Dictionary } from './components/Dictionary';
import { PipelineFlow } from './components/PipelineFlow';
import { WandSimulator } from './components/WandSimulator';
import { HnswVisualizer } from './components/HnswVisualizer';
import { Sq8Inspector } from './components/Sq8Inspector';
import { StressTester } from './components/StressTester';
import { EvaluationDashboard } from './components/EvaluationDashboard';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('search');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [activeQuery, setActiveQuery] = useState<string>('');

  // Poll backend health status
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setIsBackendConnected(true);
          return;
        }
      } catch {
        // backend offline
      }
      setIsBackendConnected(false);
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchFromHeader = (q: string) => {
    setActiveQuery(q);
    setActiveTab('search');
  };

  return (
    <div className="min-h-screen bg-white text-[#202124] flex flex-col font-sans">
      {/* Minimal Google-style Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
        onSearchQuery={handleSearchFromHeader}
        currentQuery={activeQuery}
        inSearchMode={activeTab === 'search' && Boolean(activeQuery)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'search' && (
          <SearchConsole
            isBackendConnected={isBackendConnected}
            onNavigateTab={setActiveTab}
            externalQuery={activeQuery}
          />
        )}

        {activeTab === 'about' && (
          <About
            onGoToSearch={() => setActiveTab('search')}
            onGoToDictionary={() => setActiveTab('dictionary')}
          />
        )}

        {activeTab === 'dictionary' && <Dictionary />}
        {activeTab === 'pipeline' && <PipelineFlow />}
        {activeTab === 'wand' && <WandSimulator />}
        {activeTab === 'hnsw' && <HnswVisualizer />}
        {activeTab === 'sq8' && <Sq8Inspector />}
        {activeTab === 'benchmarks' && <StressTester isBackendConnected={isBackendConnected} />}
        {activeTab === 'eval' && <EvaluationDashboard />}
      </main>

      {/* Google-style Minimal Footer */}
      <footer className="bg-[#f2f2f2] border-t border-[#dadce0] text-xs text-[#70757a] font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 border-b border-[#dadce0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#3c4043]">TitanSearch</span>
            <span>· High-Performance Full-Text & Vector Search Engine</span>
          </div>
          <div className="hidden sm:block text-[11px] text-[#70757a] font-mono">
            Rust 2021 · SIMD Elias-Fano · SQ8 HNSW · ONNX Runtime
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <button onClick={() => setActiveTab('about')} className="hover:text-[#202124]">
              About TitanSearch
            </button>
            <button onClick={() => setActiveTab('dictionary')} className="hover:text-[#202124]">
              Dictionary
            </button>
            <button onClick={() => setActiveTab('pipeline')} className="hover:text-[#202124]">
              How Search Works
            </button>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[#70757a]">Mozilla Engineer Research Project</span>
            <a
              href="https://github.com/xCalebChan/titan-ir"
              target="_blank"
              rel="noreferrer"
              className="text-[#1a73e8] hover:underline"
            >
              GitHub Source
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
