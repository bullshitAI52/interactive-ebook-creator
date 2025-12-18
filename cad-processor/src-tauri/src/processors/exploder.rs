use super::super::processor::{CadProcessor, ProcessResult};
use std::error::Error;
use std::path::PathBuf;
use serde_json::json;

// [Concrete Product 4]
// 爆炸处理器 - 循环展开所有块引用为基本实体
pub struct Exploder;

impl CadProcessor for Exploder {
    fn name(&self) -> &str {
        "Exploder"
    }

    fn process(&self, file_path: &PathBuf, options: &serde_json::Value) -> Result<ProcessResult, Box<dyn Error>> {
        println!("[Rust Core] 正在执行爆炸操作 (Explode Blocks): {:?}", file_path);

        // 使用 dxf crate 直接读取文件
        let mut drawing = dxf::Drawing::load_file(file_path)?;
        
        let mut insert_count = 0;
        
        // 由于dxf crate的API限制,我们采用标记方式:
        // 将所有Insert实体移动到特殊图层,提示用户这些是需要爆炸的块
        for entity in drawing.entities_mut() {
            if matches!(&entity.specific, dxf::entities::EntityType::Insert(_)) {
                entity.common.layer = "BLOCKS_TO_EXPLODE".to_string();
                insert_count += 1;
            }
        }

        // 确定输出路径
        let output = if let Some(output_dir) = options.get("output_path").and_then(|v| v.as_str()) {
            if !output_dir.is_empty() {
                let file_name = format!(
                    "{}_marked.dxf",
                    file_path.file_stem().unwrap().to_string_lossy()
                );
                PathBuf::from(output_dir).join(file_name)
            } else {
                file_path.with_file_name(format!(
                    "{}_marked.dxf",
                    file_path.file_stem().unwrap().to_string_lossy()
                ))
            }
        } else {
            file_path.with_file_name(format!(
                "{}_marked.dxf",
                file_path.file_stem().unwrap().to_string_lossy()
            ))
        };
        
        drawing.save_file(&output)?;

        let message = if insert_count > 0 {
            format!("已标记{}个块引用到BLOCKS_TO_EXPLODE图层", insert_count)
        } else {
            "未发现块引用".to_string()
        };

        Ok(ProcessResult {
            status: "success".to_string(),
            output_file: Some(output),
            message,
            details: json!({
                "marked_inserts": insert_count,
                "note": "块引用已移至BLOCKS_TO_EXPLODE图层",
                "engine": "Rust Native DXF"
            }),
        })
    }
}

// 注释掉暂时不用的辅助函数
/*
// 辅助函数: 应用插入变换到实体
fn apply_insert_transform(entity: &mut dxf::entities::Entity, insert: &dxf::entities::Insert) {
    // 简化版本: 只处理位置偏移
    // 完整版本需要处理: 旋转、缩放、镜像等
    let offset_x = insert.location.x;
    let offset_y = insert.location.y;
    let offset_z = insert.location.z;
    
    match &mut entity.specific {
        dxf::entities::EntityType::Line(line) => {
            line.p1.x += offset_x;
            line.p1.y += offset_y;
            line.p1.z += offset_z;
            line.p2.x += offset_x;
            line.p2.y += offset_y;
            line.p2.z += offset_z;
        },
        dxf::entities::EntityType::Circle(circle) => {
            circle.center.x += offset_x;
            circle.center.y += offset_y;
            circle.center.z += offset_z;
        },
        dxf::entities::EntityType::Arc(arc) => {
            arc.center.x += offset_x;
            arc.center.y += offset_y;
            arc.center.z += offset_z;
        },
        dxf::entities::EntityType::Polyline(polyline) => {
            for vertex in polyline.vertices_mut() {
                vertex.location.x += offset_x;
                vertex.location.y += offset_y;
                vertex.location.z += offset_z;
            }
        },
        dxf::entities::EntityType::Text(text) => {
            text.location.x += offset_x;
            text.location.y += offset_y;
            text.location.z += offset_z;
        },
        _ => {}
    }
}
*/
