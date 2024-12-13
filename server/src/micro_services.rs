use tokio::process::Command;

pub fn mirco_services(context_port: String, is_dev: bool) {
    tokio::spawn(context_service(context_port, is_dev));
}

async fn context_service(context_port: String, is_dev: bool) {
    let mut context = Command::new("fastapi")
        .args([
            if is_dev { "dev" } else { "run" },
            "services/context/main.py",
            "--port",
            &context_port,
        ])
        .spawn()
        .unwrap();

    println!("{}", context.wait().await.unwrap());
}
