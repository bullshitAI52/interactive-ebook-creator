use super::processor::CadProcessor;
use super::processors::cleaner::SmartCleaner;
use super::processors::merger::LayerMerger;
use super::processors::flattener::Flattener;
use super::processors::exploder::Exploder;

// [Factory]
// 处理器工厂
pub struct ProcessorFactory;

impl ProcessorFactory {
    // 这里也是 "前后端分离" 的关键点
    // 接受一个字符串 key，返回一个动态分发的 Trait 对象 (Box<dyn CadProcessor>)
    pub fn create(action_type: &str) -> Option<Box<dyn CadProcessor>> {
        match action_type {
            "smart_clean" => Some(Box::new(SmartCleaner)),
            "layer_merge" => Some(Box::new(LayerMerger)),
            "flatten" => Some(Box::new(Flattener)),
            "explode" => Some(Box::new(Exploder)),
            _ => None,
        }
    }
}
