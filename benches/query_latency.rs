use criterion::{black_box, criterion_group, criterion_main, Criterion};

use index_core::{EliasFano, SQ8Vector, ScoredDoc};
use lexical_engine::{BM25Model, BM25Params, InvertedIndex, Tokenizer, search_block_max_wand};
use dense_engine::{HnswConfig, HnswIndex, SemanticEmbedder};
use reranker::reciprocal_rank_fusion;

fn bench_bm25_scoring(c: &mut Criterion) {
    let model = BM25Model::new(100_000, 45.0, BM25Params::default());
    let idf = model.idf(250);

    c.bench_function("bm25_term_score", |b| {
        b.iter(|| {
            black_box(model.score_term(black_box(3), black_box(52), black_box(idf)))
        })
    });
}

fn bench_elias_fano(c: &mut Criterion) {
    let doc_ids: Vec<u32> = (0..10_000).map(|i| i * 7 + (i % 3)).collect();
    let ef = EliasFano::from_sorted(&doc_ids).unwrap();

    c.bench_function("elias_fano_next_geq", |b| {
        b.iter(|| {
            black_box(ef.next_geq(black_box(5432), black_box(500)))
        })
    });
}

fn bench_sq8_dot_product(c: &mut Criterion) {
    let mut raw_a = vec![0.0f32; 384];
    let mut raw_b = vec![0.0f32; 384];
    for i in 0..384 {
        raw_a[i] = ((i as f32) * 0.1).sin();
        raw_b[i] = ((i as f32) * 0.2).cos();
    }

    let sq8_a = SQ8Vector::quantize(&raw_a);
    let query_sum: f32 = raw_b.iter().sum();

    c.bench_function("sq8_asymmetric_dot_product_384d", |b| {
        b.iter(|| {
            black_box(sq8_a.dot_product_asymmetric(black_box(&raw_b), black_box(query_sum)))
        })
    });

    c.bench_function("f32_raw_dot_product_384d", |b| {
        b.iter(|| {
            let dot: f32 = raw_a.iter().zip(raw_b.iter()).map(|(x, y)| x * y).sum();
            black_box(dot)
        })
    });
}

fn bench_block_max_wand(c: &mut Criterion) {
    let docs = [
        (0, "the rust programming language is fast safe concurrent systems"),
        (1, "python is popular for data science deep learning and artificial intelligence"),
        (2, "rust has zero cost abstractions fearless concurrency and memory safety"),
        (3, "high throughput retrieval engine using elias fano bitsets and block max wand"),
        (4, "hnsw graphs for approximate nearest neighbor vector search"),
        (5, "scalar quantization sq8 cuts ram consumption by four times"),
        (6, "reciprocal rank fusion combines lexical bm25 and dense semantic candidates"),
        (7, "cross encoder neural reranking models with onnx runtime and ms marco"),
    ];

    let tokenizer = Tokenizer::default();
    let index = InvertedIndex::build(&docs, &tokenizer, BM25Params::default(), 4);
    let query_terms = tokenizer.tokenize("rust retrieval engine concurrency block max wand");

    c.bench_function("block_max_wand_search_top5", |b| {
        b.iter(|| {
            black_box(search_block_max_wand(black_box(&index), black_box(&query_terms), black_box(5)))
        })
    });
}

fn bench_hnsw_knn(c: &mut Criterion) {
    let embedder = SemanticEmbedder::default();
    let mut hnsw = HnswIndex::new(HnswConfig {
        m: 8,
        m0: 16,
        ef_construction: 40,
        ef_search: 32,
        ml: 1.0 / (8.0f64).ln(),
    });

    for i in 0..50 {
        let text = format!("document {} describing neural vector retrieval and indexing", i);
        let vec = embedder.embed(&text);
        hnsw.insert(i, &vec);
    }

    let query_vec = embedder.embed("neural vector indexing");

    c.bench_function("hnsw_search_knn_top10", |b| {
        b.iter(|| {
            black_box(hnsw.search_knn(black_box(&query_vec), black_box(10)))
        })
    });
}

fn bench_rrf_fusion(c: &mut Criterion) {
    let lexical: Vec<ScoredDoc> = (0..100).map(|i| ScoredDoc::new(i, 100.0 - i as f32)).collect();
    let dense: Vec<ScoredDoc> = (0..100).map(|i| ScoredDoc::new((i + 20) % 120, 0.99 - (i as f32) * 0.005)).collect();

    c.bench_function("rrf_fusion_100_candidates", |b| {
        b.iter(|| {
            black_box(reciprocal_rank_fusion(black_box(&lexical), black_box(&dense), black_box(60.0), black_box(20)))
        })
    });
}

criterion_group!(
    benches,
    bench_bm25_scoring,
    bench_elias_fano,
    bench_sq8_dot_product,
    bench_block_max_wand,
    bench_hnsw_knn,
    bench_rrf_fusion
);
criterion_main!(benches);
