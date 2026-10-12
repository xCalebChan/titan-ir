use std::net::SocketAddr;
use std::path::PathBuf;
use std::sync::Arc;

use axum::{
    extract::{Path, State},
    http::{Method, StatusCode},
    response::{IntoResponse, Json},
    routing::{get, post},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::services::ServeDir;

mod engine;
mod sample_corpus;

use engine::{BenchmarkRequest, SearchRequest, TitanEngine};
use sample_corpus::get_sample_msmarco_passages;

type AppState = Arc<TitanEngine>;

#[tokio::main]
async fn main() {
    println!("============================================================");
    println!("     TitanIR: High-Throughput Hybrid Retrieval Engine       ");
    println!("   Lexical (SIMD Elias-Fano & BMW) + Dense (SQ8 HNSW)       ");
    println!("      Reciprocal Rank Fusion (L1) + Cross-Encoder (L2)      ");
    println!("============================================================");

    let engine = Arc::new(TitanEngine::new());

    // Ingest sample MS MARCO passages
    let sample_passages = get_sample_msmarco_passages();
    let num_passages = sample_passages.len();
    engine.ingest_batch(sample_passages);
    println!("✓ Ingested and indexed {} MS MARCO passage documents", num_passages);

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let dist_path = PathBuf::from("web/dist");

    let mut router = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/search", post(search_handler))
        .route("/api/stats", get(stats_handler))
        .route("/api/benchmark", post(benchmark_handler))
        .route("/api/ingest", post(ingest_handler))
        .route("/api/documents/:id", get(document_handler))
        .layer(cors)
        .with_state(engine);

    if dist_path.exists() {
        println!("✓ Serving React showcase web app from {}", dist_path.display());
        router = router.fallback_service(ServeDir::new(&dist_path));
    }

    let port = 8080;
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    println!("✓ Server listening on http://127.0.0.1:{}", port);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, router).await.unwrap();
}

async fn health_check() -> &'static str {
    "TitanIR Retrieval Engine OK"
}

async fn search_handler(
    State(engine): State<AppState>,
    Json(payload): Json<SearchRequest>,
) -> impl IntoResponse {
    let response = engine.search(&payload);
    Json(response)
}

async fn stats_handler(State(engine): State<AppState>) -> impl IntoResponse {
    let stats = engine.stats();
    Json(stats)
}

async fn benchmark_handler(
    State(engine): State<AppState>,
    Json(payload): Json<BenchmarkRequest>,
) -> impl IntoResponse {
    let response = engine.benchmark(&payload);
    Json(response)
}

async fn ingest_handler(
    State(engine): State<AppState>,
    Json(docs): Json<Vec<index_core::DocRecord>>,
) -> impl IntoResponse {
    let count = docs.len();
    engine.ingest_batch(docs);
    Json(serde_json::json!({
        "status": "success",
        "ingested_count": count
    }))
}

async fn document_handler(
    State(engine): State<AppState>,
    Path(id): Path<u32>,
) -> Result<impl IntoResponse, StatusCode> {
    let store = engine.doc_store.read();
    match store.get(id) {
        Some(doc) => Ok(Json(doc.clone())),
        None => Err(StatusCode::NOT_FOUND),
    }
}
