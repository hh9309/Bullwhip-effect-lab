/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { EchelonKey, SimulationParameters, EchelonTimeData, EchelonMetrics } from "../../types";
import { ECHELONS } from "../../utils/constants";
import { 
  X, 
  Package, 
  Truck, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";

interface EchelonSnapshotModalProps {
  echelonKey: EchelonKey;
  currentStep: number;
  totalSteps: number;
  timeSeries: Record<EchelonKey, EchelonTimeData[]>;
  metrics: EchelonMetrics[];
  params: SimulationParameters;
  onClose: () => void;
  onStepChange?: (newStep: number) => void;
  onSelectEchelon?: (key: EchelonKey) => void;
}

// 标准正态分布累积分布函数 Φ(z)
function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * absZ);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ);

  return 0.5 * (1.0 + sign * y);
}

export const EchelonSnapshotModal: React.FC<EchelonSnapshotModalProps> = ({
  echelonKey,
  currentStep,
  totalSteps,
  timeSeries,
  metrics,
  params,
  onClose,
  onStepChange,
  onSelectEchelon,
}) => {
  const echConfig = ECHELONS.find((e) => e.key === echelonKey) || ECHELONS[0];
  const echMetric = metrics.find((m) => m.key === echelonKey);
  const dataList = timeSeries[echelonKey] || [];
  const currentData: EchelonTimeData = dataList[currentStep] || dataList[0] || {
    time: currentStep,
    demand: params.demandMean,
    order: params.demandMean,
    inventory: params.demandMean * 2,
    backlog: 0,
    pipeline: params.demandMean * params.leadTime,
  };

  // 运筹学缺货概率数学计算：
  // 设当期可用总供给为当前在手库存 Inventory，面临需求分布期望为 D_t，标准差为 sigma_D
  // 缺货概率 P(Stockout) = P(Demand > Inventory)
  const currentDemand = Math.max(1, currentData.demand);
  const onHandInventory = Math.max(0, currentData.inventory);
  const currentBacklog = currentData.backlog || 0;

  let stockoutProb = 0; // 0% ~ 100%
  let zScore = 0;
  const sigmaD = Math.max(2, currentDemand * (params.demandVolatility / 100) * Math.sqrt(Math.max(1, params.leadTime)));

  if (onHandInventory <= 0 || currentBacklog > 0) {
    // 已经处于断货或缺货积压状态
    stockoutProb = 100;
    zScore = -3.5;
  } else {
    // 正常计算需求超出库存的右尾概率
    zScore = (onHandInventory - currentDemand) / sigmaD;
    const cdf = normalCDF(zScore);
    stockoutProb = Math.min(100, Math.max(0, Number(((1 - cdf) * 100).toFixed(1))));
  }

  // 缺货等级状态
  let stockoutRiskLevel: { label: string; color: string; badgeBg: string; textClass: string };
  if (stockoutProb >= 70) {
    stockoutRiskLevel = {
      label: "极度高危断货",
      color: "#ef4444",
      badgeBg: "bg-rose-100 text-rose-800 border-rose-200",
      textClass: "text-rose-600",
    };
  } else if (stockoutProb >= 30) {
    stockoutRiskLevel = {
      label: "警戒断货风险",
      color: "#f59e0b",
      badgeBg: "bg-amber-100 text-amber-800 border-amber-200",
      textClass: "text-amber-600",
    };
  } else if (stockoutProb >= 8) {
    stockoutRiskLevel = {
      label: "轻度偏紧",
      color: "#3b82f6",
      badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
      textClass: "text-blue-600",
    };
  } else {
    stockoutRiskLevel = {
      label: "充盈安全稳定",
      color: "#10b981",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
      textClass: "text-emerald-600",
    };
  }

  // 安全库存基准标线 S*
  const safeStockBaseline = Math.round(1.65 * sigmaD);
  const targetStockLevel = Math.round((params.leadTime + 1) * currentDemand + safeStockBaseline);
  const inventoryHealthPct = Math.round((onHandInventory / Math.max(1, safeStockBaseline)) * 100);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xl space-y-5 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部彩色层级标识与操作栏 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
              style={{ backgroundColor: echConfig.color }}
            >
              {echConfig.key.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                  节点瞬时状态快照 · Snapshot
                </span>
                <span 
                  className="w-2.5 h-2.5 rounded-full animate-pulse"
                  style={{ backgroundColor: echConfig.color }}
                />
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5 flex items-center gap-2">
                <span>{echConfig.name}</span>
                <span className="text-xs font-normal text-stone-400 font-mono">
                  ({echConfig.role})
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* 时间步快切控制器 */}
            {onStepChange && (
              <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 px-1 py-0.5 text-xs font-mono">
                <button
                  onClick={() => onStepChange(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="上一时步"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold text-stone-800">
                  t = {currentStep} / {totalSteps - 1}
                </span>
                <button
                  onClick={() => onStepChange(Math.min(totalSteps - 1, currentStep + 1))}
                  disabled={currentStep >= totalSteps - 1}
                  className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  title="下一时步"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="关闭快照"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 节点快速切换 Tab 栏 (可选) */}
        {onSelectEchelon && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] text-stone-400 font-semibold shrink-0">切换节点:</span>
            {ECHELONS.map((e) => (
              <button
                key={e.key}
                onClick={() => onSelectEchelon(e.key)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 cursor-pointer ${
                  e.key === echelonKey
                    ? "bg-stone-900 text-white font-semibold shadow-2xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {e.name}
              </button>
            ))}
          </div>
        )}

        {/* 三大核心状态指标卡片 (瞬时库存水位、在途订单量、缺货概率) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. 瞬时库存水位 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-stone-500" />
                  瞬时在手库存水位
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-500">
                  On-Hand
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-serif font-bold text-stone-900">
                  {onHandInventory}
                </span>
                <span className="text-xs text-stone-500 font-medium">件</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-[11px] space-y-1">
              <div className="flex justify-between text-stone-500 font-mono">
                <span>安全库存基准 (SS):</span>
                <span className="font-semibold text-stone-700">{safeStockBaseline} 件</span>
              </div>
              <div className="flex justify-between text-stone-500 font-mono">
                <span>安全水位充盈度:</span>
                <span className={`font-bold ${inventoryHealthPct < 100 ? "text-amber-600" : "text-emerald-600"}`}>
                  {inventoryHealthPct}%
                </span>
              </div>
              {currentBacklog > 0 && (
                <div className="flex justify-between text-rose-600 font-mono font-bold">
                  <span>当前缺货积压:</span>
                  <span>{currentBacklog} 件</span>
                </div>
              )}
            </div>
          </div>

          {/* 2. 在途订单量 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-stone-500" />
                  在途订单量 (管道)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-500">
                  In-Transit
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-serif font-bold text-stone-900">
                  {currentData.pipeline}
                </span>
                <span className="text-xs text-stone-500 font-medium">件</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-[11px] space-y-1">
              <div className="flex justify-between text-stone-500 font-mono">
                <span>交付提前期 (L):</span>
                <span className="font-semibold text-stone-700">{params.leadTime} 期</span>
              </div>
              <div className="flex justify-between text-stone-500 font-mono">
                <span>当期新下达订单:</span>
                <span className="font-semibold text-stone-700">{currentData.order} 件</span>
              </div>
              <div className="flex justify-between text-stone-500 font-mono">
                <span>在途/在库比率:</span>
                <span className="font-semibold text-stone-700">
                  {onHandInventory > 0 ? (currentData.pipeline / onHandInventory).toFixed(1) : "∞"}x
                </span>
              </div>
            </div>
          </div>

          {/* 3. 缺货概率 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-stone-500" />
                  瞬时缺货概率
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${stockoutRiskLevel.badgeBg}`}>
                  {stockoutRiskLevel.label}
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className={`text-2xl font-serif font-bold ${stockoutRiskLevel.textClass}`}>
                  {stockoutProb}%
                </span>
                <span className="text-xs text-stone-400 font-mono">P(D &gt; I)</span>
              </div>
            </div>

            {/* 概率可视化进度条 */}
            <div className="mt-3 pt-2.5 border-t border-stone-200/60 text-[11px] space-y-1.5">
              <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300 rounded-full"
                  style={{ 
                    width: `${stockoutProb}%`,
                    backgroundColor: stockoutRiskLevel.color 
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>0% (完全脱险)</span>
                <span>z = {zScore.toFixed(2)}</span>
                <span>100% (严重断货)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 瞬时运筹流转与供需明细 */}
        <div className="p-3.5 rounded-xl border border-stone-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-stone-500" />
              当前时间步 (t={currentStep}) 瞬时供需流动对齐
            </span>
            <span className="text-[11px] font-mono text-stone-400">
              Echelon Order-Inventory Ledger
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-center">
              <div className="text-[10px] text-stone-400">本期输入需求 (Demand)</div>
              <div className="text-sm font-mono font-bold text-stone-800 mt-0.5">
                {currentData.demand} 件
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-center">
              <div className="text-[10px] text-stone-400">本期发出订货 (Order)</div>
              <div className="text-sm font-mono font-bold text-stone-800 mt-0.5">
                {currentData.order} 件
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-center">
              <div className="text-[10px] text-stone-400">全周期订单放大 (BWE)</div>
              <div className="text-sm font-mono font-bold text-stone-800 mt-0.5">
                {echMetric?.bwe ?? 1.0}x
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 text-center">
              <div className="text-[10px] text-stone-400">全周期履约服务水平</div>
              <div className="text-sm font-mono font-bold text-emerald-700 mt-0.5">
                {echMetric?.serviceLevel ?? 100}%
              </div>
            </div>
          </div>
        </div>

        {/* 动态运筹机理解析与调度建议 */}
        <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-stone-800">
            <Info className="w-3.5 h-3.5 text-stone-500" />
            <span>动力学状态机理解读与调度启示</span>
          </div>
          <p className="text-stone-600 leading-relaxed text-[11px]">
            {stockoutProb >= 50 ? (
              <>
                <strong className="text-rose-700">⚠️ 警戒态：</strong> 当前在手库存 ({onHandInventory} 件) 严重落后于安全需求基线，缺货概率达 {stockoutProb}%。决策者极易因断货恐慌而调高安全库存倍率并下达加倍订单，若此时在途管道中已有 {currentData.pipeline} 件货物陆续运送，盲目追单将在提前期过后引发剧烈库存海啸。
              </>
            ) : currentData.pipeline > onHandInventory * 2 ? (
              <>
                <strong className="text-amber-700">🚢 管道积压警惕：</strong> 在途订单量 ({currentData.pipeline} 件) 显著超越在手库存 ({onHandInventory} 件)。提前期 L={params.leadTime} 期导致物料延迟到达，未来数期入库将大幅拉升在手存量，建议锁定订货节奏避免“过度订货-过剩爆仓”的牛鞭超调。
              </>
            ) : (
              <>
                <strong className="text-emerald-700">✅ 稳态受控：</strong> 在手库存水位充盈，缺货概率仅为 {stockoutProb}%，供需传导相对平衡。建议维持平稳的移动平均预测，规避批量订货与恐慌夸大。
              </>
            )}
          </p>
        </div>

        {/* 底部关闭与提示 */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-stone-400">
          <span>提示：点击遮罩背景或右上角按钮可关闭状态快照</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-stone-900 text-stone-100 text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
