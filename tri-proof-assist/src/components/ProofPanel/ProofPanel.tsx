import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri'; // Assuming invoke is from tauri

const ProofPanel: React.FC = () => {
    const [generating, setGenerating] = useState(false);
    const [apiKey, setApiKey] = useState('');

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const response = await invoke('generate_problem', {
                topic: 'Right Triangle',
                difficulty: 'Easy',
                apiKey: apiKey // Pass the key from UI
            });
            console.log("DeepSeek Output:", response);
            // In a real app, we would parse this JSON and update the 'shapes' logic
            alert("AI Generated Problem:\n" + response);
        } catch (error) {
            console.error(error);
            alert("Error generating problem: " + error);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-white to-blue-50 border-l border-slate-200">
            {/* 证明面板标题 */}
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-white to-blue-50">
                <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <div>几何证明助手</div>
                        <div className="text-sm font-normal text-blue-500 mt-1">帮助小朋友理解三角形证明</div>
                    </div>
                </h2>
                <p className="text-sm text-slate-600 mt-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                    📝 使用 <span className="font-bold text-green-600">"因为..."</span> 和 <span className="font-bold text-red-600">"所以..."</span> 格式编写证明步骤，让逻辑更清晰！
                </p>
            </div>

            {/* AI助手 */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-purple-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                            </svg>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-700">AI小助手</div>
                            <div className="text-xs text-slate-500">帮你生成几何问题</div>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl transition disabled:opacity-50 flex items-center gap-2 shadow-sm hover:shadow"
                        title="AI生成问题"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        <span className="text-sm text-white font-semibold">AI生成</span>
                    </button>
                </div>
                <input
                    type="password"
                    placeholder="DeepSeek API密钥 (可选，没有密钥也能用)"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    没有API密钥也能使用示例证明
                </div>
            </div>

            {/* 证明步骤 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="p-5 bg-white rounded-2xl border border-blue-100 shadow-sm hover:shadow transition-shadow">
                    <div className="text-xs text-blue-600 font-semibold mb-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center font-bold">1</div>
                        <div>步骤 1 - 已知条件</div>
                    </div>
                    <div className="text-sm text-slate-700 pl-11">
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">因为</span> 
                        <span className="ml-2">△ABC 是直角三角形</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 pl-11 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                        </svg>
                        这是题目给出的已知条件
                    </div>
                </div>

                <div className="p-5 bg-gradient-to-r from-white to-blue-50 rounded-2xl border border-blue-200 shadow-sm hover:shadow transition-shadow border-l-4 border-l-blue-400">
                    <div className="text-xs text-blue-600 font-semibold mb-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-white">2</div>
                        <div>步骤 2 - 垂直关系</div>
                    </div>
                    <div className="text-sm text-slate-700 pl-11">
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">因为</span> 
                        <span className="ml-2">AB ⟂ BC (AB垂直于BC)</span>
                    </div>
                    <div className="text-sm text-amber-700 mt-3 pl-11">
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">所以</span> 
                        <span className="ml-2 font-bold">∠B = 90°</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 pl-11 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        垂直的两条边形成的角是直角
                    </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow transition-shadow">
                    <div className="text-xs text-blue-600 font-semibold mb-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center font-bold">3</div>
                        <div>步骤 3 - 内角和定理</div>
                    </div>
                    <div className="text-sm text-slate-700 pl-11">
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">因为</span> 
                        <span className="ml-2">三角形内角和为180°</span>
                    </div>
                    <div className="text-sm text-amber-700 mt-3 pl-11">
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">所以</span> 
                        <span className="ml-2 font-bold">∠A + ∠C = 90°</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 pl-11 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        180° - 90°(∠B) = 90°
                    </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow transition-shadow">
                    <div className="text-xs text-blue-600 font-semibold mb-3 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center font-bold">4</div>
                        <div>步骤 4 - 等腰关系</div>
                    </div>
                    <div className="text-sm text-slate-700 pl-11">
                        <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">因为</span> 
                        <span className="ml-2">∠A = ∠C (等腰直角三角形)</span>
                    </div>
                    <div className="text-sm text-amber-700 mt-3 pl-11">
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">所以</span> 
                        <span className="ml-2 font-bold">∠A = 45°, ∠C = 45°</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 pl-11 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        证明完成！两个锐角相等，各为45°
                    </div>
                </div>
            </div>

            {/* 添加步骤按钮 */}
            <div className="p-6 border-t border-slate-100 bg-gradient-to-r from-white to-blue-50">
                <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-2xl transition font-semibold flex items-center justify-center gap-3 shadow-md hover:shadow-lg">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </div>
                    <div className="text-white text-lg">添加我的证明步骤</div>
                </button>
                <div className="text-center text-xs text-slate-500 mt-3">
                    点击添加你自己的证明步骤，学习几何推理
                </div>
            </div>
        </div>
    );
};

export default ProofPanel;
