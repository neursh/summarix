use std::{ sync::Arc, time::Duration };

use axum::{
    extract::{ ws::{ Message, WebSocket }, Query, State, WebSocketUpgrade },
    response::Response,
};
use futures_util::{ stream::{ SplitSink, SplitStream }, SinkExt, StreamExt, TryStreamExt };
use serde_json::json;
use tokio::sync::Mutex;

use crate::states::{ AppState, ServerEnv, WorkersAIAuth };

use super::structs::{ ContextResponse, SummaryResponse, UrlQuery };

pub async fn process(
    ws: WebSocketUpgrade,
    query: Query<UrlQuery>,
    State(state): State<AppState>
    // State(workers_ai_auth): State<WorkersAIAuth>
) -> Response {
    ws.on_upgrade(|socket| process_client(socket, query, state.server_env, state.workers_ai_auth))
}

async fn process_client(
    socket: WebSocket,
    query: Query<UrlQuery>,
    server_env: ServerEnv,
    workers_ai_auth: WorkersAIAuth
) {
    let stream = socket.split();
    let stream = Arc::new((Arc::new(Mutex::new(stream.0)), Arc::new(Mutex::new(stream.1))));

    let health_reader = stream.1.clone();
    tokio::spawn(client_health(health_reader));

    let ping_writer = stream.0.clone();
    tokio::spawn(ping_client(ping_writer));

    let report_writer = stream.0.clone();
    video_process_report(
        report_writer,
        query.url.clone(),
        server_env.context_port.clone(),
        workers_ai_auth
    ).await;
}

async fn video_process_report(
    writer: Arc<Mutex<SplitSink<WebSocket, Message>>>,
    video_link: String,
    context_port: String,
    workers_ai_auth: WorkersAIAuth
) {
    {
        let progress_report = writer.clone();
        if !progress_update(progress_report, "processing", "context").await {
            return;
        }
    }

    let context = match fetch_context(&video_link, &context_port).await {
        Some(output) => output,
        None => {
            {
                let progress_report = writer.clone();
                progress_update(progress_report, "failed", "context").await;
            }
            let _ = writer.lock().await.close().await;
            return;
        }
    };

    if context.subtitle.is_empty() {
        {
            let progress_report = writer.clone();
            progress_update(progress_report, "failed", "subtitle").await;
        }
        let _ = writer.lock().await.close().await;
        return;
    }

    let raw_context = serde_json::to_string(&context).unwrap();

    if raw_context.len() > 10000 || context.subtitle.len() < 2000 {
        {
            let progress_report = writer.clone();
            progress_update(progress_report, "failed", "length check").await;
        }
        let _ = writer.lock().await.close().await;
        return;
    }

    {
        let progress_report = writer.clone();
        if !progress_update(progress_report, "processing", "summarizing").await {
            return;
        }
    }

    let response = match fetch_summary(workers_ai_auth, raw_context).await {
        Some(summary) => summary,
        None => {
            {
                let progress_report = writer.clone();
                progress_update(progress_report, "failed", "summarizing").await;
            }
            let _ = writer.lock().await.close().await;
            return;
        }
    };

    let mut result_write = writer.lock().await;

    let _ = result_write.send(Message::Text(serde_json::to_string(&response).unwrap())).await;
    let _ = result_write.close().await;
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
        format!("http://127.0.0.1:{}/context?url={}", context_port, video_link)
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

async fn fetch_summary(
    workers_ai_auth: WorkersAIAuth,
    raw_context: String
) -> Option<SummaryResponse> {
    // Provide concise answers without additional explanations or apologies.
    // Give me the information directly without any introductory sentences.
    // Exclude any extra wording and just provide the essential answer.
    // The response must not be higher than 400 tokens.
    // English only.
    // Summarize the content of the video.
    let message =
        json!({
        "max_tokens": 400,
        "messages": [
            {
                "role": "system", "content": "Provide concise answers without additional explanations or apologies.\nGive me the information directly without any introductory sentences.\nExclude any extra wording and just provide the essential answer.\nThe response must not be higher than 400 tokens.\nEnglish only.\nSummarize the content of the video."
            },
            {"role": "user", "content": &raw_context}
        ]
    });

    let client = reqwest::Client::new();
    let response = client
        .post(
            format!(
                "https://api.cloudflare.com/client/v4/accounts/{}/ai/run/@cf/meta/llama-2-7b-chat-fp16",
                workers_ai_auth.account_id
            )
        )
        .header("Authorization", format!("Bearer {}", workers_ai_auth.bearer_token))
        .json(&message)
        .send().await;

    match response.unwrap().json::<SummaryResponse>().await {
        Ok(response) => {
            return Some(response);
        }
        Err(e) => {
            println!("{:?}", e);
            return None;
        }
    };
}

async fn ping_client(writer: Arc<Mutex<SplitSink<WebSocket, Message>>>) {
    loop {
        let mut writer_lock = writer.lock().await;

        if writer_lock.send(Message::Ping(vec![0])).await.is_err() {
            return;
        }

        tokio::time::sleep(Duration::from_secs(10)).await;
    }
}

async fn client_health(reader: Arc<Mutex<SplitStream<WebSocket>>>) {
    let mut reader_lock = reader.lock().await;

    // Wait for reading, when client disconnects, this loop quits too, causing the stream to drop.
    while let Ok(Some(_)) = reader_lock.try_next().await {}
}
