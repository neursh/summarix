use serde::{ Deserialize, Serialize };

#[derive(Serialize, Deserialize)]
pub struct TranscriptResponse {
    pub status: String,
    pub transcript: String,
}

#[derive(Serialize, Deserialize)]
pub struct ContextResponse {
    pub title: String,
    pub description: String,
    pub channel: String,
    pub subtitle: String,
}

#[derive(Serialize, Deserialize)]
pub struct SummaryResponse {
    pub result: SummaryResult,
    pub success: bool,
    pub errors: Vec<String>,
    pub messages: Vec<String>,
}

#[derive(Serialize, Deserialize)]
pub struct SummaryResult {
    pub response: String,
}

#[derive(Deserialize)]
pub struct UrlQuery {
    pub url: String,
}
