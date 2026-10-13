import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Search, BookOpen, Layers, Zap, GitBranch, Cpu, Activity, Server, Info, ExternalLink, Moon, Sun, X, ChevronDown, Database } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBackendConnected: boolean;
  onSearchQuery?: (q: string) => void;
  currentQuery?: string;
  inSearchMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isBackendConnected,
  onSearchQuery,
  currentQuery = '',
  inSearchMode = false,
}) => {
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [headerQuery, setHeaderQuery] = useState(currentQuery);
  const launcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHeaderQuery(currentQuery);
  }, [currentQuery]);

  // Close launcher when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (launcherRef.current && !launcherRef.current.contains(event.target as Node)) {
        setShowAppLauncher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const coreApps = [
    { id: 'search', label: 'Search', icon: Search, color: 'text-[#4285f4]' },
    { id: 'datasets', label: 'Datasets', icon: Database, color: 'text-[#34a853]' },
    { id: 'pipeline', label: 'Pipeline', icon: Layers, color: 'text-[#fbbc05]' },
    { id: 'dictionary', label: 'Dictionary', icon: BookOpen, color: 'text-[#ea4335]' },
    { id: 'about', label: 'About', icon: Info, color: 'text-[#34a853]' },
    { id: 'eval', label: 'Evaluation', icon: Server, color: 'text-[#4285f4]' },
  ];

  const roadmapApps = [
    { id: 'wand', label: 'Block WAND', icon: Zap, color: 'text-[#4285f4]' },
    { id: 'hnsw', label: 'HNSW Graph', icon: GitBranch, color: 'text-[#34a853]' },
    { id: 'sq8', label: 'SQ8 Quant', icon: Cpu, color: 'text-[#ea4335]' },
    { id: 'benchmarks', label: 'Stress Test', icon: Activity, color: 'text-[#fbbc05]' },
  ];

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery && headerQuery.trim()) {
      onSearchQuery(headerQuery);
      if (activeTab !== 'search') {
        setActiveTab('search');
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#dadce0] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Google Logo (if not on clean home, or always for navigation) */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => setActiveTab('search')}
              className="flex items-center cursor-pointer select-none text-2xl font-medium tracking-tight"
            >
              <span className="text-[#4285f4] font-semibold">T</span>
              <span className="text-[#ea4335] font-semibold">i</span>
              <span className="text-[#fbbc05] font-semibold">t</span>
              <span className="text-[#4285f4] font-semibold">a</span>
              <span className="text-[#34a853] font-semibold">n</span>
              <span className="text-[#ea4335] font-semibold ml-0.5">Search</span>
              <span className="text-[10px] font-mono text-[#70757a] ml-1.5 px-1.5 py-0.5 rounded bg-[#f1f3f4] border border-[#dadce0] hidden sm:inline">
                Rust
              </span>
            </div>

            {/* Header Search Input (shown when query is active or not on home) */}
            {inSearchMode && (
              <form onSubmit={handleHeaderSearch} className="hidden md:flex items-center flex-1 max-w-xl">
                <div className="relative w-full flex items-center">
                  <input
                    type="text"
                    value={headerQuery}
                    onChange={(e) => setHeaderQuery(e.target.value)}
                    placeholder="Search documents or technical terms..."
                    className="w-full pl-4 pr-10 py-2.5 rounded-full border border-[#dfe1e5] hover:border-[#dfe1e5] focus:outline-none focus:border-transparent google-search-shadow text-sm text-[#202124]"
                  />
                  {headerQuery && (
                    <button
                      type="button"
                      onClick={() => setHeaderQuery('')}
                      className="absolute right-9 text-[#70757a] hover:text-[#202124]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button type="submit" className="absolute right-3 text-[#4285f4] hover:text-[#1a73e8]">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right: Google Minimal Controls (About, Dictionary, 9-dot launcher, GitHub) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('about')}
              className={`text-xs sm:text-sm font-normal px-2.5 py-1.5 rounded transition-colors ${
                activeTab === 'about'
                  ? 'text-[#1a73e8] font-medium'
                  : 'text-[#3c4043] hover:text-[#202124] hover:bg-[#f8f9fa]'
              }`}
            >
              About
            </button>

            <button
              onClick={() => setActiveTab('dictionary')}
              className={`text-xs sm:text-sm font-normal px-2.5 py-1.5 rounded transition-colors ${
                activeTab === 'dictionary'
                  ? 'text-[#1a73e8] font-medium'
                  : 'text-[#3c4043] hover:text-[#202124] hover:bg-[#f8f9fa]'
              }`}
            >
              Dictionary
            </button>

            <button
              onClick={() => setActiveTab('datasets')}
              className={`text-xs sm:text-sm font-normal px-2.5 py-1.5 rounded transition-colors ${
                activeTab === 'datasets'
                  ? 'text-[#1a73e8] font-medium'
                  : 'text-[#3c4043] hover:text-[#202124] hover:bg-[#f8f9fa]'
              }`}
            >
              Datasets
            </button>

            {/* Native status indicator */}
            <div
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#5f6368] px-2 py-1 bg-[#f8f9fa] rounded-full border border-[#dadce0]"
              title={isBackendConnected ? "Connected to native Rust engine at :8080" : "Running in-browser hybrid simulation"}
            >
              <span className={`h-2 w-2 rounded-full ${isBackendConnected ? 'bg-[#34a853]' : 'bg-[#fbbc05]'}`} />
              <span className="font-mono text-[11px]">{isBackendConnected ? 'Native:8080' : 'Browser IR'}</span>
            </div>

            {/* Google 9-Dots App Launcher */}
            <div className="relative" ref={launcherRef}>
              <button
                onClick={() => setShowAppLauncher(!showAppLauncher)}
                className="p-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] transition-colors focus:outline-none"
                title="TitanSearch Apps & Tools"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>

              {/* 3x3 App Launcher Dropdown */}
              {showAppLauncher && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#dadce0] p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="text-[11px] font-medium uppercase tracking-wider text-[#70757a] px-2 mb-1.5">
                    Core Engine (Standard)
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center mb-3">
                    {coreApps.map((app) => {
                      const Icon = app.icon;
                      const isCur = activeTab === app.id;
                      return (
                        <button
                          key={app.id}
                          onClick={() => {
                            setActiveTab(app.id);
                            setShowAppLauncher(false);
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${
                            isCur
                              ? 'bg-[#e8f0fe] text-[#1a73e8]'
                              : 'hover:bg-[#f8f9fa] text-[#3c4043]'
                          }`}
                        >
                          <Icon className={`h-5 w-5 mb-1 ${app.color}`} />
                          <span className="text-[10px] font-medium leading-tight">
                            {app.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-[11px] font-medium uppercase tracking-wider text-[#b06000] px-2 mb-1.5 border-t border-[#dadce0] pt-2">
                    Steps to Improve (Roadmap)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-center">
                    {roadmapApps.map((app) => {
                      const Icon = app.icon;
                      const isCur = activeTab === app.id;
                      return (
                        <button
                          key={app.id}
                          onClick={() => {
                            setActiveTab(app.id);
                            setShowAppLauncher(false);
                          }}
                          className={`flex items-center gap-2 p-2 rounded-xl text-left transition-colors ${
                            isCur
                              ? 'bg-[#fef7e0] text-[#b06000]'
                              : 'hover:bg-[#f8f9fa] text-[#3c4043]'
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${app.color}`} />
                          <span className="text-[10px] font-medium leading-tight">
                            {app.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#dadce0] text-center">
                    <a
                      href="https://github.com/xCalebChan/titan-ir"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#1a73e8] hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <span>GitHub: xCalebChan/titan-ir</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* GitHub Avatar Link */}
            <a
              href="https://github.com/xCalebChan/titan-ir"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center h-8 w-8 rounded-full bg-[#1a73e8] text-white font-medium text-xs shadow-sm hover:opacity-90"
              title="GitHub Repository"
            >
              M
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
