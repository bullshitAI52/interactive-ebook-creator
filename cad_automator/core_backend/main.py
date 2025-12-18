import sys
import json
import argparse
import os

# 确保能导入当前目录的模块
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from factory import ProcessorFactory

def main():
    """
    后端入口点 (Entry Point)。
    设计为 CLI 模式，方便被 Tauri/Electron/C# 等任何前端应用调用。
    通信采用标准 JSON 格式。
    """
    parser = argparse.ArgumentParser(description="CAD Headless Automation Backend")
    parser.add_argument("--action", required=True, help="Action key (e.g., smart_clean)")
    parser.add_argument("--file", required=True, help="Absolute path to the input CAD file")
    parser.add_argument("--params", help="JSON string of optional parameters")
    
    args = parser.parse_args()
    
    try:
        # 1. 实例化 (Factory)
        processor = ProcessorFactory.get_processor(args.action)
        
        # 2. 解析参数
        options = json.loads(args.params) if args.params else {}
        
        # 3. 执行 (Polymorphism)
        result = processor.process(args.file, options)
        
        # 4. 输出结果 (JSON to Stdout)
        print(json.dumps(result))
        
    except ValueError as ve:
        # 捕获已知业务错误
        print(json.dumps({"status": "error", "message": str(ve)}))
        sys.exit(1)
    except Exception as e:
        # 捕获未知系统错误
        print(json.dumps({"status": "fatal", "error_type": type(e).__name__, "message": str(e)}))
        sys.exit(2)

if __name__ == "__main__":
    main()
