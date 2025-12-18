from abc import ABC, abstractmethod

class CadProcessor(ABC):
    """
    [Abstract Product] 
    所有具体的 CAD 处理器必须实现此接口。
    这保证了工厂生产出的任何处理器都有一致的调用方式。
    """
    @abstractmethod
    def process(self, file_path: str, options: dict = None) -> dict:
        """
        执行具体的 CAD 处理逻辑
        
        Args:
            file_path: 输入文件的绝对路径
            options: 包含处理参数的字典 (例如合并的目标图层名)
            
        Returns:
            dict: 处理结果，必须包含 status 字段
        """
        pass
