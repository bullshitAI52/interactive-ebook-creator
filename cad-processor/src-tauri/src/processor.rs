use serde::{Deserialize, Serialize};
use std::error::Error;
use std::path::PathBuf;

// 定义统一的返回结果结构
#[derive(Debug, Serialize)]
pub struct ProcessResult {
    pub status: String,
    pub output_file: Option<PathBuf>,
    pub message: String,
    pub details: serde_json::Value,
}

// [Abstract Product]
// 类似于 Java/C# 的 Interface 或 Python 的 ABC
pub trait CadProcessor {
    // 强制要求每个处理器实现 process 方法
    fn process(&self, file_path: &PathBuf, options: &serde_json::Value) -> Result<ProcessResult, Box<dyn Error>>;
    
    // 强制要求每个处理器能返回自己的名称
    fn name(&self) -> &str;
}
