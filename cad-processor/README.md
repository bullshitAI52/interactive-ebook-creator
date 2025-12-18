# CAD Processor Pro (Rust Edition)

> 一个基于 Tauri + React + Rust 的高性能无头 CAD 处理工具。
> 采用工厂模式设计，支持一键扩展各种 CAD 清理、转换、分析功能。

## 🏗 架构设计

本项目采用 **Headless Rust Backend** 架构，完全绕过 AutoCAD 软件，直接读取和修改 DXF/DWG (暂需转换) 二进制数据。

### 文件结构

```text
cad-processor/
├── src/                    # [前端] React + Tailwind UI
│   ├── components/         # 拖拽区等组件
│   ├── App.jsx             # 主逻辑控制台
│   └── main.jsx            # 入口
├── src-tauri/              # [后端] Rust Tauri 主进程
│   ├── src/
│   │   ├── main.rs         # Tauri IPC 入口，注册 perform_action 指令
│   │   ├── factory.rs      # [核心] 简单的工厂模式分发器
│   │   ├── processor.rs    # [Trait] 定义所有处理器必须遵守的接口
│   │   └── processors/     # [具体实现]
│   │       ├── cleaner.rs  # "一键清理" 的具体逻辑
│   │       └── merger.rs   # "图层合并" 的具体逻辑
```

## 🚀 如何运行

### 开发环境
1. 安装 Node.js 和 Rust。
2. 安装前端依赖: `npm install`
3. 启动 Tauri 开发模式: `npm run tauri dev`

### 生产打包
生成仅 ~5MB 的独立exe文件:
`npm run tauri build`

## 🛠 如何扩展新功能? (工厂模式)

比如你想加一个 "一键转黑白" (to_bw) 的功能：

1. **新建文件**: 在 `src-tauri/src/processors/` 下新建 `bw_converter.rs`。
2. **实现接口**: 实现 `CadProcessor` Trait。
3. **注册工厂**: 在 `src-tauri/src/factory.rs` 的 `match` 语句中添加一行 ` "to_bw" => Some(Box::new(BwConverter)), `。
4. **前端调用**: 在 `App.jsx` 里加个按钮，调用 `runAction('to_bw')` 即可。

## 📦 依赖说明
目前核心逻辑为 Mock (模拟)，如需操作真实 DXF，请在 `src-tauri/Cargo.toml` 中添加:
```toml
dxf = "0.6"
```
并在 `cleaner.rs` 等文件中写入 `dxf::Drawing::load` 等逻辑。
