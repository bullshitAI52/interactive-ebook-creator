import { useState, useEffect } from 'react';
import { Layers, Sparkles, FolderOpen, Trash2, Github, Scissors, Link, Maximize2, Zap } from 'lucide-react';
import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';

const App = () => {
    // Prevent default right-click menu
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', handleContextMenu);
        return () => document.removeEventListener('contextmenu', handleContextMenu);
    }, []);

    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [logs, setLogs] = useState([]);
    const [outputPath, setOutputPath] = useState('');

    const selectOutputPath = async () => {
        try {
            const selected = await open({
                directory: true,
                multiple: false
            });
            if (selected) {
                setOutputPath(selected);
                setLogs(prev => [...prev, `配置更新: 输出路径 -> ${selected}`]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const selectFiles = async () => {
        try {
            const selected = await open({
                multiple: true,
                filters: [{
                    name: 'CAD Files',
                    extensions: ['dxf', 'dwg']
                }]
            });
            if (selected) {
                const newFiles = Array.isArray(selected) ? selected : [selected];
                addFiles(newFiles);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const addFiles = (newFiles) => {
        // 简单去重
        setFiles(prev => [...new Set([...prev, ...newFiles])]);
    };

    const runAction = async (actionType) => {
        if (files.length === 0) return;
        setProcessing(true);
        setLogs([]);

        for (const file of files) {
            const fileName = file.split(/[\\/]/).pop();
            setLogs(prev => [...prev, `正在处理: ${fileName}...`]);

            try {
                // [Real IPC Call] 调用 Rust 后端
                const result = await invoke('perform_action', {
                    action: actionType,
                    file_path: file,
                    params: {
                        output_path: outputPath // 传递输出路径
                    }
                });

                // 处理成功反馈
                console.log("Rust Response:", result);
                setLogs(prev => [...prev, `✅ 完成: ${result.message}`]);

                // 如果后端返回了 details，也可以显示
                // setLogs(prev => [...prev, `   -> 详情: ${JSON.stringify(result.details)}`]);

            } catch (error) {
                console.error(error);
                setLogs(prev => [...prev, `❌ 失败: ${error}`]);
            }
        }
        setProcessing(false);
    };

    return (
        <div className="h-screen w-screen bg-black text-white font-sans selection:bg-primary/30 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto space-y-8">

                    {/* Header */}
                    <header className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent cursor-default">
                                CAD Processor <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded ml-2 border border-primary/20">PRO</span>
                            </h1>
                            <p className="text-zinc-500 mt-1 cursor-default">高性能 Rust 无头处理引擎</p>
                        </div>
                        <button className="p-2 rounded-full hover:bg-zinc-900 transition-colors">
                            <Github className="text-zinc-500" size={20} />
                        </button>
                    </header>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Left Column: File Selection + Actions */}
                        <div className="md:col-span-2 space-y-6">

                            {/* Compact File Selection Button */}
                            <button
                                onClick={selectFiles}
                                className="w-full bg-zinc-900/50 hover:bg-zinc-800/50 border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-2xl p-4 transition-all duration-300 flex items-center justify-center gap-3 group"
                            >
                                <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <FolderOpen size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="font-medium text-zinc-200">选择 CAD 文件 ({files.length})</div>
                                    <div className="text-xs text-zinc-500">支持 .dxf, .dwg 格式 - 已选择 {files.length} 个文件</div>
                                </div>
                            </button>

                            {/* Action Buttons Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => runAction('smart_clean')}
                                    disabled={files.length === 0 || processing}
                                    className="group relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">智能清理</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">移除废线</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => runAction('layer_merge')}
                                    disabled={files.length === 0 || processing}
                                    className="group relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <Layers size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">图层合并</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">统一归层</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => runAction('overkill')}
                                    disabled={files.length === 0 || processing}
                                    className="group relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-red-500/10 p-2 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <Scissors size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">Overkill</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">删除重复</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => runAction('joint')}
                                    disabled={files.length === 0 || processing}
                                    className="group relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        <Link size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">Joint</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">连接线段</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => runAction('explode')}
                                    disabled={files.length === 0 || processing}
                                    className="group relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                        <Zap size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">Explode (爆炸)</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">打散块和组</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => runAction('flatten')}
                                    disabled={files.length === 0 || processing}
                                    className="group relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                        <Maximize2 size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">Flatten (展平)</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">强制Z=0平面</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setFiles([])}
                                    disabled={files.length === 0}
                                    className="group relative overflow-hidden bg-zinc-800 hover:bg-red-900/50 border border-zinc-700 hover:border-red-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-red-500/10 p-2 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <Trash2 size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">清空列表</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">重新选择</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Settings + Logs */}
                        <div className="space-y-4">

                            {/* Settings Section */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
                                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">环境配置</h2>

                                <div>
                                    <label className="text-xs text-zinc-500 block mb-1">处理后文件保存路径 (可选)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={outputPath}
                                            readOnly
                                            placeholder="默认保存到原文件目录..."
                                            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 w-full outline-none select-none cursor-pointer hover:border-zinc-600 transition-colors"
                                            onClick={selectOutputPath}
                                        />
                                        <button
                                            onClick={selectOutputPath}
                                            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-1 rounded text-xs whitespace-nowrap transition-colors"
                                        >
                                            浏览
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">控制面板</h2>

                                <button
                                    onClick={() => runAction('smart_clean')}
                                    disabled={files.length === 0 || processing}
                                    className="w-full group relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <Sparkles size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">一键智能清理</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">自动移除废线、Purge</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => runAction('layer_merge')}
                                    disabled={files.length === 0 || processing}
                                    className="w-full group relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <Layers size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">图层合并</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">统一归层、规范化</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => runAction('overkill')}
                                    disabled={files.length === 0 || processing}
                                    className="w-full group relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-red-500/10 p-2 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                        <Scissors size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">Overkill (去重)</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">删除重复、重叠对象</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => runAction('joint')}
                                    disabled={files.length === 0 || processing}
                                    className="w-full group relative overflow-hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white py-4 px-4 rounded-xl transition-all duration-300 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                        <Link size={20} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-medium">Joint (连接)</div>
                                        <div className="text-xs text-zinc-500 group-hover:text-zinc-400">连接共点线段为多段线</div>
                                    </div>
                                </button>
                            </div>

                            {/* Status / Logs */}
                            <div className="bg-black border border-zinc-800 rounded-2xl p-4 h-[200px] overflow-hidden flex flex-col">
                                <div className="text-xs text-zinc-500 mb-2 font-mono flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${processing ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                                    SYSTEM LOGS
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-1 font-mono text-xs">
                                    {logs.map((log, i) => (
                                        <div key={i} className="text-zinc-400 border-b border-zinc-900/50 pb-0.5">
                                            <span className="text-zinc-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                            {log}
                                        </div>
                                    ))}
                                    {logs.length === 0 && <span className="text-zinc-700">等待任务启动...</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
