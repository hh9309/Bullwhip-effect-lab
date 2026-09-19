/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { simulateSystemDynamics } from "../../utils/simulation";
import { 
  GitFork, 
  RotateCw, 
  Layers, 
  Clock, 
  ShieldAlert, 
  Zap, 
  Activity 
} from "lucide-react";
import { SystemDynamicsAnimatedCurves } from "./SystemDynamicsAnimatedCurves";
import { SystemDynamicsFeedbackCanvas } from "./SystemDynamicsFeedbackCanvas";

export const SystemDynamicsModule: React.FC = () => {
  const [safetyMult, setSafetyMult] = useState<number>(1.2);
  const [prodDelay, setProdDelay] = useState<number>(4);
  const [infoDelay, setInfoDelay] = useState<number>(2);
  const [stepShock, setStepShock] = useState<number>(50);
  const [activeTab, setActiveTab] = useState<"canvas" | "curves" | "cld">("canvas");

  const sdData = simulateSystemDynamics({
    safetyStockMultiplier: safetyMult,
    productionDelay: prodDelay,
    orderInfoDelay: infoDelay,
    steps: 36,
    stepShockMagnitude: stepShock,
  });

  const handleUpdateParams = (params: {
    productionDelay?: number;
    orderInfoDelay?: number;
    safetyStockMultiplier?: number;
    stepShockMagnitude?: number;
  }) => {
    if (params.productionDelay !== undefined) setProdDelay(params.productionDelay);
    if (params.orderInfoDelay !== undefined) setInfoDelay(params.orderInfoDelay);
    if (params.safetyStockMultiplier !== undefined) setSafetyMult(params.safetyStockMultiplier);
    if (params.stepShockMagnitude !== undefined) setStepShock(params.stepShockMagnitude);
  };

  return (
    <div className="space-y-6">
      {/* 模块引言切片 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
                模块 06 · 动力学因果
              </span>
              <span className="text-xs text-stone-400 font-mono">System Dynamics & Stock-Flow Simulation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              系统动力学仿真：因果反馈回路与存量流量时延模拟
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-3xl">
              基于系统动力学（System Dynamics）建立多阶反馈环路，自由配置<strong className="text-stone-800">安全库存水位</strong>、<strong className="text-stone-800">生产物理延迟</strong>与<strong className="text-stone-800">信息确认时延</strong>，对复杂供需长链条的因果滞后震荡进行深层模拟。
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-medium shrink-0 flex-wrap">
            <button
              id="tab-canvas-btn"
              onClick={() => setActiveTab("canvas")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "canvas" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              反馈回路粒子流 (Canvas)
            </button>
            <button
              id="tab-curves-btn"
              onClick={() => setActiveTab("curves")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "curves" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              动力学时序曲线
            </button>
            <button
              id="tab-cld-btn"
              onClick={() => setActiveTab("cld")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === "cld" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              因果回路图 (CLD)
            </button>
          </div>
        </div>

        {/* 动力学参数配置面板切片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* 安全库存倍率 */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-stone-500" />
                安全库存倍率 (Safety Stock)
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-stone-200">
                {safetyMult}x
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.5}
              step={0.1}
              value={safetyMult}
              onChange={(e) => setSafetyMult(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>0.5x (精益紧凑)</span>
              <span>2.5x (厚重冗余)</span>
            </div>
          </div>

          {/* 生产交付延迟 */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                生产物理延迟 (Production Delay)
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-stone-200">
                {prodDelay} 周
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={prodDelay}
              onChange={(e) => setProdDelay(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>1 周 (敏捷柔性)</span>
              <span>8 周 (漫长总装)</span>
            </div>
          </div>

          {/* 信息传递时延 */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <GitFork className="w-3.5 h-3.5 text-stone-500" />
                信息处理时延 (Info Delay)
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-stone-200">
                {infoDelay} 周
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={infoDelay}
              onChange={(e) => setInfoDelay(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>1 周 (即时确认)</span>
              <span>5 周 (层级审批)</span>
            </div>
          </div>

          {/* 需求阶跃幅度 */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-stone-500" />
                t=6 阶跃冲击强度 (Step Shock)
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-stone-200">
                +{stepShock}%
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              step={10}
              value={stepShock}
              onChange={(e) => setStepShock(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>+20% (温和阶跃)</span>
              <span>+100% (翻倍冲击)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 动力学主视窗 */}
      {activeTab === "canvas" ? (
        <SystemDynamicsFeedbackCanvas
          productionDelay={prodDelay}
          orderInfoDelay={infoDelay}
          safetyStockMultiplier={safetyMult}
          stepShockMagnitude={stepShock}
          onUpdateParams={handleUpdateParams}
        />
      ) : activeTab === "curves" ? (
        <SystemDynamicsAnimatedCurves
          sdData={sdData}
          productionDelay={prodDelay}
          orderInfoDelay={infoDelay}
          safetyStockMultiplier={safetyMult}
          stepShockMagnitude={stepShock}
        />
      ) : (
        /* 因果回路图 (CLD) 结构切片 */
        <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                系统动力学因果回路结构 (Causal Loop Diagram)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                正反馈强化环 (R) 与负反馈平衡调节环 (B) 在长时延下的动力学失衡机理
              </p>
            </div>
            <button
              onClick={() => setActiveTab("canvas")}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>查看 Canvas 粒子流动仿真</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 负反馈调节环 B1 */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">平衡调节环 B1 (库存缺口消除)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                  负反馈平衡环 (-)
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong className="text-stone-800">因果链条：</strong> 顾客需求增加 (+) ➔ 在库库存减少 (-) ➔ 库存缺口增大 (+) ➔ 补货订单增加 (+) ➔ [物理时延 L] ➔ 到货入库 (+) ➔ 库存缺口缩小 (-)。
              </p>
              <div className="text-[11px] text-teal-800 font-medium">
                若无时滞，此环路将实现系统的自我平稳平衡。在 Canvas 画布中表现为平稳均匀的蓝绿粒子流。
              </div>
            </div>

            {/* 强化过冲环 R1 */}
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-900">恐慌过冲环 R1 (时滞导致的恐慌倍增)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold">
                  正反馈强化环 (+)
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                <strong className="text-stone-800">因果链条：</strong> 时滞过长导致货物迟迟不到 (+) ➔ 决策者误判订单丢失 (+) ➔ 调高未来安全库存倍率 (+) ➔ 进一步超额下单 (+) ➔ 上游全负荷排产直至严重过剩。
              </p>
              <div className="text-[11px] text-red-800 font-medium">
                当生产时延 &gt; 3 周时，R1 环路会压倒 B1 环路，引发长周期毁灭性振荡，在 Canvas 画布中可观测到高密度的红色恐慌粒子喷涌。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
