import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchConsole } from './components/SearchConsole';
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
        // server offline
      }
      setIsBackendConnected(false);
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === 'search' && (
          <>
            <Hero
              onExploreSearch={() => {
                const el = document.getElementById('search-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreArchitecture={() => setActiveTab('pipeline')}
              onExploreDictionary={() => setActiveTab('dictionary')}
            />
            <div id="search-section">
              <SearchConsole isBackendConnected={isBackendConnected} />
            </div>
          </>
        )}

        {activeTab === 'dictionary' && <Dictionary />}
        {activeTab === 'pipeline' && <PipelineFlow />}
        {activeTab === 'wand' && <WandSimulator />}
        {activeTab === 'hnsw' && <HnswVisualizer />}
        {activeTab === 'sq8' && <Sq8Inspector />}
        {activeTab === 'benchmarks' && <StressTester isBackendConnected={isBackendConnected} />}
        {activeTab === 'eval' && <EvaluationDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-xs">Titan<span className="text-zinc-400">IR</span></span>
            <span>— High-Throughput Hybrid Retrieval Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <span>Rust 2021</span>
            <span>ONNX Runtime</span>
            <span>AVX2 SIMD</span>
            <span>MS MARCO Validated</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
