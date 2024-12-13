mod routes;
mod micro_services;
mod states;

use std::{ collections::HashMap, env };

use dotenv::dotenv;
use axum::{ routing::get, Router };
use micro_services::mirco_services;
use states::ServerEnv;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let mut dotenv_map: HashMap<String, String> = HashMap::new();

    for (key, value) in env::vars() {
        dotenv_map.insert(key, value);
    }

    let server_port = dotenv_map.get("SERVER_PORT").unwrap().clone();

    let state = ServerEnv {
        server_port: server_port.clone(),
        context_port: dotenv_map.get("CONTEXT_SERVICE_PORT").unwrap().clone(),
        is_dev: if dotenv_map.get("DEV").unwrap().clone() == "FALSE" {
            false
        } else {
            true
        },
    };

    mirco_services(
        state.context_port.clone(),
        state.is_dev.clone()
    );

    let app = Router::new()
        .route("/process", get(routes::process::process))
        .with_state(state);

    let listener = tokio::net::TcpListener
        ::bind(format!("127.0.0.1:{}", server_port)).await
        .unwrap();
    axum::serve(listener, app).await.unwrap();
}
