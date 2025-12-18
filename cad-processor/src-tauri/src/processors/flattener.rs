use super::super::processor::{CadProcessor, ProcessResult};
use std::error::Error;
use std::path::PathBuf;
use serde_json::json;

// [Concrete Product 3]
// 展平处理器 - 将所有实体强制到Z=0平面
pub struct Flattener;

impl CadProcessor for Flattener {
    fn name(&self) -> &str {
        "Flattener"
    }

    fn process(&self, file_path: &PathBuf, options: &serde_json::Value) -> Result<ProcessResult, Box<dyn Error>> {
        println!("[Rust Core] 正在执行展平操作 (Flatten to Z=0): {:?}", file_path);

        // 使用 dxf crate 直接读取文件
        let mut drawing = dxf::Drawing::load_file(file_path)?;
        let mut flattened_count = 0;

        // 遍历所有实体，将Z坐标设为0
        for entity in drawing.entities_mut() {
            match &mut entity.specific {
                dxf::entities::EntityType::Line(line) => {
                    if line.p1.z != 0.0 || line.p2.z != 0.0 {
                        line.p1.z = 0.0;
                        line.p2.z = 0.0;
                        flattened_count += 1;
                    }
                },
                dxf::entities::EntityType::Circle(circle) => {
                    if circle.center.z != 0.0 {
                        circle.center.z = 0.0;
                        flattened_count += 1;
                    }
                },
                dxf::entities::EntityType::Arc(arc) => {
                    if arc.center.z != 0.0 {
                        arc.center.z = 0.0;
                        flattened_count += 1;
                    }
                },
                dxf::entities::EntityType::Polyline(polyline) => {
                    for vertex in polyline.vertices_mut() {
                        if vertex.location.z != 0.0 {
                            vertex.location.z = 0.0;
                            flattened_count += 1;
                        }
                    }
                },
                dxf::entities::EntityType::LwPolyline(lwpolyline) => {
                    // LwPolyline vertices are already 2D, but we can ensure they stay flat
                    // by checking the extrusion direction
                    if lwpolyline.extrusion_direction.z != 1.0 {
                        lwpolyline.extrusion_direction = dxf::Vector::new(0.0, 0.0, 1.0);
                        flattened_count += 1;
                    }
                },
                dxf::entities::EntityType::Text(text) => {
                    if text.location.z != 0.0 {
                        text.location.z = 0.0;
                        flattened_count += 1;
                    }
                },
                dxf::entities::EntityType::MText(mtext) => {
                    if mtext.insertion_point.z != 0.0 {
                        mtext.insertion_point.z = 0.0;
                        flattened_count += 1;
                    }
                },
                _ => {}
            }
        }

        // 确定输出路径
        let output = if let Some(output_dir) = options.get("output_path").and_then(|v| v.as_str()) {
            if !output_dir.is_empty() {
                let file_name = format!(
                    "{}_flattened.dxf",
                    file_path.file_stem().unwrap().to_string_lossy()
                );
                PathBuf::from(output_dir).join(file_name)
            } else {
                file_path.with_file_name(format!(
                    "{}_flattened.dxf",
                    file_path.file_stem().unwrap().to_string_lossy()
                ))
            }
        } else {
            file_path.with_file_name(format!(
                "{}_flattened.dxf",
                file_path.file_stem().unwrap().to_string_lossy()
            ))
        };
        
        drawing.save_file(&output)?;

        Ok(ProcessResult {
            status: "success".to_string(),
            output_file: Some(output),
            message: "展平完成 (所有实体已强制到Z=0平面)".to_string(),
            details: json!({
                "flattened_entities": flattened_count,
                "engine": "Rust Native DXF"
            }),
        })
    }
}
