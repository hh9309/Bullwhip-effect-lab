/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SimulationParameters } from "../../types";
import { simulateMultiEchelon } from "../../utils/simulation";
import { Check, Sliders, ShieldCheck } from "lucide-react";

interface DampingControlProps {
  params: SimulationParameters;
  onChangeParams: (updater: (prev: SimulationParameters) => SimulationParameters) => void;
}

export const DampingControlModule: React.FC<DampingControlProps> = ({
  params,
  onChangeParams,
}) => {
  const [viewMode, setViewMode] = useState<"side-by-side" | "overlay">("overlay");

  // 生成未受控基准仿真 (Baseline: 无 VMI, 无 CPFR, 无 POS)
  const baselineParams: SimulationParameters = {
    ...params,
    enableVMI: false,
    enableCPFR: false,
    enablePOSSharing: false,
  };
  const baselineResult = simulateMultiEchelon(baselineParams, 30);

  // 生成当前受控实验仿真 (Mitigated)
  const mitigatedResult = simulateMultiEchelon(params, 30);

  // 对比指标提取 (制造端 Manufacturer)
  const baseMfg = baselineResult.metrics.find((m) => m.key === "manufacturer")!;
  const mitMfg = mitigatedResult.metrics.find((m) => m.key === "manufacturer")!;

  const varianceReduction = baseMfg.orderVariance > 0
    ? Math.max(0, Math.round(((baseMfg.orderVariance - mitMfg.orderVariance) / baseMfg.orderVariance) * 100))
    : 0;

  const costSaving = baseMfg.holdingCost > 0
    ? Math.max(0, Math.round(((baseMfg.holdingCost - mitMfg.holdingCost) / baseMfg.holdingCost) * 100))
    : 0;

  // 生成 SVG 路径
  const baseMfgData = baselineResult.timeSeries.manufacturer;
  const mitMfgData = mitigatedResult.timeSeries.manufacturer;
  const termData = baselineResult.timeSeries.retailer;

  const width = 600;
  const height = 220;

  const generatePoints = (data: { order: number }[]) => {
    return data
      .map((d, idx) => {
        const x = 30 + (idx / 29) * (width - 50);
        // y: order 0 - 300 -> height 200 - 20
        const y = Math.max(20, Math.min(200, 200 - (d.order / 260) * 180));
        return `${x},${y}`;
      })
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* 模块引言切片 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
                模块 04 · 对策平抑
              </span>
              <span className="text-xs text-stone-400 font-mono">Damping Control & Variance Suppression</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              衰减控制演播：VMI、CPFR 与 POS 实时平抑
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-3xl">
              切换引入 <strong className="text-stone-800">VMI（供应商管理库存）</strong>、<strong className="text-stone-800">CPFR（协同预测补货）</strong> 及 <strong className="text-stone-800">POS 实时共享机制</strong>，以切片方式直观对比治理前后的供应链波幅收敛阻尼效果。
            </p>
          </div>

          {/* 策略平抑总成效切片 */}
          <div className="flex items-center gap-3 shrink-0 p-3 rounded-xl bg-teal-50/60 border border-teal-200">
            <ShieldCheck className="w-8 h-8 text-teal-700 shrink-0" />
            <div>
              <div className="text-[11px] text-teal-800 font-medium">制造端方差平抑率</div>
              <div className="text-xl font-mono font-bold text-teal-950">
                -{varianceReduction}%
              </div>
              <div className="text-[10px] text-teal-700 font-mono">
                BWE: {baseMfg.bwe}x ➔ {mitMfg.bwe}x
              </div>
            </div>
          </div>
        </div>

        {/* 三大对策切片开关卡片群 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {/* 对策 1: POS 实时共享 */}
          <div
            onClick={() =>
              onChangeParams((prev) => ({
                ...prev,
                enablePOSSharing: !prev.enablePOSSharing,
              }))
            }
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              params.enablePOSSharing
                ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                : "bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">1. POS 实时信息共享</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                  params.enablePOSSharing
                    ? "bg-teal-500 text-white"
                    : "border border-stone-300 bg-white"
                }`}
              >
                {params.enablePOSSharing && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
            <p className={`text-xs mt-2 leading-relaxed ${params.enablePOSSharing ? "text-stone-300" : "text-stone-500"}`}>
              终端收银台销售数据直接向制造端透传，消除中间多层级重复加权平滑导致的预测误差叠加。
            </p>
            <div className={`mt-2 text-[10px] font-mono ${params.enablePOSSharing ? "text-teal-400" : "text-stone-400"}`}>
              平抑目标：斩断预测更新（成因一）
            </div>
          </div>

          {/* 对策 2: VMI 供应商管理库存 */}
          <div
            onClick={() =>
              onChangeParams((prev) => ({
                ...prev,
                enableVMI: !prev.enableVMI,
              }))
            }
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              params.enableVMI
                ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                : "bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">2. VMI 供应商管理库存</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                  params.enableVMI
                    ? "bg-teal-500 text-white"
                    : "border border-stone-300 bg-white"
                }`}
              >
                {params.enableVMI && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
            <p className={`text-xs mt-2 leading-relaxed ${params.enableVMI ? "text-stone-300" : "text-stone-500"}`}>
              下游不再下达离散大单，由上游根据下游库存水位与生产节拍平滑补货，彻底消除批量订货脉冲。
            </p>
            <div className={`mt-2 text-[10px] font-mono ${params.enableVMI ? "text-teal-400" : "text-stone-400"}`}>
              平抑目标：抹平批量订货（成因二）
            </div>
          </div>

          {/* 对策 3: CPFR 协同预测与补货 */}
          <div
            onClick={() =>
              onChangeParams((prev) => ({
                ...prev,
                enableCPFR: !prev.enableCPFR,
              }))
            }
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              params.enableCPFR
                ? "bg-stone-900 text-white border-stone-900 shadow-xs"
                : "bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-stone-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">3. CPFR 协同预测与补货</span>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                  params.enableCPFR
                    ? "bg-teal-500 text-white"
                    : "border border-stone-300 bg-white"
                }`}
              >
                {params.enableCPFR && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
            <p className={`text-xs mt-2 leading-relaxed ${params.enableCPFR ? "text-stone-300" : "text-stone-500"}`}>
              建立全网唯一可信事实源，采用不可撤销合同与历史真实分配机制，瓦解短缺博弈与虚假重复下单。
            </p>
            <div className={`mt-2 text-[10px] font-mono ${params.enableCPFR ? "text-teal-400" : "text-stone-400"}`}>
              平抑目标：瓦解短缺博弈（成因四）
            </div>
          </div>
        </div>
      </div>

      {/* A/B 策略切片对比图表 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-stone-900">
              制造端订单波动曲线对比 (Before vs After)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              实线为受控后波动轨迹，虚线为无治理状态下的剧烈震荡
            </p>
          </div>

          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode("overlay")}
              className={`px-2.5 py-1 rounded ${
                viewMode === "overlay" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-600"
              }`}
            >
              叠加视图 (Overlay)
            </button>
            <button
              onClick={() => setViewMode("side-by-side")}
              className={`px-2.5 py-1 rounded ${
                viewMode === "side-by-side" ? "bg-white text-stone-900 shadow-2xs" : "text-stone-600"
              }`}
            >
              分屏对照 (Side-by-Side)
            </button>
          </div>
        </div>

        {/* SVG 可视化对比曲线 */}
        <div className="border border-stone-100 rounded-xl bg-stone-50/50 p-3">
          <svg viewBox="0 0 620 240" className="w-full h-56 overflow-visible">
            {/* 网格线 */}
            <line x1="30" y1="20" x2="30" y2="200" stroke="#e5e5e5" strokeWidth="1" />
            <line x1="30" y1="200" x2="600" y2="200" stroke="#e5e5e5" strokeWidth="1" />

            <text x="30" y="14" fill="#a8a29e" fontSize="9" textAnchor="middle">订单量 (Units)</text>
            <text x="600" y="215" fill="#a8a29e" fontSize="9" textAnchor="end">周期 (t)</text>

            <text x="25" y="204" fill="#a8a29e" fontSize="9" textAnchor="end">0</text>
            <text x="25" y="130" fill="#a8a29e" fontSize="9" textAnchor="end">100</text>
            <text x="25" y="60" fill="#a8a29e" fontSize="9" textAnchor="end">200</text>

            {/* 终端真实需求基线 (浅灰色) */}
            <polyline
              fill="none"
              stroke="#a8a29e"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              points={generatePoints(termData)}
            />

            {/* 曲线 A: 未治理状态 (红色虚线海啸) */}
            <polyline
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="4 2"
              points={generatePoints(baseMfgData)}
            />

            {/* 曲线 B: 协同平抑状态 (绿色粗实线) */}
            <polyline
              fill="none"
              stroke="#0d9488"
              strokeWidth="2.5"
              points={generatePoints(mitMfgData)}
            />
          </svg>

          {/* 图例 */}
          <div className="flex flex-wrap items-center justify-between text-xs text-stone-600 pt-3 border-t border-stone-200/60 mt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-stone-400 inline-block border-dashed" /> 终端实际需求
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-red-500 inline-block border-dashed" /> 传统未治理状态 (海啸震荡)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-teal-800">
                <span className="w-3 h-0.5 bg-teal-600 inline-block" /> 协同平抑状态 (稳定平滑)
              </span>
            </div>
            <span className="text-[11px] font-mono text-stone-500">
              数据采集自 30 周期多级级联仿真
            </span>
          </div>
        </div>

        {/* 策略平抑综合收益多维切片卡 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-xs text-stone-500">制造端订单方差</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-bold text-stone-800">
                {mitMfg.orderVariance.toFixed(0)}
              </span>
              <span className="text-xs text-stone-400 line-through">
                {baseMfg.orderVariance.toFixed(0)}
              </span>
            </div>
            <div className="text-[11px] text-teal-700 font-semibold mt-1">
              方差压制 -{varianceReduction}%
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-xs text-stone-500">平均库存持有成本</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-bold text-stone-800">
                ¥{mitMfg.holdingCost}
              </span>
              <span className="text-xs text-stone-400 line-through">
                ¥{baseMfg.holdingCost}
              </span>
            </div>
            <div className="text-[11px] text-teal-700 font-semibold mt-1">
              成本节省 -{costSaving}%
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-xs text-stone-500">全流程现货满足率</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-mono font-bold text-stone-800">
                {mitMfg.serviceLevel}%
              </span>
              <span className="text-xs text-stone-400">
                (传统基准 {baseMfg.serviceLevel}%)
              </span>
            </div>
            <div className="text-[11px] text-teal-700 font-semibold mt-1">
              缺货风险显著清零
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
