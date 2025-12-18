mod processor;
mod factory;
mod processors {
    pub mod cleaner;
    pub mod merger;
}

use std::path::PathBuf;
use serde_json::json;
use crate::factory::ProcessorFactory;

// 模拟 main 函数，展示如何在实际环境中使用
fn main() {
    // 1. 模拟前端发来的请求 (通常来自 Tauri Command)
    let requests = vec![
        ("smart_clean", PathBuf::from("C:/Projects/FloorPlan.dxf"), json!({})),
        ("layer_merge", PathBuf::from("C:/Projects/Arch.dxf"), json!({"target_layer": "WALLS"})),
    ];

    println!("=== CAD Automator System (Rust Edition) Starting ===");

    for (action, file_path, params) in requests {
        // 2. 工厂模式调用: 客户端(main) 不需要知道具体的 Cleaner/Merger 类，只管要 action
        match ProcessorFactory::create(action) {
            Some(processor) => {
                println!("\n>> Action Received: {}", processor.name());
                
                // 3. 多态执行
                match processor.process(&file_path, &params) {
                    Ok(result) => {
                        println!("Result JSON: {}", serde_json::to_string_pretty(&result).unwrap());
                    },
                    Err(e) => eprintln!("Error: {}", e),
                }
            },
            None => eprintln!("Unknown action: {}", action),
        }
    }
}
