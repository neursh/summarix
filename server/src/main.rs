mod routes;
use axum::{ routing::get, Router };

#[tokio::main]
async fn main() {
    let app = Router::new().route("/process", get(routes::process::process));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:4173").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
