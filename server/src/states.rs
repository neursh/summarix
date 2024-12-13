#[derive(Clone)]
pub struct ServerEnv {
    pub server_port: String,
    pub context_port: String,
    pub is_dev: bool,
}
