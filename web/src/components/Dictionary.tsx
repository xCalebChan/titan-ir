import React, { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronRight, Hash, Code2, Calculator, BookMarked, ExternalLink } from 'lucide-react';
import { DICTIONARY_TERMS, CATEGORIES } from '../dictionaryData';
import { MathFormula } from './MathFormula';

export const Dictionary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTermId, setSelectedTermId] = useState<string>(DICTIONARY_TERMS[0].id);

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
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-sans bg-white text-[#202124]">
      {/* Header */}
      <div className="mb-6 border-b border-[#dadce0] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8f0fe] text-[#1a73e8] text-xs font-medium mb-2">
              <BookOpen className="h-3.5 w-3.5" />
              Information Retrieval Glossary
            </div>
            <h1 className="text-2xl sm:text-3xl font-normal text-[#202124] tracking-tight">
              TitanIR Technical Dictionary
            </h1>
            <p className="mt-1 text-sm text-[#5f6368] max-w-2xl leading-relaxed">
              Formal definitions, engineering mechanisms, LaTeX equations, real-world numerical calculation walkthroughs, and native Rust implementation links.
            </p>
          </div>

          <div className="text-xs text-[#70757a] font-mono text-left sm:text-right">
            <div>Indexed Concepts: <span className="text-[#202124] font-semibold">{DICTIONARY_TERMS.length}</span></div>
            <div>Corpus: <span className="text-[#5f6368]">MS MARCO Benchmark</span></div>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-5 flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#70757a] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, equations, files, or algorithms (e.g. Elias-Fano, BM25, AVX2)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#dfe1e5] hover:border-[#dfe1e5] focus:outline-none focus:border-transparent google-search-shadow text-sm text-[#202124]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#70757a] hover:text-[#202124]"
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
                className={`px-3 py-1.5 rounded-full text-xs font-normal whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#1a73e8] text-white font-medium'
                    : 'bg-[#f8f9fa] border border-[#dadce0] text-[#3c4043] hover:bg-[#f1f3f4]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Layout: Term Index (Left 4 cols) + Detail Specification (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Term Selector List */}
        <div className="lg:col-span-4 flex flex-col gap-2 max-h-[750px] overflow-y-auto pr-1">
          <div className="text-xs font-mono uppercase tracking-wider text-[#70757a] mb-1 px-1">
            Showing {filteredTerms.length} of {DICTIONARY_TERMS.length} Terms
          </div>

          {filteredTerms.length === 0 ? (
            <div className="p-6 text-center border border-[#dadce0] bg-[#f8f9fa] rounded-xl text-[#70757a] text-sm">
              No technical terms match &quot;{searchQuery}&quot;.
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-3 block mx-auto text-xs text-[#1a73e8] underline"
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
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#e8f0fe] border-[#1a73e8] shadow-sm'
                      : 'bg-white border-[#dadce0] hover:bg-[#f8f9fa] hover:border-[#bdc1c6]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-sm font-medium tracking-tight ${isSelected ? 'text-[#1a73e8]' : 'text-[#202124]'}`}>
                      {term.term}
                    </span>
                    {term.acronym && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0]">
                        {term.acronym}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#5f6368] line-clamp-2 leading-relaxed">
                    {term.oneLiner}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#70757a]">
                    <span className="capitalize">{term.category}</span>
                    <span className="text-[#1a73e8] flex items-center gap-0.5">
                      Inspect <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: In-Depth Term Specification */}
        <div className="lg:col-span-8">
          {activeTerm ? (
            <div className="border border-[#dadce0] bg-white rounded-2xl p-6 sm:p-8 space-y-6 google-card-shadow">
              {/* Header Badge & Title */}
              <div className="border-b border-[#dadce0] pb-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0]">
                    {activeTerm.category}
                  </span>
                  {activeTerm.acronym && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#f1f3f4] text-[#3c4043] border border-[#dadce0]">
                      Acronym: {activeTerm.acronym}
                    </span>
                  )}
                  <span className="text-xs text-[#70757a] font-mono ml-auto">
                    ID: #{activeTerm.id}
                  </span>
                </div>

                <h2 className="text-2xl font-normal text-[#202124] tracking-tight">
                  {activeTerm.term}
                </h2>
                <p className="mt-1 text-base text-[#5f6368] leading-relaxed">
                  {activeTerm.oneLiner}
                </p>
              </div>

              {/* Rigorous Definition */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#70757a] mb-2 flex items-center gap-1.5">
                  <BookMarked className="h-3.5 w-3.5 text-[#1a73e8]" />
                  Formal Definition & Specification
                </h3>
                <p className="text-sm text-[#3c4043] leading-relaxed bg-[#f8f9fa] border border-[#dadce0] p-4 rounded-xl">
                  {activeTerm.definition}
                </p>
              </div>

              {/* Working Mechanism */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#70757a] mb-2 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 text-[#1a73e8]" />
                  Engineering Mechanism
                </h3>
                <p className="text-sm text-[#3c4043] leading-relaxed bg-[#f8f9fa] border border-[#dadce0] p-4 rounded-xl">
                  {activeTerm.mechanism}
                </p>
              </div>

              {/* Mathematical Formulation (if present) */}
              {activeTerm.mathFormula && (
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#70757a] mb-2 flex items-center gap-1.5">
                    <Calculator className="h-3.5 w-3.5 text-[#1a73e8]" />
                    Mathematical Formulation
                  </h3>
                  <div className="bg-[#f8f9fa] border border-[#dadce0] p-4 rounded-xl space-y-2">
                    <MathFormula formula={activeTerm.mathFormula} />
                    {activeTerm.mathExplanation && (
                      <p className="text-xs text-[#5f6368] leading-relaxed border-t border-[#dadce0] pt-2">
                        {activeTerm.mathExplanation}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Concrete Real-World Example Box */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-[#70757a] mb-2 flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5 text-[#1a73e8]" />
                  Concrete Numerical Example Walkthrough
                </h3>
                <div className="bg-white border border-[#dadce0] rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 bg-[#f8f9fa] border-b border-[#dadce0] flex items-center justify-between">
                    <span className="text-xs font-medium text-[#202124]">
                      {activeTerm.example.title}
                    </span>
                    <span className="text-[11px] font-mono text-[#70757a]">Walkthrough</span>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-[#5f6368] leading-relaxed">
                      {activeTerm.example.description}
                    </p>

                    <div className="bg-[#f8f9fa] border border-[#dadce0] p-2.5 rounded-lg font-mono text-xs text-[#202124]">
                      <span className="text-[#70757a] select-none">INPUT: </span>
                      {activeTerm.example.input}
                    </div>

                    <div className="space-y-1.5 my-2">
                      <div className="text-[11px] font-mono uppercase tracking-wider text-[#70757a]">
                        Step-by-Step Execution:
                      </div>
                      {activeTerm.example.walkthrough.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs text-[#3c4043] font-mono bg-[#f8f9fa] px-2.5 py-1.5 rounded border border-[#e8eaed]"
                        >
                          <span className="text-[#70757a] select-none">{idx + 1}.</span>
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#e6f4ea] border border-[#ceead6] p-2.5 rounded-lg font-mono text-xs text-[#137333]">
                      <span className="font-bold select-none">RESULT: </span>
                      {activeTerm.example.output}
                    </div>
                  </div>
                </div>
              </div>

              {/* TitanIR Native Implementation Blueprint */}
              <div className="pt-2 border-t border-[#dadce0]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-xl">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#70757a] mb-0.5">
                      TitanIR Native Rust Implementation
                    </div>
                    <div className="font-mono text-xs text-[#202124] font-medium">
                      {activeTerm.titanIrImplementation.crate}/{activeTerm.titanIrImplementation.file}
                    </div>
                    <p className="text-xs text-[#5f6368] mt-0.5">
                      {activeTerm.titanIrImplementation.role}
                    </p>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-white border border-[#dadce0] text-[#3c4043] whitespace-nowrap self-start sm:self-center">
                    Rust 2021
                  </span>
                </div>
              </div>

              {/* Related Terms Cross-Linking */}
              {activeTerm.relatedTerms && activeTerm.relatedTerms.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#70757a] mr-2">
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
                          className="px-2.5 py-1 rounded-full bg-[#f8f9fa] border border-[#dadce0] text-xs font-mono text-[#3c4043] hover:bg-[#e8f0fe] hover:text-[#1a73e8] hover:border-[#1a73e8] transition-colors"
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
            <div className="p-8 border border-[#dadce0] bg-[#f8f9fa] rounded-2xl text-center text-[#70757a]">
              Select a term to view specification and examples.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
