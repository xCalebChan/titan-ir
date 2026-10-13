export interface DictionaryTerm {
  id: string;
  term: string;
  acronym?: string;
  category: 'lexical' | 'dense' | 'fusion' | 'systems' | 'metrics';
  algorithmType: 'standard' | 'roadmap';
  roadmapContext?: string;
  oneLiner: string;
  definition: string;
  mechanism: string;
  mathFormula?: string;
  mathExplanation?: string;
  example: {
    title: string;
    description: string;
    input: string;
    walkthrough: string[];
    output: string;
  };
  engineImplementation: {
    crate: string;
    file: string;
    role: string;
  };
  relatedTerms: string[];
}

export const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'lexical', label: 'Lexical & Inverted Index' },
  { id: 'dense', label: 'Dense & Vector Embeddings' },
  { id: 'fusion', label: 'Ranking & Fusion' },
  { id: 'systems', label: 'Systems & Memory' },
  { id: 'metrics', label: 'Evaluation Metrics' },
] as const;

export const ALGORITHM_STATUS_FILTERS = [
  { id: 'all', label: 'All Terms' },
  { id: 'standard', label: '🟢 Standard Baseline' },
  { id: 'roadmap', label: '🚀 Steps to Improve (TODO)' },
] as const;

export const DICTIONARY_TERMS: DictionaryTerm[] = [
  // ==========================================
  // STANDARD BASELINES (Core Typical Algorithms)
  // ==========================================
  {
    id: 'bm25',
    term: 'BM25 (Robertson-Spärck Jones)',
    acronym: 'BM25',
    category: 'lexical',
    algorithmType: 'standard',
    roadmapContext: 'Active standard baseline for lexical relevance. Established probabilistic term matching used across industrial search engines (Lucene, Elasticsearch, Vespa).',
    oneLiner: 'A probabilistic ranking function that scores document relevance based on term frequency, document length, and inverse document frequency.',
    definition: 'BM25 (Best Matching 25) is a non-linear probabilistic term-scoring function developed by Stephen Robertson and Karen Spärck Jones. It extends binary independence retrieval by incorporating term frequency saturation (via parameter k1) and document length normalization (via parameter b).',
    mechanism: 'BM25 prevents long documents from dominating search results purely through high raw term counts by normalizing term frequency f(t, D) against the ratio of document length |D| to the corpus average document length avgdl. Parameter k1 controls how quickly term frequency saturates, while b controls the strength of document length penalty.',
    mathFormula: 'BM25(D, Q) = \\sum_{t \\in Q} \\ln\\left(1 + \\frac{N - n(t) + 0.5}{n(t) + 0.5}\\right) \\cdot \\frac{f(t, D) \\cdot (k_1 + 1)}{f(t, D) + k_1 \\cdot \\left(1 - b + b \\cdot \\frac{|D|}{\\text{avgdl}}\\right)}',
    mathExplanation: 'N is total corpus docs (8.8M in MS MARCO); n(t) is docs containing term t; f(t,D) is term frequency in document D; |D| is doc token count; avgdl is average doc length (~60 words in MS MARCO); standard defaults: k1 = 1.2, b = 0.75.',
    example: {
      title: 'Scoring Document #402 for query term "compiler"',
      description: 'Computing exact BM25 contribution with k1 = 1.2, b = 0.75, avgdl = 60.',
      input: 'f("compiler", D) = 3 occurrences; |D| = 90 tokens; n("compiler") = 50,000; N = 8,800,000',
      walkthrough: [
        'Compute IDF: ln(1 + (8,800,000 - 50,000 + 0.5) / (50,000 + 0.5)) = ln(1 + 175) ~= ln(176) = 5.1705.',
        'Compute length normalization: K = k1 * (1 - b + b * (|D| / avgdl)) = 1.2 * (1 - 0.75 + 0.75 * (90 / 60)) = 1.2 * (0.25 + 1.125) = 1.2 * 1.375 = 1.650.',
        'Compute TF saturation term: (f * (k1 + 1)) / (f + K) = (3 * 2.2) / (3 + 1.650) = 6.6 / 4.650 = 1.4194.',
        'Multiply IDF * TF term: 5.1705 * 1.4194 = 7.339.'
      ],
      output: 'Final BM25 score contribution for term "compiler" on Doc #402: 7.339.'
    },
    engineImplementation: {
      crate: 'crates/lexical-engine',
      file: 'src/bm25.rs',
      role: 'Active core retrieval loop calculating exact document relevance scores against the inverted index.'
    },
    relatedTerms: ['inverted-index', 'porter-stemmer', 'block-max-wand']
  },
  {
    id: 'inverted-index',
    term: 'Inverted Index & Posting Lists',
    acronym: 'InvIdx',
    category: 'lexical',
    algorithmType: 'standard',
    roadmapContext: 'Active standard baseline for text retrieval. Classical posting list structure mapping dictionary terms to matching documents.',
    oneLiner: 'Core search data structure mapping dictionary terms to sorted lists of documents containing them.',
    definition: 'An Inverted Index is the foundational data structure of information retrieval. Rather than storing documents as collections of words (forward index), it maps every unique word (term) in the corpus to a "posting list" recording all documents that contain the word, along with term frequency and position metadata.',
    mechanism: 'Posting lists store sorted document IDs and term frequencies. At search time, multi-term queries intersect or union postings across terms using two-pointer scans to identify candidate matching documents in linear time.',
    mathFormula: '\\text{Term } t \\mapsto \\{ (DocID_1, TF_1), (DocID_2, TF_2), \\dots, (DocID_m, TF_m) \\}',
    mathExplanation: 'Sorted DocIDs allow linear intersection and union operations across multi-term queries in sub-millisecond time.',
    example: {
      title: 'Inverted postings for terms "rust" and "vector"',
      description: 'Intersecting two posting lists for query: "rust vector".',
      input: 'Postings("rust"): [Doc 10, Doc 45, Doc 88, Doc 102], Postings("vector"): [Doc 12, Doc 45, Doc 90, Doc 102]',
      walkthrough: [
        'Start iterators at Doc 10 and Doc 12.',
        'Doc 10 < Doc 12: advance "rust" iterator to 45.',
        'Doc 45 > Doc 12: advance "vector" iterator to 45.',
        'Doc 45 == Doc 45: Match found! Add Doc 45 to candidate pool.',
        'Advance both iterators: Doc 88 vs Doc 90 -> next match lands on Doc 102.'
      ],
      output: 'Matching documents: [Doc 45, Doc 102] retrieved in 2 microseconds.'
    },
    engineImplementation: {
      crate: 'crates/lexical-engine',
      file: 'src/inverted_index.rs',
      role: 'Manages posting lists, term dictionary, and document frequency lookups.'
    },
    relatedTerms: ['bm25', 'porter-stemmer', 'elias-fano']
  },
  {
    id: 'porter-stemmer',
    term: 'Porter Stemmer',
    acronym: 'Stem',
    category: 'lexical',
    algorithmType: 'standard',
    roadmapContext: 'Active standard baseline for morphological normalization. Rule-based suffix stripping with zero external dictionary overhead.',
    oneLiner: 'A zero-allocation suffix-stripping algorithm that reduces words to their morphological base form.',
    definition: 'The Porter Stemmer is an algorithmic rule-based stemmer designed by Martin Porter in 1980. It strips common English suffixes (such as "-ing", "-ed", "-ation", "-ment", "-s") using a five-step cascading state machine without requiring a massive dictionary in memory.',
    mechanism: 'The tokenizer stems terms in-place within a zero-allocation byte buffer. Words like "retrieval", "retrieving", and "retrieved" are all normalized to the common stem "retriev". This ensures documents containing morphological variants match query terms without requiring query expansion.',
    mathFormula: '\\text{Stem}(\\text{"retrieval"}) = \\text{Stem}(\\text{"retrieving"}) = \\text{Stem}(\\text{"retrieved"}) = \\text{"retriev"}',
    mathExplanation: 'Stemming bridges lexical vocabulary mismatch while keeping the inverted index vocabulary size small and compact.',
    example: {
      title: 'Stemming query tokens in-place',
      description: 'Transforming query: "optimizing compiled algorithms"',
      input: '"optimizing compiled algorithms"',
      walkthrough: [
        'Lowercase & ASCII normalize: "optimizing compiled algorithms"',
        'Step 1b: "optimizing" ends in "-ing" with vowel-consonant measure > 0 -> stems to "optim"',
        'Step 1b: "compiled" ends in "-ed" -> stems to "compil"',
        'Step 1a: "algorithms" ends in "-s" -> stems to "algorithm"'
      ],
      output: 'Normalized tokens: ["optim", "compil", "algorithm"] matched against inverted index in 4 microseconds.'
    },
    engineImplementation: {
      crate: 'crates/lexical-engine',
      file: 'src/tokenizer.rs',
      role: 'Zero-allocation tokenizer and stemmer that parses queries and documents into indexable term IDs.'
    },
    relatedTerms: ['inverted-index', 'bm25']
  },
  {
    id: 'cosine-similarity',
    term: 'Cosine Similarity (Exact k-NN)',
    acronym: 'Cosine k-NN',
    category: 'dense',
    algorithmType: 'standard',
    roadmapContext: 'Active standard baseline for semantic vector search. Calculates exact dot products between normalized dense embeddings without approximate graph heuristics.',
    oneLiner: 'Standard baseline metric measuring angular alignment between normalized high-dimensional vectors.',
    definition: 'Cosine similarity evaluates the orientation rather than magnitude between two vectors in a multidimensional inner product space. For unit-normalized embeddings produced by bi-encoder models, cosine similarity reduces to a standard dot product evaluated across candidate document vectors.',
    mechanism: 'In the standard dense baseline, query embeddings are L2-normalized. An exact exhaustive scan (k-NN) computes the scalar dot product between the query vector and candidate document vectors, maintaining the top-K highest scores in a min-heap. Unlike approximate graph methods (HNSW), exact cosine similarity delivers 100% recall with zero index build complexity.',
    mathFormula: '\\cos(\\mathbf{q}, \\mathbf{d}) = \\frac{\\mathbf{q} \\cdot \\mathbf{d}}{\\|\\mathbf{q}\\| \\|\\mathbf{d}\\|} = \\sum_{i=1}^{d} q_i \\cdot d_i \\quad (\\text{when } \\|\\mathbf{q}\\| = \\|\\mathbf{d}\\| = 1)',
    mathExplanation: 'For unit vectors of dimension d = 384, computing cosine similarity takes exactly 384 scalar multiplications and additions. If all documents are scanned, recall is guaranteed at 1.0 (100% exactness).',
    example: {
      title: 'Exact 3-dimensional cosine similarity evaluation',
      description: 'Comparing normalized query vector Q against two document vectors D1 and D2.',
      input: 'Q = [0.6, 0.8, 0.0], D1 = [0.6, 0.8, 0.0] (exact match), D2 = [0.8, -0.6, 0.0] (orthogonal).',
      walkthrough: [
        'Compute dot product Q . D1 = (0.6 * 0.6) + (0.8 * 0.8) + (0.0 * 0.0) = 0.36 + 0.64 = 1.000.',
        'Compute dot product Q . D2 = (0.6 * 0.8) + (0.8 * -0.6) + (0.0 * 0.0) = 0.48 - 0.48 = 0.000.',
        'Rank candidates: D1 is an identical match (score 1.000); D2 is orthogonal (score 0.000).'
      ],
      output: 'Candidate D1 ranked #1 with 100% exact cosine score.'
    },
    engineImplementation: {
      crate: 'crates/dense-engine',
      file: 'src/exact_knn.rs',
      role: 'Baseline dense retrieval performing exact cosine similarity dot products over precomputed vector arrays.'
    },
    relatedTerms: ['bi-encoder', 'linear-fusion', 'hnsw']
  },
  {
    id: 'bi-encoder',
    term: 'Bi-Encoder (Dual Encoder)',
    acronym: 'Bi-Enc',
    category: 'dense',
    algorithmType: 'standard',
    roadmapContext: 'Active standard baseline for generating dense semantic vector embeddings offline.',
    oneLiner: 'A neural architecture that encodes queries and documents into independent fixed-dimensional vectors.',
    definition: 'A Bi-Encoder is a dense semantic retrieval model (such as all-MiniLM-L6-v2 or bge-small-en-v1.5) that uses two separate forward passes to map queries and documents into a shared latent vector space (e.g., 384 dimensions). Relevance is measured as the cosine similarity between the two isolated vectors.',
    mechanism: 'Unlike cross-encoders, bi-encoders allow all document vectors to be precomputed offline and stored as contiguous float arrays. At query time, only the query vector is computed on-the-fly, enabling fast retrieval across millions of documents.',
    mathFormula: 'S(Q, D) = \\cos(\\mathbf{v}_Q, \\mathbf{v}_D) = \\frac{\\mathbf{v}_Q \\cdot \\mathbf{v}_D}{\\|\\mathbf{v}_Q\\| \\|\\mathbf{v}_D\\|} = \\sum_{i=1}^d v_{Q, i} \\cdot v_{D, i} \\quad (\\text{for } L_2\\text{-normalized vectors})',
    mathExplanation: 'Because query and document tokens never interact directly in attention layers, bi-encoders exhibit slightly lower relevance than cross-encoders, but operate orders of magnitude faster.',
    example: {
      title: 'Retrieving semantic synonyms without lexical overlap',
      description: 'Query: "physician prescribing penicillin" vs Document: "Doctor gave antibiotic medication to patient".',
      input: 'Query and Document share zero exact keywords.',
      walkthrough: [
        'BM25 Lexical search returns 0 matches because words do not overlap.',
        'Bi-encoder passes query into transformer -> outputs 384-dimensional vector v_Q.',
        'Precomputed doc vector v_D resides in vector store.',
        'Compute cosine similarity: v_Q . v_D = 0.884.',
        'Result: Document is identified as a top semantic match despite having 0 overlapping tokens.'
      ],
      output: 'Document retrieved via semantic cosine matching.'
    },
    engineImplementation: {
      crate: 'crates/dense-engine',
      file: 'src/embedder.rs',
      role: 'Generates 384-dimensional dense semantic vectors and normalizes them for vector indexing.'
    },
    relatedTerms: ['cosine-similarity', 'cross-encoder', 'linear-fusion']
  },
  {
    id: 'linear-fusion',
    term: 'Linear Score Combination',
    acronym: 'Linear Fusion',
    category: 'fusion',
    algorithmType: 'standard',
    roadmapContext: 'Active standard baseline for hybrid search. Directly blends min-max normalized BM25 lexical scores and Cosine dense similarity scores using a tuning parameter alpha.',
    oneLiner: 'Standard baseline hybrid fusion method linearly weighting normalized lexical and dense scores.',
    definition: 'Linear Score Combination is the canonical industry baseline for hybrid search systems. It maps lexical scores (BM25) and dense scores (Cosine similarity) to a common [0, 1] range using min-max normalization, then computes a convex combination controlled by hyperparameter alpha.',
    mechanism: 'Given raw scores S_lex and S_dense, each modality is normalized into [0, 1]. The blended score is computed as alpha * S_lex_norm + (1 - alpha) * S_dense_norm. Setting alpha = 0.5 gives equal weight to keyword overlap and semantic meaning, while alpha = 0.7 prioritizes exact terminology.',
    mathFormula: 'S_{\\text{hybrid}}(d) = \\alpha \\cdot \\frac{S_{\\text{BM25}}(d) - S_{\\min}}{S_{\\max} - S_{\\min}} + (1 - \\alpha) \\cdot S_{\\text{Cosine}}(d)',
    mathExplanation: 'alpha in [0, 1] is the interpolation weight. When alpha = 0.5, lexical and semantic signals contribute equally to the final ranked output.',
    example: {
      title: 'Fusing BM25 and Cosine scores with alpha = 0.5',
      description: 'Candidate document D evaluated across both retrieval channels.',
      input: 'BM25 score = 8.0 (range 0 to 10 -> norm = 0.80); Cosine score = 0.60; alpha = 0.5.',
      walkthrough: [
        'Normalize BM25 score: (8.0 - 0) / (10 - 0) = 0.80.',
        'Cosine score is already bounded in [0, 1]: score = 0.60.',
        'Compute weighted sum: 0.5 * 0.80 + 0.5 * 0.60 = 0.40 + 0.30 = 0.70.'
      ],
      output: 'Composite hybrid relevance score = 0.70.'
    },
    engineImplementation: {
      crate: 'crates/reranker',
      file: 'src/linear_fusion.rs',
      role: 'Standard baseline fusion module blending BM25 and dense cosine scores before result pagination.'
    },
    relatedTerms: ['bm25', 'cosine-similarity', 'rrf']
  },
  {
    id: 'rrf',
    term: 'Reciprocal Rank Fusion',
    acronym: 'RRF',
    category: 'fusion',
    algorithmType: 'standard',
    roadmapContext: 'Standard baseline for scale-invariant multi-modal rank combination without requiring score calibration.',
    oneLiner: 'A scale-invariant rank aggregation method that combines ranked lists from multiple search modalities without score normalization.',
    definition: 'Reciprocal Rank Fusion (RRF) is an unsupervised fusion algorithm formulated by Cormack, Clarke, and Buettcher (SIGIR 2009). It merges candidate lists from disparate retrieval systems (such as BM25 lexical and dense vector search) based exclusively on their rank positions rather than their raw scores.',
    mechanism: 'For every document d appearing in any retrieval list, RRF calculates a reciprocal score 1 / (k + rank(d)) for each list and sums them. The smoothing parameter k (typically 60) prevents high-ranking outliers in one list from overwhelmingly dominating documents that perform consistently well across both modalities.',
    mathFormula: '\\text{RRF\\_Score}(d) = \\sum_{m \\in M} \\frac{1}{k + r_m(d)}',
    mathExplanation: 'M is the set of retrieval modalities (Lexical BM25 and Dense); rm(d) is the 1-based rank of document d in modality m; k is the smoothing constant (standard default k = 60). If a document is absent from a modality, its score contribution for that modality is 0.',
    example: {
      title: 'Fusing Lexical and Dense Results for Doc A vs Doc B with k = 60',
      description: 'Evaluating two candidate documents retrieved by BM25 and dense search.',
      input: 'Doc A: Lexical rank #2, Dense rank #5. Doc B: Lexical rank #1, Dense rank #120.',
      walkthrough: [
        'Compute Doc A score:',
        '  - Lexical contribution: 1 / (60 + 2) = 1 / 62 = 0.016129',
        '  - Dense contribution:   1 / (60 + 5) = 1 / 65 = 0.015385',
        '  - Doc A Total RRF:      0.016129 + 0.015385 = 0.031514',
        'Compute Doc B score:',
        '  - Lexical contribution: 1 / (60 + 1) = 1 / 61 = 0.016393',
        '  - Dense contribution:   1 / (60 + 120) = 1 / 180 = 0.005556',
        '  - Doc B Total RRF:      0.016393 + 0.005556 = 0.021949'
      ],
      output: 'Doc A wins (0.031514 vs 0.021949) because it demonstrates strong consensus across both lexical and semantic channels.'
    },
    engineImplementation: {
      crate: 'crates/reranker',
      file: 'src/rrf.rs',
      role: 'Combines top candidates from lexical and dense pipelines into a unified ranking.'
    },
    relatedTerms: ['linear-fusion', 'bm25', 'cross-encoder']
  },
  {
    id: 'mmap-storage',
    term: 'Memory-Mapped I/O & Offset Table',
    acronym: 'mmap',
    category: 'systems',
    algorithmType: 'standard',
    roadmapContext: 'Active standard baseline for zero-overhead document text storage using OS virtual memory page tables.',
    oneLiner: 'OS kernel-level virtual memory mapping for instant random document access without heap allocation.',
    definition: 'Memory-Mapped I/O (mmap) maps a raw disk file directly into the process address space. Documents are stored in an append-only binary flat file alongside a fixed-width binary offset table (DocID * 8 bytes). Document strings are never loaded or retained in RAM heaps.',
    mechanism: 'When a search query identifies winning DocIDs, the engine reads offset_table[DocID * 8] to obtain the 64-bit file offset and length. It dereferences the mmap byte slice directly as a string slice (&str). The operating system page cache fetches the 4KB memory page on-demand from SSD.',
    mathFormula: '\\text{Byte Offset}(DocID) = \\text{offset\\_table}[DocID \\times 8], \\quad \\text{RAM Overhead} = 0 \\text{ bytes string heap}',
    mathExplanation: 'For 1,000,000 documents, the offset table occupies exactly 8 MB of RAM. 8.8 million documents (~3.2 GB of text) can be queried on a machine with limited physical RAM.',
    example: {
      title: 'Looking up text for DocID #405,122',
      description: 'Zero-allocation random access to passage text.',
      input: 'DocID = 405,122. Flat file size = 3.4 GB.',
      walkthrough: [
        'Compute offset table index: 405,122 * 8 bytes = byte position 3,240,976 in the .offsets file.',
        'Read 8-byte entry: [Offset = 1,489,200, Length = 240].',
        'Directly slice memory mapped buffer: &mmap_bytes[1,489,200 .. 1,489,440].',
        'Interpret slice as &str without copying or allocating on the heap.'
      ],
      output: 'Passage text retrieved in 0.8 microseconds with 0 heap allocations.'
    },
    engineImplementation: {
      crate: 'crates/index-core',
      file: 'src/doc_store.rs',
      role: 'Provides DocStore with mmap-backed read operations for serving search result payloads.'
    },
    relatedTerms: ['zero-allocation', 'simd-intrinsics']
  },
  {
    id: 'zero-allocation',
    term: 'Zero-Allocation Hot Loop',
    acronym: '0-Alloc',
    category: 'systems',
    algorithmType: 'standard',
    roadmapContext: 'Active standard systems architecture pattern eliminating heap allocations in search inner loops.',
    oneLiner: 'High-throughput systems architecture where query processing paths perform zero heap allocations.',
    definition: 'A zero-allocation hot loop is a systems design discipline where no calls to the general-purpose heap memory allocator occur during the execution of a user query. All scratch space, heaps, and score accumulators are preallocated in per-thread reuse arenas.',
    mechanism: 'Dynamic memory allocation requires thread synchronization and locks in glibc/mimalloc, causing jitter and latency spikes under concurrent multi-core load. By using static array iterators, reusable scratch buffers, and fixed-capacity arrays, search engines achieve flat latency profiles and eliminate garbage collection pauses.',
    mathFormula: '\\Delta \\text{Heap Allocated} = 0 \\text{ bytes per query}',
    mathExplanation: 'Under 10,000 QPS load across multiple CPU cores, zero-allocation engines prevent lock contention in memory allocators, reducing p99 tail latency.',
    example: {
      title: 'Top-K min-heap candidate accumulation',
      description: 'Accumulating top 10 results in a fixed-size binary heap.',
      input: '100,000 candidate documents scored during query traversal.',
      walkthrough: [
        'A naive engine allocates a new struct or heap vector for each candidate: 100,000 allocations -> severe memory allocator churn.',
        'Pre-allocate a fixed array of size K = 10 on the thread stack.',
        'If candidate score <= heap.min(), drop immediately (0 work).',
        'If candidate score > heap.min(), replace root in-place and sift-down in O(log K) time without allocating any memory.'
      ],
      output: '100,000 candidates processed with 0 bytes allocated and 0 allocator locks.'
    },
    engineImplementation: {
      crate: 'crates/lexical-engine',
      file: 'src/bm25.rs',
      role: 'Implements reusable ScoreHeap and iterator stacks across query worker threads.'
    },
    relatedTerms: ['mmap-storage', 'latency-percentiles']
  },
  {
    id: 'ndcg',
    term: 'nDCG@10 (Normalized Discounted Cumulative Gain)',
    acronym: 'nDCG@10',
    category: 'metrics',
    algorithmType: 'standard',
    roadmapContext: 'Industry-standard ranking quality metric with logarithmic position penalties.',
    oneLiner: 'The industry-standard evaluation metric for ranking quality with logarithmic position penalties.',
    definition: 'Normalized Discounted Cumulative Gain at rank 10 (nDCG@10) is an information retrieval metric that measures the usefulness, or gain, of a document based on its position in the result list. Highly relevant documents appearing lower in the search ranking are heavily penalized using a logarithmic discount.',
    mechanism: 'DCG accumulates graded relevance gains discounted by log2(rank + 1). To make the score comparable across queries of varying difficulty, DCG is divided by the Ideal DCG (IDCG), which is the DCG achieved by an optimal sorter placing all relevant documents at the very top. Scores range strictly from 0.0 (completely irrelevant) to 1.0 (perfect ranking).',
    mathFormula: '\\text{DCG}@K = \\sum_{i=1}^K \\frac{2^{\\text{rel}_i} - 1}{\\log_2(i + 1)}, \\quad \\text{nDCG}@K = \\frac{\\text{DCG}@K}{\\text{IDCG}@K}',
    mathExplanation: 'reli is the graded relevance label of the document at rank i (0 for non-relevant, 1 for relevant in binary MS MARCO qrels). If the relevant document is at Rank 1, DCG = 1 / log2(2) = 1.0. If at Rank 4, DCG = 1 / log2(5) = 0.430.',
    example: {
      title: 'Calculating nDCG@5 when relevant document appears at Rank 3',
      description: 'Query with 1 ground-truth relevant document (rel = 1).',
      input: 'System output: [Non-rel (0), Non-rel (0), Relevant (1), Non-rel (0), Non-rel (0)]',
      walkthrough: [
        'Compute DCG@5 of system output:',
        '  - Rank 1: (2^0 - 1) / log2(2) = 0',
        '  - Rank 2: (2^0 - 1) / log2(3) = 0',
        '  - Rank 3: (2^1 - 1) / log2(4) = 1 / 2.0 = 0.500',
        '  - DCG@5 = 0.500',
        'Compute Ideal DCG@5 (IDCG): Place relevant doc at Rank 1: (2^1 - 1) / log2(2) = 1.0 / 1.0 = 1.000.',
        'Compute nDCG@5: DCG@5 / IDCG@5 = 0.500 / 1.000 = 0.500.'
      ],
      output: 'nDCG@5 = 0.500. If the system promoted the relevant doc to Rank 1, nDCG would jump to 1.000.'
    },
    engineImplementation: {
      crate: 'eval',
      file: 'run_msmarco_eval.py',
      role: 'Computes official TREC benchmark scores across the 6,980 dev query set to validate retrieval stage improvements.'
    },
    relatedTerms: ['mrr', 'cross-encoder', 'rrf']
  },
  {
    id: 'mrr',
    term: 'MRR@10 (Mean Reciprocal Rank)',
    acronym: 'MRR@10',
    category: 'metrics',
    algorithmType: 'standard',
    roadmapContext: 'Standard evaluation metric tracking the reciprocal rank of the first relevant document.',
    oneLiner: 'The average reciprocal rank of the first relevant document across all evaluation queries.',
    definition: 'Mean Reciprocal Rank at rank 10 (MRR@10) is the primary official benchmark metric for the MS MARCO passage ranking competition. It measures how quickly a user encounters their first satisfactory answer in the result list.',
    mechanism: 'For each query, the reciprocal rank (RR) is 1 / rank of the first relevant document found within the top 10 results. If no relevant document appears in the top 10, the RR is 0. MRR is the arithmetic mean of the reciprocal ranks across all evaluation queries in the benchmark set.',
    mathFormula: '\\text{MRR}@K = \\frac{1}{|Q|} \\sum_{q=1}^{|Q|} \\frac{1}{\\text{rank}_q^*} \\quad (\\text{where } \\text{rank}_q^* \\le K, \\text{ else } 0)',
    mathExplanation: 'If the first relevant passage is at rank 1, score = 1.0. At rank 2, score = 0.5. At rank 10, score = 0.1. At rank 11 or lower, score = 0.0.',
    example: {
      title: 'Computing MRR@10 across a sample 3-query test set',
      description: 'Evaluation results for queries Q1, Q2, and Q3.',
      input: 'Q1: first relevant doc at Rank 1. Q2: first relevant doc at Rank 2. Q3: first relevant doc at Rank 8.',
      walkthrough: [
        'Query 1 Reciprocal Rank: 1 / 1 = 1.000',
        'Query 2 Reciprocal Rank: 1 / 2 = 0.500',
        'Query 3 Reciprocal Rank: 1 / 8 = 0.125',
        'Compute Mean: (1.000 + 0.500 + 0.125) / 3 = 1.625 / 3 = 0.5417'
      ],
      output: 'MRR@10 = 0.542 across the sample evaluation set.'
    },
    engineImplementation: {
      crate: 'eval',
      file: 'run_msmarco_eval.py',
      role: 'Validates first-hit accuracy against MS MARCO qrels ground-truth.'
    },
    relatedTerms: ['ndcg', 'cross-encoder']
  },
  {
    id: 'latency-percentiles',
    term: 'Latency Percentiles (p50, p95, p99)',
    acronym: 'p50/p95/p99',
    category: 'metrics',
    algorithmType: 'standard',
    roadmapContext: 'Standard systems benchmarking metrics tracking p50 median, p95, and p99 tail query latencies.',
    oneLiner: 'Statistical distribution percentiles measuring median and worst-case tail latencies.',
    definition: 'Latency percentiles quantify the performance characteristics of an information retrieval service under live query load. Rather than relying on simple averages (which hide severe outliers caused by complex queries or garbage collection), percentiles define service level agreements (SLAs).',
    mechanism: 'p50 (median) means 50% of queries finish faster than this threshold. p95 means 95% finish faster. p99 (tail latency) measures the performance experienced by the slowest 1% of queries, exposing lock contention, memory thrashing, or worst-case traversals.',
    mathFormula: 'p_{X} = \\inf \\left\\{ t \\in \\mathbb{R} : P(\\text{Latency} \\le t) \\ge \\frac{X}{100} \\right\\}',
    mathExplanation: 'In distributed search engines, a single user query often fans out to 100 leaf shards. If shard p99 is 20ms, the chance that the user query experiences that 20ms delay is 1 - (0.99)^100 = 63.4%, making tail latency the true user-facing bottleneck.',
    example: {
      title: 'Profiling query engine under 5,000 QPS load burst',
      description: 'Measuring latency distribution across 10,000 synthetic test queries.',
      input: '10,000 query execution times recorded with microsecond timestamps.',
      walkthrough: [
        'Sort all 10,000 latencies from fastest to slowest.',
        'Index 5,000 (50th percentile): 0.38 ms -> p50 = 0.38 ms.',
        'Index 9,500 (95th percentile): 0.82 ms -> p95 = 0.82 ms.',
        'Index 9,900 (99th percentile): 1.45 ms -> p99 = 1.45 ms.'
      ],
      output: 'Sub-2ms p99 tail latency maintained under high-throughput concurrent search traffic.'
    },
    engineImplementation: {
      crate: 'benches',
      file: 'query_latency.rs',
      role: 'Criterion.rs microbenchmarking suite that profiles latency distributions under varying QPS loads.'
    },
    relatedTerms: ['zero-allocation', 'block-max-wand']
  },

  // ==========================================
  // STEPS TO IMPROVE / OPTIMIZATION ROADMAP (TODO)
  // ==========================================
  {
    id: 'block-max-wand',
    term: 'Block-Max WAND',
    acronym: 'BMW',
    category: 'lexical',
    algorithmType: 'roadmap',
    roadmapContext: 'Step to Improve (Roadmap TODO): Dynamic query pruning algorithm that skips non-competitive inverted index blocks using score upper bounds to achieve sub-millisecond lexical speeds at multi-million scale.',
    oneLiner: 'A dynamic query pruning algorithm for inverted indexes that skips non-competitive document blocks without scoring them.',
    definition: 'Block-Max WAND (Weak AND) is an index traversal algorithm invented by Ding & Su (2011). It organizes posting lists into fixed-size blocks (e.g., 64 or 128 postings), precomputes the maximum possible BM25 contribution for each block, and uses a top-K min-heap threshold to skip entire blocks whose upper-bound score cannot beat the current K-th best result.',
    mechanism: 'Query posting iterators are aligned by DocID. The engine sorts iterators by current DocID and sums the block maximum scores of candidate terms. It finds the pivot term where the cumulative upper bound meets or exceeds the heap threshold theta. If the pivot term\'s block maximum cannot qualify, the algorithm advances the doc pointer past the entire block, avoiding all decompression, term-frequency lookups, and BM25 evaluations for up to 90% of documents.',
    mathFormula: '\\sum_{t \\in Q} \\text{max\\_score}(t, \\text{Block}_t) < \\theta \\implies \\text{Skip Entire Block}',
    mathExplanation: 'theta represents the minimum score currently held in the top-K min-heap. If the theoretical upper-bound sum of all query terms in the block is less than theta, no document inside that block can possibly make the top-K. The entire block is safely skipped.',
    example: {
      title: 'Executing a 3-Term Query with Heap Threshold theta = 8.5',
      description: 'Evaluating candidate documents for query: "rust compiler optimization" with Top-K heap filled with documents scored >= 8.5.',
      input: 'Query: "rust" (Term 1), "compiler" (Term 2), "optimization" (Term 3). Current theta = 8.5.',
      walkthrough: [
        'Iterators currently at Block #14 spanning DocIDs 1792 to 1919.',
        'Read block metadata: max_score("rust") = 3.1, max_score("compiler") = 2.4, max_score("optimization") = 2.2.',
        'Calculate theoretical upper bound for Block #14: 3.1 + 2.4 + 2.2 = 7.7.',
        'Compare against heap threshold: 7.7 < 8.5 (theta).',
        'Decision: The best possible document in Block #14 cannot achieve a score >= 8.5.',
        'Action: Skip all 128 documents [1792..1919] in a single step using Elias-Fano next_geq(1920).'
      ],
      output: '128 document evaluations completely avoided with 0 floating point calculations, reducing query latency by 85%.'
    },
    engineImplementation: {
      crate: 'crates/lexical-engine',
      file: 'src/wand.rs',
      role: 'Planned execution loop for scaling lexical queries; maintains the Min-Heap, computes dynamic thresholds, and performs block-skipping.'
    },
    relatedTerms: ['bm25', 'elias-fano', 'inverted-index']
  },
  {
    id: 'elias-fano',
    term: 'Elias-Fano Encoding',
    acronym: 'EF',
    category: 'lexical',
    algorithmType: 'roadmap',
    roadmapContext: 'Step to Improve (Roadmap TODO): Quasi-succinct bitvector compression for posting lists to compress DocID gaps down to ~6 bits/integer with hardware O(1) jump operations.',
    oneLiner: 'A quasi-succinct compression algorithm for strictly monotonic non-decreasing integer sequences.',
    definition: 'Elias-Fano is a non-lossy compression technique invented by Peter Elias (1974) and Robert Fano (1971) designed to represent sorted lists of integers using space close to the information-theoretic lower bound, while providing O(1) random access and binary-search jumps via hardware popcount operations.',
    mechanism: 'Given a sorted array of N integers bounded by maximum value U, each integer is represented in binary. The lower l = floor(log2(U / N)) bits are stored uncompressed in a packed bitstream. The upper bits are encoded as unary gaps (sequences of 0s followed by a 1) in a high-bits bitvector. Random access to the i-th element uses hardware select64 instructions, while finding the first element >= x (next_geq) uses hardware popcount and branchless rank operations.',
    mathFormula: 'l = \\left\\lfloor \\log_2\\left(\\frac{U}{N}\\right) \\right\\rfloor, \\quad \\text{Space} \\le N \\cdot \\left(2 + \\left\\lceil \\log_2\\left(\\frac{U}{N}\\right) \\right\\rceil\\right) \\text{ bits}',
    mathExplanation: 'For 128 document IDs in a block with max DocID 10,000, l = floor(log2(10000/128)) = 6 bits. The lower 6 bits are packed directly (128 * 6 = 768 bits). The upper bits require at most 10,000 / 64 + 128 ~= 284 bits. Total space is ~1,052 bits (~8.2 bits/doc ID) compared to 4,096 bits for raw 32-bit integers.',
    example: {
      title: 'Encoding DocIDs [4, 18, 35, 70, 95] with Universe U = 100, N = 5',
      description: 'Compressing 5 document IDs from an inverted index posting list with instant next_geq jump capability.',
      input: 'Sorted DocIDs: [4, 18, 35, 70, 95], N = 5, U = 100',
      walkthrough: [
        'Calculate low-bit width: l = floor(log2(100 / 5)) = floor(log2(20)) = 4 bits.',
        'Split each DocID into High (x >> 4) and Low (x & 0x0F):',
        '  - DocID 4:  High = 4 >> 4 = 0, Low = 4 & 15 = 4  (0100_2)',
        '  - DocID 18: High = 18 >> 4 = 1, Low = 18 & 15 = 2 (0010_2)',
        '  - DocID 35: High = 35 >> 4 = 2, Low = 35 & 15 = 3 (0011_2)',
        '  - DocID 70: High = 70 >> 4 = 4, Low = 70 & 15 = 6 (0110_2)',
        '  - DocID 95: High = 95 >> 4 = 5, Low = 95 & 15 = 15 (1111_2)',
        'Pack Low Bits: Concatenate [0100, 0010, 0011, 0110, 1111] = 20 bits total.',
        'Encode High Bits as unary 1s separated by 0s: High values are 0, 1, 2, 4, 5. High bitvector: 1 (at 0), 1 (at 1), 1 (at 2), 0, 1 (at 4), 1 (at 5) -> "111011_2".',
        'To query next_geq(50): 50 >> 4 = 3. Jump directly in high bitvector to find the next 1 after unary bucket 3, immediately locating DocID 70 in O(1) time.'
      ],
      output: 'Total footprint: 20 low bits + 11 high bits = 31 bits (~6.2 bits/integer), down from 160 bits (raw u32). 80.6% compression.'
    },
    engineImplementation: {
      crate: 'crates/index-core',
      file: 'src/elias_fano.rs',
      role: 'Compresses sorted posting DocIDs inside each 128-postings block and provides the fast next_geq binary jump iterator for Block-Max WAND.'
    },
    relatedTerms: ['block-max-wand', 'inverted-index']
  },
  {
    id: 'hnsw',
    term: 'HNSW Graph Traversal',
    acronym: 'HNSW',
    category: 'dense',
    algorithmType: 'roadmap',
    roadmapContext: 'Step to Improve (Roadmap TODO): Multi-layer proximity graph index enabling logarithmic O(log N) approximate nearest neighbor vector search across millions of dense embeddings.',
    oneLiner: 'A multi-layer proximity graph for logarithmic-time approximate nearest neighbor (ANN) vector search.',
    definition: 'Hierarchical Navigable Small World (HNSW) is a graph-based vector index designed by Malkov & Yashunin (2018). It arranges vector nodes into a multi-layer hierarchy of proximity graphs where upper layers contain sparse long-range highway edges for coarse routing, and layer 0 contains dense local connections for fine-grained nearest neighbor discovery.',
    mechanism: 'Search begins at the entry point of the top layer. The engine executes a greedy routing step: examine all neighbors of the current node, jump to the neighbor closest to the query vector, and repeat until reaching a local minimum. The engine then drops down to the next layer and repeats greedy routing. At layer 0, a beam search maintains a priority queue of size ef_search to return the top-K closest vectors in O(log N) time.',
    mathFormula: 'P(\\text{level} \\ge l) = \\exp\\left(-\\frac{l}{m_L}\\right), \\quad m_L = \\frac{1}{\\ln(M)}',
    mathExplanation: 'm_L is the normalization factor controlling the decay rate of node level assignment. Higher layers resemble a skip list, giving logarithmic traversal complexity over millions of high-dimensional vectors.',
    example: {
      title: 'Greedy Beam Search across 3 Graph Layers',
      description: 'Routing query vector Q to its 10 nearest neighbors in an index of 1,000,000 documents.',
      input: 'Query vector Q = [0.12, -0.45, ...]. Graph has Layer 2 (16 nodes), Layer 1 (256 nodes), Layer 0 (1,000,000 nodes).',
      walkthrough: [
        'Layer 2 (Top): Enter at Node 42. Check neighbors [108, 921]. Node 108 is closest to Q (distance 0.62 vs 0.81). Jump to Node 108. No neighbor is closer. Drop down to Layer 1 at Node 108.',
        'Layer 1: From Node 108, inspect 16 local neighbors. Node 3,412 is closer (distance 0.38). Hop to Node 3,412. Local minimum reached. Drop to Layer 0 at Node 3,412.',
        'Layer 0 (Base): Initialize candidate pool with Node 3,412. Execute beam search with ef_search = 64. Iteratively evaluate neighbor vectors, keeping the 64 closest in a sorted min-heap.',
        'Halt when all explored neighbors are farther than the worst candidate in the beam.'
      ],
      output: 'Top 10 nearest semantic neighbor DocIDs found in 0.28 milliseconds after visiting only 142 total graph nodes.'
    },
    engineImplementation: {
      crate: 'crates/dense-engine',
      file: 'src/hnsw.rs',
      role: 'Constructs multi-layer graph index with heuristic diversity edge selection and executes multi-threaded greedy beam searches.'
    },
    relatedTerms: ['scalar-quantization', 'heuristic-edge-selection', 'cosine-similarity']
  },
  {
    id: 'heuristic-edge-selection',
    term: 'Heuristic Diversity Edge Selection',
    acronym: 'HNSW Algo 4',
    category: 'dense',
    algorithmType: 'roadmap',
    roadmapContext: 'Step to Improve (Roadmap TODO): Graph connection pruning heuristic that enforces angular diversity among HNSW neighbors to prevent local minimum clustering traps.',
    oneLiner: 'Edge-pruning heuristic that enforces angular diversity among graph neighbors to prevent clustering traps.',
    definition: 'Heuristic Diversity Edge Selection (Algorithm 4 in Malkov & Yashunin 2018) is the connection strategy used when inserting nodes into an HNSW graph. Rather than connecting a node strictly to its M nearest neighbors, it rejects candidate neighbors if they are closer to an already-selected neighbor than to the base node being connected.',
    mechanism: 'When selecting edges for node N from a pool of candidates C, candidates are sorted by distance to N. Candidate e is added to the edge set if dist(e, N) < dist(e, existing_edge) for all existing edges. This prevents triangular clustering and forces edges to span in different directions across the vector space, creating multi-directional highways.',
    mathFormula: 'e \\in \\text{Neighbors}(N) \\iff \\forall n \\in \\text{Selected}, \\; \\text{dist}(e, N) < \\text{dist}(e, n)',
    mathExplanation: 'Without heuristic selection, all M edges of a node in a dense vector cluster would point into the center of the same cluster, causing graph traversal to get trapped in local minima and drastically degrading recall.',
    example: {
      title: 'Connecting Node N with M = 3 connections from candidates [C1, C2, C3]',
      description: 'Selecting diverse edges for Node N situated near a cluster.',
      input: 'Base Node N at (0, 0). Candidates sorted by distance to N: C1 at (1, 0) [dist=1.0], C2 at (1.1, 0.2) [dist=1.12], C3 at (0, -1.2) [dist=1.2]',
      walkthrough: [
        'Consider C1: Edge set is empty. Add C1. Selected = [C1].',
        'Consider C2: dist(C2, N) = 1.12. But dist(C2, C1) = sqrt((1.1-1)^2 + (0.2-0)^2) = 0.22. Since dist(C2, C1) = 0.22 < dist(C2, N) = 1.12, C2 is redundant with C1 (they point in the exact same direction). Reject C2!',
        'Consider C3: dist(C3, N) = 1.2. dist(C3, C1) = sqrt((0-1)^2 + (-1.2-0)^2) = sqrt(1 + 1.44) = 1.56. Since dist(C3, N) < dist(C3, C1), C3 provides angular diversity. Add C3. Selected = [C1, C3].'
      ],
      output: 'Graph gains balanced routing pathways along both the X and Y axes instead of two redundant edges along the X axis.'
    },
    engineImplementation: {
      crate: 'crates/dense-engine',
      file: 'src/hnsw.rs',
      role: 'Implemented in HnswGraph::select_neighbors_heuristic to build connected graphs that maintain 98%+ recall.'
    },
    relatedTerms: ['hnsw', 'scalar-quantization']
  },
  {
    id: 'scalar-quantization',
    term: 'Scalar Quantization (SQ8)',
    acronym: 'SQ8',
    category: 'dense',
    algorithmType: 'roadmap',
    roadmapContext: 'Step to Improve (Roadmap TODO): 8-bit vector quantization (SQ8) compressing 32-bit float vectors by 75% RAM while enabling AVX2 integer dot product acceleration.',
    oneLiner: 'Uniform mapping of 32-bit floating-point vector dimensions into 8-bit unsigned integers.',
    definition: 'Scalar Quantization (SQ8) is a vector compression technique that linearly maps each coordinate of a high-dimensional vector from a 32-bit float (f32) to an 8-bit unsigned integer (u8). It reduces vector memory footprint by exactly 4x (75% RAM reduction) and replaces expensive floating-point multiplications with hardware-accelerated integer dot products.',
    mechanism: 'For each vector coordinate, the value is normalized against the global or per-vector minimum (v_min) and maximum (v_max) values and scaled to the integer range [0, 255]. At query time, asymmetric distance computation calculates dot products between the float query and 8-bit doc vectors using AVX2 SIMD intrinsics (_mm256_maddubs_epi16 and _mm256_dpbusd_epi32).',
    mathFormula: 'v_{\\text{quant}} = \\left\\lfloor \\frac{v - v_{\\min}}{v_{\\max} - v_{\\min}} \\cdot 255 \\right\\rceil, \\quad v_{\\text{recon}} = v_{\\min} + \\frac{v_{\\text{quant}}}{255} \\cdot (v_{\\max} - v_{\\min})',
    mathExplanation: 'A 384-dimensional f32 vector consumes 1,536 bytes. Quantized to SQ8, it requires only 384 bytes + 8 bytes of scale/bias metadata = 392 bytes, preserving >99% of original cosine similarity ranking fidelity.',
    example: {
      title: 'Quantizing 4 dimensions of an embedding vector',
      description: 'Quantizing coordinate slice [-0.120, 0.045, 0.380, -0.220] into u8 bytes.',
      input: 'Coordinates: [-0.120, 0.045, 0.380, -0.220], with v_min = -0.300, v_max = 0.500',
      walkthrough: [
        'Compute dynamic range: Delta = v_max - v_min = 0.500 - (-0.300) = 0.800.',
        'Dimension 0 (-0.120): round(((-0.120 - (-0.300)) / 0.800) * 255) = round((0.180 / 0.800) * 255) = round(57.375) = 57.',
        'Dimension 1 (0.045):  round(((0.045 - (-0.300)) / 0.800) * 255)  = round((0.345 / 0.800) * 255) = round(109.96) = 110.',
        'Dimension 2 (0.380):  round(((0.380 - (-0.300)) / 0.800) * 255)  = round((0.680 / 0.800) * 255) = round(216.75) = 217.',
        'Dimension 3 (-0.220): round(((-0.220 - (-0.300)) / 0.800) * 255) = round((0.080 / 0.800) * 255) = round(25.50)  = 26.'
      ],
      output: 'Quantized vector slice: [57, 110, 217, 26] as u8 bytes. Storage reduced from 16 bytes (f32) to 4 bytes (u8).'
    },
    engineImplementation: {
      crate: 'crates/index-core',
      file: 'src/sq8.rs',
      role: 'Compresses offline document embeddings and executes AVX2 unrolled integer dot products during HNSW beam search.'
    },
    relatedTerms: ['hnsw', 'simd-intrinsics', 'cosine-similarity']
  },
  {
    id: 'cross-encoder',
    term: 'Cross-Encoder Neural Reranker',
    acronym: 'L2 CE',
    category: 'fusion',
    algorithmType: 'roadmap',
    roadmapContext: 'Step to Improve (Roadmap TODO): Second-stage neural reranking model using full token-to-token transformer attention to reorder top candidate documents for maximum precision.',
    oneLiner: 'A deep transformer model that performs full token-to-token cross-attention between concatenated query and document sequences.',
    definition: 'A Cross-Encoder is a deep neural ranking architecture where a query and document are formatted into a single joint sequence ([CLS] Query [SEP] Document [SEP]) and passed through multi-layer bidirectional transformer attention heads. This allows every token in the query to directly attend to every token in the document, capturing nuanced semantic relationships, negation, and syntactic context that bi-encoders miss.',
    mechanism: 'Because cross-attention has O((|Q| + |D|)^2) computational complexity, running it over millions of documents at query time is computationally infeasible. In a two-stage retrieval pipeline, L1 (BM25 + Dense Cosine / RRF) prunes the corpus down to the top 50 candidates in <1ms, and the Cross-Encoder scores only those 50 candidates in native code via ONNX Runtime.',
    mathFormula: 'S(Q, D) = \\sigma\\left(\\mathbf{W} \\cdot \\text{BERT}_{\\text{pool}}(\\text{[CLS]} \\circ Q \\circ \\text{[SEP]} \\circ D \\circ \\text{[SEP]})\\right)',
    mathExplanation: 'sigma is the sigmoid activation function; W is a linear projection layer mapped to a single scalar relevance logit; BERTpool is the pooled contextual representation of the [CLS] classification token.',
    example: {
      title: 'Disambiguating "bank" in a financial vs geological context',
      description: 'Query: "river bank erosion flood risk" evaluated against two documents containing the word "bank".',
      input: 'Doc 1: "The commercial bank approved loan financing for construction." Doc 2: "Vegetation on the water bank prevents soil wash-off."',
      walkthrough: [
        'A lexical BM25 search scores both documents similarly because both contain the exact keyword "bank".',
        'A Bi-Encoder vector embedding projects both documents to dense space, but may conflate financial and riverbank contexts.',
        'Cross-Encoder token attention: The token "bank" in Doc 2 receives intense attention weights from query tokens "river", "erosion", and "water". In Doc 1, "bank" receives attention only from "approved" and "commercial".',
        'Logit output: Doc 2 logit = +4.82 (relevance = 0.992); Doc 1 logit = -3.10 (relevance = 0.043).'
      ],
      output: 'Doc 2 is correctly promoted to Rank #1 while false-positive Doc 1 is demoted, providing a +13.9% boost in nDCG@10.'
    },
    engineImplementation: {
      crate: 'crates/reranker',
      file: 'src/cross_encoder.rs',
      role: 'Target L2 neural reranker wrapping ONNX Runtime C API to re-score the top 50 candidates from first-stage retrieval.'
    },
    relatedTerms: ['bi-encoder', 'linear-fusion', 'ndcg']
  },
  {
    id: 'simd-intrinsics',
    term: 'SIMD Intrinsics (AVX2)',
    acronym: 'AVX2',
    category: 'systems',
    algorithmType: 'roadmap',
    roadmapContext: 'Step to Improve (Roadmap TODO): AVX2 CPU vector hardware acceleration executing 256-bit parallel operations per cycle for bitvector decoding and quantized dot products.',
    oneLiner: 'CPU vector hardware instructions executing parallel operations across 256-bit registers in a single cycle.',
    definition: 'Single Instruction, Multiple Data (SIMD) intrinsics are specialized CPU instructions exposed in Rust via core::arch::x86_64. AVX2 provides 256-bit wide registers capable of performing arithmetic on up to thirty-two 8-bit integers or eight 32-bit floats simultaneously in a single processor cycle.',
    mechanism: 'AVX2 is used in performance optimizations: 1) Elias-Fano bitvector decoding via hardware popcount and bit-manipulation instructions (POPCNT, TZCNT, BLSR); and 2) SQ8 dot products using _mm256_maddubs_epi16 to compute 32 parallel 8-bit integer multiplications and additions per cycle.',
    mathFormula: '\\mathbf{YMM} = [v_1, v_2, \\dots, v_{32}] \\in \\mathbb{U}_8^{32}, \\quad \\text{Throughput} = 32 \\times \\text{Scalar}',
    mathExplanation: 'Computing the dot product of a 384-dimensional vector requires 384 multiplications and additions. With scalar code, this takes ~384 CPU cycles. With 256-bit AVX2, it completes in just 12 vector cycles.',
    example: {
      title: 'Computing dot product of 32 vector coordinates in 1 cycle',
      description: 'Parallel integer dot product between query and quantized document.',
      input: 'Query vector slice (32 bytes) and Doc vector slice (32 bytes).',
      walkthrough: [
        'Load 32 bytes from query into register YMM0: _mm256_loadu_si256.',
        'Load 32 bytes from document into register YMM1: _mm256_loadu_si256.',
        'Execute _mm256_maddubs_epi16(YMM0, YMM1): multiplies adjacent unsigned and signed 8-bit integers and adds the pairs into 16-bit integers.',
        'Execute _mm256_madd_epi16 to accumulate into 32-bit integers.',
        'Horizontal add to extract scalar dot product.'
      ],
      output: '32 dimensions multiplied and accumulated in 3 CPU cycles instead of 96 cycles.'
    },
    engineImplementation: {
      crate: 'crates/index-core',
      file: 'src/sq8.rs',
      role: 'Hardware-accelerates vector distance computations inside the inner loop of vector beam searches.'
    },
    relatedTerms: ['scalar-quantization', 'zero-allocation', 'hnsw']
  }
];
