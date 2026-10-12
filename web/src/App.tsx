import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchConsole } from './components/SearchConsole';
import { PipelineFlow } from './components/PipelineFlow';
import { WandSimulator } from './components/WandSimulator';
import { HnswVisualizer } from './components/HnswVisualizer';
import { Sq8Inspector } from './components/Sq8Inspector';
import { StressTester } from './components/StressTester';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { Zap, GitBranch, Cpu, Server, Layers, Activity, ExternalLink, Code2 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
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
            />
            <div id="search-section">
              <SearchConsole isBackendConnected={isBackendConnected} />
            </div>
          </>
        )}

        {activeTab === 'pipeline' && <PipelineFlow />}
        {activeTab === 'wand' && <WandSimulator />}
        {activeTab === 'hnsw' && <HnswVisualizer />}
        {activeTab === 'sq8' && <Sq8Inspector />}
        {activeTab === 'benchmarks' && <StressTester isBackendConnected={isBackendConnected} />}
        {activeTab === 'eval' && <EvaluationDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">Titan<span className="text-indigo-400">IR</span></span>
            <span>— High-Throughput Hybrid Retrieval Engine</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-indigo-400">Rust 2021</span>
            <span className="text-cyan-400">ONNX Runtime</span>
            <span className="text-purple-400">SIMD AVX2</span>
            <span className="text-emerald-400">MS MARCO Validated</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
