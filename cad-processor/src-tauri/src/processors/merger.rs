use super::super::processor::{CadProcessor, ProcessResult};
use std::error::Error;
use std::path::PathBuf;
use serde_json::json;

// [Concrete Product 2]
// 图层合并处理器
pub struct LayerMerger;

impl CadProcessor for LayerMerger {
    fn name(&self) -> &str {
        "Layer Merger"
    }

    fn process(&self, file_path: &PathBuf, options: &serde_json::Value) -> Result<ProcessResult, Box<dyn Error>> {
        let target_layer = options.get("target_layer").and_then(|v| v.as_str()).unwrap_or("0");
        
        println!("[Rust Core] 正在合并图层到: {}, 文件: {:?} (Native)", target_layer, file_path);

        // 使用 dxf crate
        let mut drawing = dxf::Drawing::load_file(file_path)?;
        let mut modified_count = 0;

        // 遍历所有实体，修改图层
        for entity in drawing.entities_mut() {
            if entity.common.layer != target_layer {
                entity.common.layer = target_layer.to_string();
                modified_count += 1;
            }
        }
        
        // 确定输出路径
        let output = if let Some(output_dir) = options.get("output_path").and_then(|v| v.as_str()) {
            if !output_dir.is_empty() {
                // 用户指定了输出目录
                let file_name = format!(
                    "{}_merged.dxf",
                    file_path.file_stem().unwrap().to_string_lossy()
                );
                PathBuf::from(output_dir).join(file_name)
            } else {
                // 保存到原文件目录
                file_path.with_file_name(format!(
                    "{}_merged.dxf",
                    file_path.file_stem().unwrap().to_string_lossy()
                ))
            }
        } else {
            // 默认保存到原文件目录
            file_path.with_file_name(format!(
                "{}_merged.dxf",
                file_path.file_stem().unwrap().to_string_lossy()
            ))
        };
        
        drawing.save_file(&output)?;

        Ok(ProcessResult {
            status: "success".to_string(),
            output_file: Some(output),
            message: "原生急速合并完成 (无弹窗)".to_string(),
            details: json!({
                "modified_entities": modified_count,
                "target_layer": target_layer,
                "engine": "Rust Native DXF"
            }),
        })
    }
}
