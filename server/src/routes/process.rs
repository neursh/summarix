use std::sync::Arc;

use axum::{
    extract::{ ws::{ Message, WebSocket }, Query, State, WebSocketUpgrade },
    response::Response,
};
use futures_util::{ stream::{ SplitSink, SplitStream }, SinkExt, StreamExt, TryStreamExt };
use tokio::sync::Mutex;

use crate::states::ServerEnv;

use super::structs::{ ContextResponse, UrlQuery };

pub async fn process(
    ws: WebSocketUpgrade,
    query: Query<UrlQuery>,
    State(state): State<ServerEnv>
) -> Response {
    ws.on_upgrade(|socket| process_client(socket, query, state))
}

async fn process_client(socket: WebSocket, query: Query<UrlQuery>, state: ServerEnv) {
    let stream = socket.split();
    let stream = Arc::new((Arc::new(Mutex::new(stream.0)), Arc::new(Mutex::new(stream.1))));

    let health_reader = stream.1.clone();
    tokio::spawn(client_health(health_reader));

    let report_writer = stream.0.clone();
    video_process_report(report_writer, query.url.clone(), state.context_port.clone()).await;
}

async fn video_process_report(
    writer: Arc<Mutex<SplitSink<WebSocket, Message>>>,
    video_link: String,
    context_port: String
) {
    {
        let progress_report = writer.clone();
        if !progress_update(progress_report, "processing", "context").await {
            return;
        }
    }

    let mut context = match fetch_context(&video_link, &context_port).await {
        Some(output) => output,
        None => {
            {
                let progress_report = writer.clone();
                progress_update(progress_report, "failed", "context").await;
            }
            return;
        }
    };

    if context.subtitle.is_empty() {
        {
            let progress_report = writer.clone();
            if !progress_update(progress_report, "failed", "subtitle").await {
                return;
            }
        }
    }

    {
        let progress_report = writer.clone();
        if !progress_update(progress_report, "processing", "summarizing").await {
            return;
        }
    }

    // TODO: Process using LLM.
}

async fn progress_update(
    progress_report: Arc<Mutex<SplitSink<WebSocket, Message>>>,
    status: &str,
    stage: &str
) -> bool {
    let mut progress_report_lock = progress_report.lock().await;
    if
        progress_report_lock
            .send(
                Message::Text(format!("{{\"status\":\"{}\",\"stage\":\"{}\"}}", status, stage))
            ).await
            .is_ok()
    {
        return true;
    }

    false
}

async fn fetch_context(video_link: &str, context_port: &str) -> Option<ContextResponse> {
    let context_request = reqwest::get(
        format!("http://127.0.0.1:{}?url={}", context_port, video_link)
    ).await;
    if context_request.is_err() {
        return None;
    }

    let context_response = context_request.unwrap().json::<ContextResponse>().await;
    if context_response.is_err() {
        return None;
    }

    Some(context_response.unwrap())
}

async fn fetch_summary() {}

async fn client_health(health_reader: Arc<Mutex<SplitStream<WebSocket>>>) {
    let mut reader_lock = health_reader.lock().await;

    // Wait for reading, when client disconnects, this loop quits too, causing the stream to drop.
    while let Ok(Some(_)) = reader_lock.try_next().await {}
}
