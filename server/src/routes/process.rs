use std::sync::Arc;

use axum::{
    extract::{ ws::{ Message, WebSocket }, Query, State, WebSocketUpgrade },
    response::Response,
};
use futures_util::{
    stream::{ SplitSink, SplitStream },
    SinkExt,
    StreamExt,
    TryStreamExt,
};
use serde::Deserialize;
use tokio::sync::Mutex;
use tokio_tungstenite::{ connect_async, tungstenite };

use crate::states::ServerEnv;

#[derive(Deserialize)]
pub struct UrlQuery {
    url: String,
}

pub async fn process(
    ws: WebSocketUpgrade,
    query: Query<UrlQuery>,
    State(state): State<ServerEnv>
) -> Response {
    ws.on_upgrade(|socket| process_client(socket, query, state))
}

async fn process_client(
    socket: WebSocket,
    query: Query<UrlQuery>,
    state: ServerEnv
) {
    let stream = socket.split();
    let stream = Arc::new((
        Arc::new(Mutex::new(stream.0)),
        Arc::new(Mutex::new(stream.1)),
    ));

    let health_reader = stream.1.clone();
    tokio::spawn(client_health(health_reader));

    let report_writer = stream.0.clone();
    video_process_report(
        report_writer,
        query.url.clone(),
        state.transcript_port.clone()
    ).await;
}

async fn video_process_report(
    writer: Arc<Mutex<SplitSink<WebSocket, Message>>>,
    video_link: String,
    transcript_port: String
) {
    let mut transcript_layer = connect_async(
        format!("ws://127.0.0.1:{}/transcript", transcript_port)
    ).await.unwrap();

    transcript_layer.0
        .send(tungstenite::Message::Text(video_link)).await
        .unwrap();

    let mut writer_lock = writer.lock().await;
    while let Ok(Some(report)) = transcript_layer.0.try_next().await {
        let send_report = match report.is_text() {
            true =>
                writer_lock.send(
                    Message::Text(report.into_text().unwrap())
                ).await,

            false =>
                writer_lock.send(Message::Binary(report.into_data())).await,
        };

        if send_report.is_err() {
            return;
        }
    }

    transcript_layer.0.close(None).await.unwrap();
}

async fn client_health(health_reader: Arc<Mutex<SplitStream<WebSocket>>>) {
    let mut reader_lock = health_reader.lock().await;

    // Wait for reading, when client disconnects, this loop quits too, causing the stream to drop.
    while let Ok(Some(_)) = reader_lock.try_next().await {}
}
