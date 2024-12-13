#[derive(Clone)]
pub struct AppState {
    pub server_env: ServerEnv,
    pub workers_ai_auth: WorkersAIAuth,
    // pub services_health: ServicesHealth,
}

#[derive(Clone)]
pub struct ServerEnv {
    pub server_port: String,
    pub context_port: String,
    pub is_dev: bool,
}

#[derive(Clone)]
pub struct WorkersAIAuth {
    pub account_id: String,
    pub bearer_token: String,
}

#[derive(Clone)]
pub struct ServicesHealth {
    pub workers_ai_healthy: bool,
}
