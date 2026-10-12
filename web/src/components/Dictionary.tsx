import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronRight, Hash, Code2, Calculator, ArrowUpRight, Filter, BookMarked, Sparkles } from 'lucide-react';
import { DICTIONARY_TERMS, CATEGORIES, DictionaryTerm } from '../dictionaryData';

export const Dictionary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTermId, setSelectedTermId] = useState<string>(DICTIONARY_TERMS[0].id);

  // Filter terms based on search and category
  const filteredTerms = useMemo(() => {
    return DICTIONARY_TERMS.filter((term) => {
      const matchesCategory = selectedCategory === 'all' || term.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        term.term.toLowerCase().includes(q) ||
        (term.acronym && term.acronym.toLowerCase().includes(q)) ||
        term.oneLiner.toLowerCase().includes(q) ||
        term.definition.toLowerCase().includes(q) ||
        term.example.title.toLowerCase().includes(q) ||
        term.titanIrImplementation.file.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const activeTerm = useMemo(() => {
    const found = DICTIONARY_TERMS.find((t) => t.id === selectedTermId);
    return found || filteredTerms[0] || DICTIONARY_TERMS[0];
  }, [selectedTermId, filteredTerms]);

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-zinc-800 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono mb-2">
              <BookOpen className="h-3.5 w-3.5 text-zinc-400" />
              Technical Systems Glossary
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              TitanIR Engine Dictionary
            </h1>
            <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
              Rigorously defined concepts, mathematical formulations, concrete calculation walkthroughs, and Rust implementation references for every core retrieval component.
            </p>
          </div>

          <div className="text-xs text-zinc-500 font-mono text-left sm:text-right">
            <div>Total Indexed Concepts: <span className="text-zinc-200 font-semibold">{DICTIONARY_TERMS.length}</span></div>
            <div>Source: <span className="text-zinc-400">TitanIR Systems Blueprint</span></div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms, equations, files, or algorithms (e.g. Elias-Fano, BM25, AVX2)..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-zinc-200 text-zinc-950 font-semibold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Term Index + Term Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Term Selector List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-2 max-h-[750px] overflow-y-auto pr-1">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1 px-1">
            Showing {filteredTerms.length} of {DICTIONARY_TERMS.length} Terms
          </div>

          {filteredTerms.length === 0 ? (
            <div className="p-6 text-center border border-zinc-800 bg-zinc-900/40 rounded-lg text-zinc-400 text-sm">
              No technical terms match &quot;{searchQuery}&quot;.
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-3 block mx-auto text-xs text-zinc-300 underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredTerms.map((term) => {
              const isSelected = activeTerm.id === term.id;
              return (
                <button
                  key={term.id}
                  onClick={() => setSelectedTermId(term.id)}
                  className={`text-left p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-zinc-900 border-zinc-600 shadow-sm'
                      : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-sm font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                      {term.term}
                    </span>
                    {term.acronym && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {term.acronym}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {term.oneLiner}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span className="capitalize">{term.category}</span>
                    <span className="text-zinc-400 flex items-center gap-0.5">
                      View details <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: In-Depth Term Specification (8 cols) */}
        <div className="lg:col-span-8">
          {activeTerm ? (
            <div className="border border-zinc-800 bg-zinc-900/70 rounded-xl p-6 sm:p-8 space-y-6">
              {/* Header Badge & Title */}
              <div className="border-b border-zinc-800 pb-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {activeTerm.category}
                  </span>
                  {activeTerm.acronym && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      Acronym: {activeTerm.acronym}
                    </span>
                  )}
                  <span className="text-xs text-zinc-500 font-mono ml-auto">
                    ID: #{activeTerm.id}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {activeTerm.term}
                </h2>
                <p className="mt-1.5 text-base text-zinc-300 font-normal leading-relaxed">
                  {activeTerm.oneLiner}
                </p>
              </div>

              {/* Rigorous Definition */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <BookMarked className="h-3.5 w-3.5 text-zinc-400" />
                  Technical Definition & Specification
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/70 border border-zinc-800/80 p-4 rounded-lg">
                  {activeTerm.definition}
                </p>
              </div>

              {/* Working Mechanism */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-zinc-400" />
                  Engineering Mechanism
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/70 border border-zinc-800/80 p-4 rounded-lg font-sans">
                  {activeTerm.mechanism}
                </p>
              </div>

              {/* Mathematical Formulation (if present) */}
              {activeTerm.mathFormula && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                    <Calculator className="h-3.5 w-3.5 text-zinc-400" />
                    Mathematical Formulation
                  </h3>
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg space-y-2.5">
                    <div className="font-mono text-sm sm:text-base text-zinc-100 overflow-x-auto py-1">
                      {activeTerm.mathFormula}
                    </div>
                    {activeTerm.mathExplanation && (
                      <p className="text-xs text-zinc-400 leading-relaxed border-t border-zinc-850 pt-2 font-sans">
                        {activeTerm.mathExplanation}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Concrete Real-World Example Box */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-zinc-400" />
                  Concrete Calculation & Real-World Example
                </h3>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                  <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">
                      {activeTerm.example.title}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">Walkthrough</span>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {activeTerm.example.description}
                    </p>

                    <div className="bg-zinc-900/80 border border-zinc-800/80 p-2.5 rounded font-mono text-xs text-zinc-300">
                      <span className="text-zinc-500 select-none">INPUT: </span>
                      {activeTerm.example.input}
                    </div>

                    <div className="space-y-1.5 my-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                        Step-by-Step Execution:
                      </div>
                      {activeTerm.example.walkthrough.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-zinc-300 font-mono bg-zinc-900/30 px-2.5 py-1.5 rounded border border-zinc-850"
                        >
                          <span className="text-zinc-500 select-none">{idx + 1}.</span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-zinc-900/90 border border-zinc-700/80 p-2.5 rounded font-mono text-xs text-zinc-100">
                      <span className="text-zinc-400 font-bold select-none">RESULT: </span>
                      {activeTerm.example.output}
                    </div>
                  </div>
                </div>
              </div>

              {/* TitanIR Native Implementation Blueprint */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
                      TitanIR Native Rust Implementation
                    </div>
                    <div className="font-mono text-xs text-zinc-200 font-medium">
                      {activeTerm.titanIrImplementation.crate}/{activeTerm.titanIrImplementation.file}
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      {activeTerm.titanIrImplementation.role}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 whitespace-nowrap self-start sm:self-center">
                    Rust 2021
                  </span>
                </div>
              </div>

              {/* Related Terms Cross-Linking */}
              {activeTerm.relatedTerms && activeTerm.relatedTerms.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 mr-2">
                    Related Concepts:
                  </span>
                  <div className="inline-flex flex-wrap gap-1.5 mt-1 sm:mt-0">
                    {activeTerm.relatedTerms.map((relId) => {
                      const related = DICTIONARY_TERMS.find((t) => t.id === relId);
                      if (!related) return null;
                      return (
                        <button
                          key={relId}
                          onClick={() => setSelectedTermId(relId)}
                          className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors"
                        >
                          {related.term}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 border border-zinc-800 bg-zinc-900/40 rounded-xl text-center text-zinc-400">
              Select a term to view definition and examples.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
