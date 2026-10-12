import React from 'react';
import { Cpu, Zap, Activity, Layers, Search, Server, GitBranch, BookOpen, Terminal } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBackendConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendConnected,
}) => {
  const tabs = [
    { id: 'search', label: 'Hybrid Search', icon: Search },
    { id: 'dictionary', label: 'Dictionary', icon: BookOpen },
    { id: 'pipeline', label: 'Pipeline Architecture', icon: Layers },
    { id: 'wand', label: 'Block-Max WAND', icon: Zap },
    { id: 'hnsw', label: 'HNSW Graph', icon: GitBranch },
    { id: 'sq8', label: 'SQ8 Quant', icon: Cpu },
    { id: 'benchmarks', label: 'Stress Benchmark', icon: Activity },
    { id: 'eval', label: 'MS MARCO Eval', icon: Server },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('search')}
          >
            <div className="h-7 w-7 rounded bg-zinc-850 border border-zinc-700 flex items-center justify-center text-zinc-100">
              <Terminal className="h-4 w-4 text-zinc-200" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white">
                Titan<span className="text-zinc-400 font-mono">IR</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                Rust Core
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* System Status Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono">
              <span
                className={`h-2 w-2 rounded-full ${
                  isBackendConnected ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
              />
              <span className="text-zinc-300 text-[11px]">
                {isBackendConnected ? 'Native Engine :8080' : 'In-Browser Hybrid'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-nav / Mobile scroll bar */}
      <div className="xl:hidden flex overflow-x-auto px-4 py-1.5 gap-1 border-t border-zinc-850 bg-zinc-950">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Icon className="h-3 w-3" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
