import React, { useState } from 'react';
import { Stage } from 'react-konva';
import GeometryLayer from './GeometryLayer';
import { IShape, ShapeType } from '../../types/shapes';
import { shapeFactory } from '../../utils/ShapeFactory';
import { save, open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api/tauri';
import { MousePointer2, Plus, Type, Circle as CircleIcon, PenTool, Triangle, Save, FolderOpen, RotateCw, RotateCcw, Trash2, Square, Palette, RefreshCw, Minus, MoveRight, MoveUpRight, MoveUp } from 'lucide-react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import ProofPanel from '../ProofPanel/ProofPanel';
import ShapeInspector from '../ProofPanel/ShapeInspector';

const Board: React.FC = () => {
    const [shapes, setShapes] = useState<IShape[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [currentColor, setCurrentColor] = useState<string>('#00D2FF');
    
    const colors = [
        '#00D2FF', // 蓝色
        '#FF6B6B', // 红色
        '#4ECDC4', // 青色
        '#FFD166', // 黄色
        '#06D6A0', // 绿色
        '#118AB2', // 深蓝
        '#EF476F', // 粉色
        '#073B4C', // 深灰
        '#FFFFFF', // 白色
        '#000000', // 黑色
    ];

    const addShape = (type: ShapeType) => {
        const newShape = shapeFactory.createShape(type, {
            x: Math.random() * 200 + 100, // random pos near center
            y: Math.random() * 200 + 100,
            stroke: currentColor,
            fill: type === 'circle' || type === 'triangle' ? `${currentColor}33` : undefined
        });
        setShapes([...shapes, newShape]);
        setSelectedId(newShape.id);
    };

    const updateShape = (updatedShape: IShape) => {
        setShapes(shapes.map(s => s.id === updatedShape.id ? updatedShape : s));
    };

    const deleteSelectedShape = () => {
        if (selectedId) {
            setShapes(shapes.filter(s => s.id !== selectedId));
            setSelectedId(null);
        }
    };

    const rotateSelectedShape = (degrees: number) => {
        if (selectedId) {
            const updatedShapes = shapes.map(shape => {
                if (shape.id === selectedId) {
                    return {
                        ...shape,
                        rotation: (shape.rotation || 0) + degrees
                    };
                }
                return shape;
            });
            setShapes(updatedShapes);
        }
    };

    const changeSelectedShapeColor = (color: string) => {
        if (selectedId) {
            const updatedShapes = shapes.map(shape => {
                if (shape.id === selectedId) {
                    if (shape.type === 'line' || shape.type === 'triangle' || shape.type === 'square') {
                        return { ...shape, stroke: color };
                    } else if (shape.type === 'circle') {
                        return { ...shape, stroke: color, fill: `${color}33` };
                    } else if (shape.type === 'text') {
                        return { ...shape, fill: color };
                    }
                }
                return shape;
            });
            setShapes(updatedShapes);
        }
        setCurrentColor(color);
    };

    const handleSave = async () => {
        try {
            const projectState = JSON.stringify(shapes, null, 2);
            const path = await save({
                filters: [{ name: 'Geo Project', extensions: ['geo', 'json'] }]
            });
            if (path) {
                await invoke('save_file', { path, content: projectState });
                alert('Project Saved!');
            }
        } catch (err) {
            console.error(err);
            alert('Failed to save project');
        }
    };

    const handleLoad = async () => {
        try {
            const path = await open({
                filters: [{ name: 'Geo Project', extensions: ['geo', 'json'] }]
            });
            if (typeof path === 'string') {
                const content = await invoke('read_file', { path }) as string;
                const loadedShapes = JSON.parse(content);
                setShapes(loadedShapes);
                setSelectedId(null);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to load project');
        }
    };

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-50 text-slate-800">
            {/* 左侧绘图工具栏 - 简洁设计 */}
            <div className="w-64 flex flex-col border-r border-slate-200 bg-white/95 backdrop-blur-sm z-10">
                {/* 工具栏标题 */}
                <div className="p-4 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-sm">
                            <Palette size={18} className="text-white" />
                        </div>
                        <span>绘图工具</span>
                    </h2>
                </div>
                
                {/* 文件操作 - 简洁版 */}
                <div className="p-4 border-b border-slate-100">
                    <div className="flex gap-2">
                        <button
                            className="flex-1 py-2 px-3 rounded-lg hover:bg-blue-50 transition bg-white border border-slate-200 text-slate-700 flex items-center justify-center gap-2"
                            title="保存项目"
                            onClick={handleSave}
                        >
                            <Save size={16} className="text-blue-600" />
                            <span className="text-sm">保存</span>
                        </button>
                        <button
                            className="flex-1 py-2 px-3 rounded-lg hover:bg-green-50 transition bg-white border border-slate-200 text-slate-700 flex items-center justify-center gap-2"
                            title="打开项目"
                            onClick={handleLoad}
                        >
                            <FolderOpen size={16} className="text-green-600" />
                            <span className="text-sm">打开</span>
                        </button>
                    </div>
                </div>
                
                {/* 颜色选择 - 简洁版 */}
                <div className="p-4 border-b border-slate-100">
                    <div className="grid grid-cols-5 gap-2 mb-3">
                        {colors.map((color) => (
                            <button
                                key={color}
                                className={`w-8 h-8 rounded-lg border ${currentColor === color ? 'border-2 border-blue-500' : 'border-slate-300'} hover:scale-105 transition-transform`}
                                style={{ backgroundColor: color }}
                                title={`选择颜色: ${color}`}
                                onClick={() => changeSelectedShapeColor(color)}
                            />
                        ))}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
                        <div className="w-3 h-3 rounded border border-slate-300" style={{ backgroundColor: currentColor }}></div>
                        <span>当前颜色</span>
                    </div>
                </div>
                
                {/* 基本形状 - 简洁版 */}
                <div className="p-4 border-b border-slate-100">
                    <div className="grid grid-cols-4 gap-2">
                        <button
                            className="py-3 px-2 rounded-lg hover:bg-blue-50 transition bg-white border border-slate-200 flex flex-col items-center gap-1"
                            title="添加直线"
                            onClick={() => addShape('line')}
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <PenTool size={16} className="text-blue-600" />
                            </div>
                            <span className="text-xs text-slate-700">直线</span>
                        </button>
                        <button
                            className="py-3 px-2 rounded-lg hover:bg-green-50 transition bg-white border border-slate-200 flex flex-col items-center gap-1"
                            title="添加水平线"
                            onClick={() => {
                                const newShape = shapeFactory.createShape('line', {
                                    x: Math.random() * 200 + 100,
                                    y: Math.random() * 200 + 100,
                                    stroke: currentColor,
                                    points: [0, 0, 100, 0] // 水平线
                                });
                                setShapes([...shapes, newShape]);
                                setSelectedId(newShape.id);
                            }}
                        >
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Minus size={16} className="text-green-600" />
                            </div>
                            <span className="text-xs text-slate-700">水平线</span>
                        </button>
                        <button
                            className="py-3 px-2 rounded-lg hover:bg-purple-50 transition bg-white border border-slate-200 flex flex-col items-center gap-1"
                            title="添加垂直线"
                            onClick={() => {
                                const newShape = shapeFactory.createShape('line', {
                                    x: Math.random() * 200 + 100,
                                    y: Math.random() * 200 + 100,
                                    stroke: currentColor,
                                    points: [0, 0, 0, 100] // 垂直线
                                });
                                setShapes([...shapes, newShape]);
                                setSelectedId(newShape.id);
                            }}
                        >
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <MoveUp size={16} className="text-purple-600" />
                            </div>
                            <span className="text-xs text-slate-700">垂直线</span>
                        </button>
                        <button
                            className="py-3 px-2 rounded-lg hover:bg-amber-50 transition bg-white border border-slate-200 flex flex-col items-center gap-1"
                            title="添加45度线"
                            onClick={() => {
                                const newShape = shapeFactory.createShape('line', {
                                    x: Math.random() * 200 + 100,
                                    y: Math.random() * 200 + 100,
                                    stroke: currentColor,
                                    points: [0, 0, 100, 100] // 45度线
                                });
                                setShapes([...shapes, newShape]);
                                setSelectedId(newShape.id);
                            }}
                        >
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                <MoveUpRight size={16} className="text-amber-600" />
                            </div>
                            <span className="text-xs text-slate-700">45°线</span>
                        </button>
                        <button
                            className="py-3 px-2 rounded-lg hover:bg-green-50 transition bg-white border border-slate-200 flex flex-col items-center gap-1"
                            title="添加圆形"
                            onClick={() => addShape('circle')}
                        >
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                <CircleIcon size={16} className="text-green-600" />
                            </div>
                            <span className="text-xs text-slate-700">圆形</span>
                        </button>
                        <button
                            className="py-3 px-2 rounded-lg hover:bg-purple-50 transition bg-white border border-slate-200 flex flex-col items-center gap-1"
                            title="添加方形"
                            onClick={() => addShape('square')}
                        >
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <Square size={16} className="text-purple-600" />
                            </div>
                            <span className="text-xs text-slate-700">方形</span>
                        </button>
                        <button
                            className="py-3 px-2 rounded-lg hover:bg-amber-50 transition bg-white border border-slate-200 flex flex-col items-center gap-1"
                            title="添加三角形"
                            onClick={() => addShape('triangle')}
                        >
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                                <Triangle size={16} className="text-amber-600" />
                            </div>
                            <span className="text-xs text-slate-700">三角形</span>
                        </button>
                        <button
                            className="py-3 px-2 rounded-lg hover:bg-pink-50 transition bg-white border border-slate-200 flex flex-col items-center gap-1"
                            title="添加文字"
                            onClick={() => addShape('text')}
                        >
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                                <Type size={16} className="text-pink-600" />
                            </div>
                            <span className="text-xs text-slate-700">文字</span>
                        </button>
                    </div>
                </div>
                
                {/* 选中形状操作 - 简洁版 */}
                {selectedId && (
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex gap-2 mb-3">
                            <button
                                className="flex-1 py-2 px-3 rounded-lg hover:bg-red-50 transition bg-white border border-slate-200 text-slate-700 flex items-center justify-center gap-2"
                                title="删除选中"
                                onClick={deleteSelectedShape}
                            >
                                <Trash2 size={14} className="text-red-500" />
                                <span className="text-sm">删除</span>
                            </button>
                            <button
                                className="flex-1 py-2 px-3 rounded-lg hover:bg-blue-50 transition bg-white border border-slate-200 text-slate-700 flex items-center justify-center gap-2"
                                title="重置旋转"
                                onClick={() => {
                                    if (selectedId) {
                                        const updatedShapes = shapes.map(shape => {
                                            if (shape.id === selectedId) {
                                                return { ...shape, rotation: 0 };
                                            }
                                            return shape;
                                        });
                                        setShapes(updatedShapes);
                                    }
                                }}
                            >
                                <RefreshCw size={14} className="text-blue-500" />
                                <span className="text-sm">重置</span>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1">
                            <button
                                className="py-1 px-2 rounded hover:bg-amber-50 transition bg-white border border-slate-200 text-slate-700 flex flex-col items-center"
                                title="旋转45°"
                                onClick={() => rotateSelectedShape(45)}
                            >
                                <RotateCw size={12} className="text-amber-500" />
                                <span className="text-xs">45°</span>
                            </button>
                            <button
                                className="py-1 px-2 rounded hover:bg-amber-50 transition bg-white border border-slate-200 text-slate-700 flex flex-col items-center"
                                title="旋转90°"
                                onClick={() => rotateSelectedShape(90)}
                            >
                                <RotateCw size={12} className="text-amber-500" />
                                <span className="text-xs">90°</span>
                            </button>
                            <button
                                className="py-1 px-2 rounded hover:bg-amber-50 transition bg-white border border-slate-200 text-slate-700 flex flex-col items-center"
                                title="旋转180°"
                                onClick={() => rotateSelectedShape(180)}
                            >
                                <RefreshCw size={12} className="text-amber-500" />
                                <span className="text-xs">180°</span>
                            </button>
                        </div>
                    </div>
                )}
                
                {/* 画布信息 */}
                <div className="p-5">
                    <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                        画布信息
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50">
                            <span className="text-slate-700">形状数量:</span>
                            <span className="font-bold text-blue-600 text-lg">{shapes.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                            <span className="text-slate-700">选中状态:</span>
                            <span className={`font-bold ${selectedId ? 'text-green-600' : 'text-slate-400'}`}>
                                {selectedId ? '✓ 已选中' : '○ 未选中'}
                            </span>
                        </div>
                        {selectedId && (
                            <>
                                <div className="h-px bg-slate-200 my-2"></div>
                                <div className="p-3 rounded-lg bg-indigo-50">
                                    <div className="text-xs text-indigo-600 font-semibold mb-1">选中形状:</div>
                                    <div className="text-sm text-slate-700 truncate" title={selectedId}>
                                        📐 {shapes.find(s => s.id === selectedId)?.type}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 主工作区 - 清爽风格 */}
            <Group orientation="horizontal" className="flex-1">
                <Panel defaultSize={70} minSize={30}>
                    <div className="h-full w-full relative bg-gradient-to-br from-white to-blue-50">
                        {/* 网格背景 */}
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,#e0f2fe_1px,transparent_1px),linear-gradient(180deg,#e0f2fe_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
                        
                        <Stage
                            width={window.innerWidth - 64 - 300} // Approximate initial width, need ResizeObserver for real dynamic width
                            height={window.innerHeight}
                            onMouseDown={(e) => {
                                if (e.target === e.target.getStage()) {
                                    setSelectedId(null);
                                }
                            }}
                        >
                            <GeometryLayer
                                shapes={shapes}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                onChange={setShapes}
                            />
                        </Stage>
                        
                        {/* 画布标题 */}
                        <div className="absolute top-6 left-6 bg-white/90 p-4 rounded-2xl border border-blue-100 shadow-lg pointer-events-none backdrop-blur-sm">
                            <h3 className="font-bold text-blue-600 text-lg flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                几何证明画布
                            </h3>
                            <p className="text-sm text-slate-600 mt-1">点击添加形状，拖拽调整位置和角度</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span>点击选择</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span>拖拽移动</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <span>旋转调整</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* 操作提示 */}
                        <div className="absolute bottom-6 right-6 bg-white/90 p-4 rounded-2xl border border-green-100 shadow-lg pointer-events-none backdrop-blur-sm max-w-xs">
                            <div className="text-sm font-semibold text-green-600 mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                                </svg>
                                小朋友操作提示
                            </div>
                            <ul className="text-xs text-slate-600 space-y-1">
                                <li>• 点击左侧形状按钮添加图形</li>
                                <li>• 点击图形选中，拖拽移动</li>
                                <li>• 使用控制点旋转和缩放</li>
                                <li>• 点击颜色按钮改变图形颜色</li>
                                <li>• 试试旋转按钮让图形转起来！</li>
                            </ul>
                        </div>
                    </div>
                </Panel>

                <Separator className="w-1 bg-gradient-to-b from-blue-200 to-indigo-200 hover:from-blue-300 hover:to-indigo-300 transition cursor-col-resize" />

                <Panel defaultSize={30} minSize={20}>
                    {selectedId ? (
                        <ShapeInspector
                            selectedShape={shapes.find(s => s.id === selectedId) || null}
                            onUpdate={updateShape}
                        />
                    ) : (
                        <ProofPanel />
                    )}
                </Panel>
            </Group>
        </div>
    );
};

export default Board;
