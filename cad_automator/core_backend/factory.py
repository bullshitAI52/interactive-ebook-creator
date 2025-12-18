from .processors.cleaner import SmartCleaner
from .processors.merger import LayerMerger

class ProcessorFactory:
    """
    [Factory Class]
    简单工厂类，负责对象的实例化。
    前端不需要知道 'SmartCleaner' 怎么创建，只需要请求 'smart_clean' 即可。
    方便未来添加 'BatchPrint', 'FormatConverter' 等新功能。
    """
    @staticmethod
    def get_processor(task_type: str):
        if task_type == "smart_clean":
            return SmartCleaner()
        elif task_type == "layer_merge":
            return LayerMerger()
        else:
            raise ValueError(f"工厂报错: 未知的任务类型 '{task_type}'")
