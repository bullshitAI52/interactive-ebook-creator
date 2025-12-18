import { useState, useCallback } from 'react';
import { Upload, FileType, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
// import { listen } from '@tauri-apps/api/event'; // 实际环境可以监听文件拖入

export default function DropZone({ onFilesSelected }) {
    const [isDragging, setIsDragging] = useState(false);

    // 模拟 Tauri 文件拖拽监听 (生产环境需用 tauri-plugin-drag)
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        // 简单获取 file objects (web api)
        // 在 Tauri 中通常使用 dialog.open 或 监听 file-drop 事件
        const files = Array.from(e.dataTransfer.files).map(f => f.path || f.name);
        if (files.length > 0) onFilesSelected(files);
    };

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsx(
                "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-out h-64 flex flex-col items-center justify-center",
                isDragging
                    ? "border-primary bg-primary/10 scale-[1.02]"
                    : "border-zinc-700 bg-zinc-900/50 hover:border-zinc-500 hover:bg-zinc-800/50"
            )}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <motion.div
                initial={{ y: 0 }}
                animate={{ y: isDragging ? -10 : 0 }}
                className="z-10 flex flex-col items-center gap-4"
            >
                <div className={clsx(
                    "p-4 rounded-full transition-colors duration-300",
                    isDragging ? "bg-primary text-white" : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200"
                )}>
                    <Upload size={32} />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-zinc-200">
                        {isDragging ? "释放以添加文件" : "拖入 CAD 文件 (.dxf, .dwg)"}
                    </h3>
                    <p className="text-sm text-zinc-500 mt-1">支持批量处理</p>
                </div>
            </motion.div>
        </div>
    );
}
