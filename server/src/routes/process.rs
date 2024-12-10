use std::sync::Arc;

use axum::{
    extract::{ ws::{ Message, WebSocket }, Query, WebSocketUpgrade },
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

#[derive(Deserialize)]
pub struct UrlQuery {
    url: String,
}

pub async fn process(ws: WebSocketUpgrade, query: Query<UrlQuery>) -> Response {
    ws.on_upgrade(|socket| process_client(socket, query))
}

async fn process_client(socket: WebSocket, query: Query<UrlQuery>) {
    let stream = socket.split();
    let stream = Arc::new((
        Arc::new(Mutex::new(stream.0)),
        Arc::new(Mutex::new(stream.1)),
    ));

    let report_writer = stream.0.clone();
    tokio::spawn(video_process_report(report_writer, query.url.clone()));

    let health_reader = stream.1.clone();
    tokio::spawn(client_health(health_reader));
}

async fn video_process_report(
    writer: Arc<Mutex<SplitSink<WebSocket, Message>>>,
    video_link: String
) {
    let mut transcript_layer = connect_async(
        "ws://127.0.0.1:21637/transcript"
    ).await.unwrap();

    transcript_layer.0
        .send(tungstenite::Message::Text(video_link)).await
        .unwrap();

    let mut writer_lock = writer.lock().await;
    while let Ok(Some(report)) = transcript_layer.0.try_next().await {
        if report.is_text() {
            if
                writer_lock
                    .send(Message::Text(report.into_text().unwrap())).await
                    .is_err()
            {
                return;
            }
        } else if report.is_binary() {
            if
                writer_lock
                    .send(Message::Binary(report.into_data())).await
                    .is_err()
            {
                return;
            }
        }
    }
}

async fn client_health(health_reader: Arc<Mutex<SplitStream<WebSocket>>>) {
    let mut reader_lock = health_reader.lock().await;

    // Wait for reading, when client disconnects, this loop quits too, causing the stream to drop.
    while let Ok(Some(_)) = reader_lock.try_next().await {}
}
