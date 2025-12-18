use super::super::processor::{CadProcessor, ProcessResult};
use std::error::Error;
use std::path::PathBuf;
use serde_json::json;

// [Concrete Product 1]
// 一键清理处理器
pub struct SmartCleaner;

impl CadProcessor for SmartCleaner {
    fn name(&self) -> &str {
        "Smart Cleaner"
    }

    fn process(&self, file_path: &PathBuf, options: &serde_json::Value) -> Result<ProcessResult, Box<dyn Error>> {
        println!("[Rust Core] 正在执行智能清理 (Native Mode): {:?}", file_path);

        // 使用 dxf crate 直接读取文件 (无需启动 CAD)
        let mut drawing = dxf::Drawing::load_file(file_path)?;
        
        // 收集需要移除的实体索引
        // 注意: 直接修改 entities 比较复杂，这里演示简单逻辑：过滤无效实体
        // 这里的 "智能清理" example: 移除长度为 0 的直线
        
        // 尝试使用 entities_mut() 迭代并标记
        // 由于 dxf crate 在此版本似乎不支持直接从迭代器移除元素
        // 我们采取更安全的策略: 将废线移动到 "TRASH" 图层
        let mut marked_count = 0;
        
        for entity in drawing.entities_mut() {
             match &entity.specific {
                dxf::entities::EntityType::Line(line) => {
                    let len_sq = (line.p1.x - line.p2.x).powi(2) + 
                                 (line.p1.y - line.p2.y).powi(2) + 
                                 (line.p1.z - line.p2.z).powi(2);
                    if len_sq < 1e-6 {
                        entity.common.layer = "TRASH_AUTO_CLEAN".to_string();
                        marked_count += 1;
                    }
                },
                _ => {}
            }
        }

        // 确定输出路径
        let output = if let Some(output_dir) = options.get("output_path").and_then(|v| v.as_str()) {
            if !output_dir.is_empty() {
                // 用户指定了输出目录
                let file_name = format!(
                    "{}_cleaned.dxf",
                    file_path.file_stem().unwrap().to_string_lossy()
                );
                PathBuf::from(output_dir).join(file_name)
            } else {
                // 保存到原文件目录
                file_path.with_file_name(format!(
                    "{}_cleaned.dxf",
                    file_path.file_stem().unwrap().to_string_lossy()
                ))
            }
        } else {
            // 默认保存到原文件目录
            file_path.with_file_name(format!(
                "{}_cleaned.dxf",
                file_path.file_stem().unwrap().to_string_lossy()
            ))
        };
        
        drawing.save_file(&output)?;

        Ok(ProcessResult {
            status: "success".to_string(),
            output_file: Some(output),
            message: "原生急速清理完成 (废线已移至 TRASH 图层)".to_string(),
            details: json!({
                "moved_to_trash_count": marked_count,
                "engine": "Rust Native DXF"
            }),
        })
    }
}
