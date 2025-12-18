// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod processor;
mod factory;
mod processors;

use std::path::PathBuf;
use crate::factory::ProcessorFactory;
use processor::ProcessResult;

// Tauri Command: 暴露给前端调用
#[tauri::command]
async fn perform_action(action: String, file_path: String, params: serde_json::Value) -> Result<ProcessResult, String> {
    println!("[Tauri] Received action: {} for file: {}", action, file_path);
    
    // 1. 调用工厂
    let processor = ProcessorFactory::create(&action)
        .ok_or_else(|| format!("Unknown action type: {}", action))?;
    
    // 2. 执行处理 (将 PathBuf 转换)
    let path = PathBuf::from(file_path);
    
    // 3. 运行处理逻辑 (在异步线程中运行以避免阻塞 UI)
    // 注意：真实场景中可能需要 tokio::spawn_blocking，这里暂时简化直接调用
    match processor.process(&path, &params) {
        Ok(res) => Ok(res),
        Err(e) => Err(format!("Processing failed: {}", e)),
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![perform_action])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
