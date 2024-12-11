mod routes;

use axum::{ routing::get, Router };
use tokio::process::Command;

#[tokio::main]
async fn main() {
    mirco_services();

    let app = Router::new().route("/process", get(routes::process::process));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:4173").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

fn mirco_services() {
    tokio::spawn(transcript_service());
    tokio::spawn(context_service());
}

async fn transcript_service() {
    let mut transcript = Command::new("fastapi")
        .args(["dev", "services/transcript/main.py", "--port", "21637"])
        .spawn()
        .unwrap();

    println!("{}", transcript.wait().await.unwrap());
}

async fn context_service() {
    let mut context = Command::new("fastapi")
        .args(["dev", "services/context/main.py"])
        .spawn()
        .unwrap();

    println!("{}", context.wait().await.unwrap());
}
