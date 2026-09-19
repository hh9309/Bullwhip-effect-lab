/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  ReferenceLine,
  AreaChart,
  Area
} from "recharts";
import { 
  Gauge, 
  Activity, 
  TrendingUp, 
  AlertCircle, 
  Layers, 
  Zap, 
  BarChart2, 
  Eye, 
  EyeOff,
  Radio
} from "lucide-react";
import { EchelonKey, EchelonTimeData, EchelonMetrics, EchelonConfig } from "../../types";
import { ECHELONS } from "../../utils/constants";

interface OrderVelocityDashboardProps {
  timeSeries: Record<EchelonKey, EchelonTimeData[]>;
  metrics: EchelonMetrics[];
  currentStep: number;
  baseDemandMean: number;
}

// 订货流速指标定义
interface EchelonVelocityStats {
  key: EchelonKey;
  name: string;
  color: string;
  currentOrder: number;
  currentVelocity: number;      // 实时流速: 环比变化率 dO/dt (%)
  volatilityRate: number;       // 波动率 (方差/均值 或 变异系数 CV %)
  accel: number;                // 订单加速度 d²O/dt²
  bwe: number;
  status: "smooth" | "moderate" | "turbulent" | "severe";
}

export const OrderVelocityDashboard: React.FC<OrderVelocityDashboardProps> = ({
  timeSeries,
  metrics,
  currentStep,
  baseDemandMean,
}) => {
  // 节点可见性筛选
  const [visibleEchelons, setVisibleEchelons] = useState<Record<EchelonKey, boolean>>({
    retailer: true,
    wholesaler: true,
    distributor: true,
    manufacturer: true,
    supplier: true,
  });

  // 显示模式：波动率趋势 vs 实时订货量流速
  const [metricMode, setMetricMode] = useState<"volatility" | "orderRate">("volatility");
  // 窗口范围：到当前时步截止 (动态跟随) vs 全时程全景对比
  const [windowRange, setWindowRange] = useState<"follow" | "full">("follow");

  // 节点配置与颜色字典
  const echelonConfigMap = useMemo(() => {
    const map = new Map<EchelonKey, { name: string; color: string }>();
    (ECHELONS as EchelonConfig[]).forEach((e: EchelonConfig) => {
      map.set(e.key, { name: e.name, color: e.color });
    });
    return map;
  }, []);

  // 1. 构建时序波动率与流速数据表
  // 波动率算法：以滑动窗口计算当期滚动变异系数 (CV = 局部标准差 / 局部均值 * 100%)
  // 以及即时流速 (环比变动绝对比率 % 与相对基准的偏离)
  const chartData = useMemo(() => {
    const maxSteps = 32;
    const endStep = windowRange === "follow" ? Math.max(3, currentStep + 1) : maxSteps;
    const result = [];

    const keys: EchelonKey[] = ["retailer", "wholesaler", "distributor", "manufacturer", "supplier"];

    for (let t = 0; t < endStep; t++) {
      const row: Record<string, any> = {
        step: `t=${t}`,
        stepNum: t,
      };

      keys.forEach((key) => {
        const series = timeSeries[key] || [];
        const currentData = series[t];
        const prevData = series[Math.max(0, t - 1)];
        const prev2Data = series[Math.max(0, t - 2)];

        const orderVal = currentData?.order ?? baseDemandMean;
        const prevOrderVal = prevData?.order ?? baseDemandMean;
        const prev2OrderVal = prev2Data?.order ?? baseDemandMean;

        // 实时订单流速 (阶数导数近似: (O_t - O_{t-1}) / 周期)
        const orderVelocity = orderVal - prevOrderVal;
        // 订单相对流速变化率 %
        const velocityRate = prevOrderVal > 0 ? ((orderVal - prevOrderVal) / prevOrderVal) * 100 : 0;

        // 局部滚动窗口统计波动率 (计算 t 前后各 2 期的局部标准差)
        const windowStart = Math.max(0, t - 2);
        const windowEnd = Math.min(series.length - 1, t + 1);
        const windowVals = series.slice(windowStart, windowEnd + 1).map((s) => s.order);
        const winMean = windowVals.reduce((a, b) => a + b, 0) / (windowVals.length || 1);
        const winVar = windowVals.reduce((a, b) => a + Math.pow(b - winMean, 2), 0) / (windowVals.length > 1 ? windowVals.length - 1 : 1);
        const winStd = Math.sqrt(winVar);
        // 局部波动率：CV% = (局部标准差 / 基础均值) * 100
        const volatilityCV = Number(((winStd / (baseDemandMean || 100)) * 100).toFixed(1));

        row[`${key}_order`] = orderVal;
        row[`${key}_velocity`] = Number(orderVelocity.toFixed(1));
        row[`${key}_volatility`] = volatilityCV;
      });

      result.push(row);
    }

    return result;
  }, [timeSeries, currentStep, windowRange, baseDemandMean]);

  // 2. 当前时步 (currentStep) 下各个节点的流速仪表状态
  const liveStats: EchelonVelocityStats[] = useMemo(() => {
    const keys: EchelonKey[] = ["retailer", "wholesaler", "distributor", "manufacturer", "supplier"];

    return keys.map((key) => {
      const cfg = echelonConfigMap.get(key)!;
      const series = timeSeries[key] || [];
      const cur = series[currentStep] || series[0] || { order: baseDemandMean };
      const prev = series[Math.max(0, currentStep - 1)] || cur;
      const prev2 = series[Math.max(0, currentStep - 2)] || prev;

      const orderVal = cur.order;
      const prevOrder = prev.order;
      const prev2Order = prev2.order;

      // 实时流速 dO/dt
      const velocity = orderVal - prevOrder;
      // 订单加速度 d²O/dt² = (O_t - O_{t-1}) - (O_{t-1} - O_{t-2})
      const accel = (orderVal - prevOrder) - (prevOrder - prev2Order);

      // 整体波动率指标 (来自仿真统计 metrics)
      const metric = metrics.find((m) => m.key === key);
      const bwe = metric?.bwe ?? 1;
      const orderVar = metric?.orderVariance ?? 0;
      const volRate = Math.sqrt(orderVar) / (baseDemandMean || 100);

      let status: EchelonVelocityStats["status"] = "smooth";
      if (bwe > 3.5 || Math.abs(velocity) > 40) status = "severe";
      else if (bwe > 2.0 || Math.abs(velocity) > 20) status = "turbulent";
      else if (bwe > 1.3 || Math.abs(velocity) > 10) status = "moderate";

      return {
        key,
        name: cfg.name,
        color: cfg.color,
        currentOrder: orderVal,
        currentVelocity: velocity,
        volatilityRate: Number((volRate * 100).toFixed(1)),
        accel,
        bwe,
        status,
      };
    });
  }, [timeSeries, currentStep, metrics, baseDemandMean, echelonConfigMap]);

  // 切换节点曲线显隐
  const toggleEchelon = (key: EchelonKey) => {
    setVisibleEchelons((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-6">
      {/* 顶部标题与控制栏 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100 flex items-center gap-1">
              <Gauge className="w-3 h-3" />
              <span>实时流速仪表盘</span>
            </span>
            <span className="text-xs text-stone-400 font-mono">
              Live Order Velocity & Volatility Dashboard
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <span>供应链各级订货量波动率与瞬时流速动态监测</span>
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              当前时步 t = {currentStep}
            </span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            基于 Recharts 引擎实时解构各节点订单波动的变化率（一阶导流速与二阶加速度），直观透视牛鞭波前在上下游间的陡峭扩散。
          </p>
        </div>

        {/* 仪表盘控制工具条 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 指标模式切换 */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 text-xs">
            <button
              onClick={() => setMetricMode("volatility")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                metricMode === "volatility"
                  ? "bg-white text-stone-900 shadow-2xs font-semibold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
              <span>局部波动率曲线 (CV%)</span>
            </button>
            <button
              onClick={() => setMetricMode("orderRate")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                metricMode === "orderRate"
                  ? "bg-white text-stone-900 shadow-2xs font-semibold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              <span>瞬时订货量流速 (O_t)</span>
            </button>
          </div>

          {/* 时间跟随模式切换 */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 text-xs font-mono">
            <button
              onClick={() => setWindowRange("follow")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                windowRange === "follow"
                  ? "bg-white text-stone-900 shadow-2xs font-semibold"
                  : "text-stone-500 hover:text-stone-800"
              }`}
              title="图表动态截取至当前播放时钟 step"
            >
              实时跟踪 (0~t)
            </button>
            <button
              onClick={() => setWindowRange("full")}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                windowRange === "full"
                  ? "bg-white text-stone-900 shadow-2xs font-semibold"
                  : "text-stone-500 hover:text-stone-800"
              }`}
              title="展示全部 32 期的完整全景数据"
            >
              全周期 (0~31)
            </button>
          </div>
        </div>
      </div>

      {/* 4 大核心关键节点实时表盘磁贴（供应商、分销商、批发商、零售商） */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {liveStats.map((stat) => {
          const isVisible = visibleEchelons[stat.key];
          const isCurrentSurging = Math.abs(stat.currentVelocity) > 15;

          return (
            <div
              key={stat.key}
              onClick={() => toggleEchelon(stat.key)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative select-none ${
                isVisible
                  ? "bg-white border-stone-200 shadow-2xs hover:border-stone-400"
                  : "bg-stone-50/50 border-stone-200 opacity-60 hover:opacity-80"
              }`}
            >
              {/* 顶部标签 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-xs font-bold text-stone-800 truncate">
                    {stat.name}
                  </span>
                </div>
                <button
                  className="text-stone-400 hover:text-stone-600 p-0.5"
                  title={isVisible ? "点击隐藏曲线" : "点击显示曲线"}
                >
                  {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-stone-300" />}
                </button>
              </div>

              {/* 核心数值：当前订货量与流速 */}
              <div className="mt-2 flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-mono font-bold text-stone-900">
                    {stat.currentOrder}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono ml-1">件</span>
                </div>
                <div className="flex items-center text-xs font-mono font-semibold">
                  <span
                    className={`${
                      stat.currentVelocity > 0
                        ? "text-rose-700"
                        : stat.currentVelocity < 0
                        ? "text-sky-700"
                        : "text-stone-400"
                    }`}
                  >
                    {stat.currentVelocity > 0 ? `+${stat.currentVelocity}` : stat.currentVelocity}
                  </span>
                  <span className="text-[9px] text-stone-400 ml-0.5">/期</span>
                </div>
              </div>

              {/* 波动率与放大倍数 */}
              <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] font-mono">
                <span className="text-stone-400 text-[10px]">波动率:</span>
                <span className="font-semibold text-stone-700">
                  {stat.volatilityRate}%
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                <span className="text-stone-400 text-[10px]">BWE:</span>
                <span
                  className={`font-bold ${
                    stat.bwe > 3.0
                      ? "text-red-700"
                      : stat.bwe > 1.8
                      ? "text-amber-700"
                      : "text-teal-700"
                  }`}
                >
                  {stat.bwe}x
                </span>
              </div>

              {/* 状态轻提示 */}
              {isCurrentSurging && isVisible && (
                <div className="absolute top-2 right-6 px-1 py-0.2 rounded bg-rose-50 border border-rose-200 text-[9px] font-mono text-rose-700 font-bold">
                  突变冲刷
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recharts 动态折线图容器 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
          <span className="flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-stone-600" />
            <span>
              {metricMode === "volatility"
                ? "【波动率监测视图】各节点滚动变异系数 CV(t)% 曲线演变（越向上游越陡峭）"
                : "【流速量值监测视图】各节点实时发出订单量 O_t (件) 绝对轨迹"}
            </span>
          </span>
          <span className="text-stone-400 text-[11px] hidden sm:inline">
            基准需求均值 μ = {baseDemandMean}
          </span>
        </div>

        <div className="h-72 w-full p-2 rounded-xl bg-stone-50/70 border border-stone-200">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis 
                dataKey="step" 
                tick={{ fontSize: 10, fill: "#78716c" }}
                stroke="#d6d3d1"
              />
              <YAxis 
                tick={{ fontSize: 10, fill: "#78716c" }}
                stroke="#d6d3d1"
                unit={metricMode === "volatility" ? "%" : ""}
                domain={metricMode === "volatility" ? [0, "auto"] : [0, "auto"]}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="p-2.5 rounded-lg bg-stone-900 text-stone-100 text-xs shadow-lg space-y-1.5 max-w-[200px]">
                      <div className="font-mono font-bold text-stone-300 border-b border-stone-800 pb-1 flex justify-between">
                        <span>时步 {label}</span>
                        <span className="text-amber-400 text-[10px]">
                          {metricMode === "volatility" ? "波动率 CV%" : "订货流速"}
                        </span>
                      </div>
                      <div className="space-y-1 font-mono text-[11px]">
                        {payload.map((entry: any) => {
                          const config = echelonConfigMap.get(entry.dataKey.split("_")[0] as EchelonKey);
                          return (
                            <div key={entry.dataKey} className="flex items-center justify-between gap-2">
                              <span className="flex items-center gap-1 text-stone-300">
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: entry.stroke }}
                                />
                                <span>{config?.name.slice(0, 3)}</span>
                              </span>
                              <span className="font-bold text-white">
                                {entry.value}
                                {metricMode === "volatility" ? "%" : " 件"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />

              {/* 基准参考水平线 */}
              {metricMode === "orderRate" && (
                <ReferenceLine 
                  y={baseDemandMean} 
                  stroke="#a8a29e" 
                  strokeDasharray="4 4" 
                  label={{ value: `基准需求 ${baseDemandMean}`, fill: "#78716c", fontSize: 10, position: "insideTopRight" }} 
                />
              )}

              {/* 当前播放时间步游标垂线 */}
              <ReferenceLine 
                x={`t=${currentStep}`} 
                stroke="#1c1917" 
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{ value: `当前 t=${currentStep}`, fill: "#1c1917", fontSize: 10, position: "insideTopLeft" }}
              />

              {/* 零售商曲线 */}
              {visibleEchelons.retailer && (
                <Line
                  type="monotone"
                  dataKey={metricMode === "volatility" ? "retailer_volatility" : "retailer_order"}
                  name="零售商"
                  stroke="#0f766e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}

              {/* 批发商曲线 */}
              {visibleEchelons.wholesaler && (
                <Line
                  type="monotone"
                  dataKey={metricMode === "volatility" ? "wholesaler_volatility" : "wholesaler_order"}
                  name="批发商"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}

              {/* 分销商曲线 */}
              {visibleEchelons.distributor && (
                <Line
                  type="monotone"
                  dataKey={metricMode === "volatility" ? "distributor_volatility" : "distributor_order"}
                  name="分销商"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}

              {/* 制造工厂曲线 */}
              {visibleEchelons.manufacturer && (
                <Line
                  type="monotone"
                  dataKey={metricMode === "volatility" ? "manufacturer_volatility" : "manufacturer_order"}
                  name="制造工厂"
                  stroke="#b45309"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              )}

              {/* 原材料供应商曲线 */}
              {visibleEchelons.supplier && (
                <Line
                  type="monotone"
                  dataKey={metricMode === "volatility" ? "supplier_volatility" : "supplier_order"}
                  name="供应商"
                  stroke="#b91c1c"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 底部解读提示切片 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>流速态势研判：</strong>
              越靠近源头（红色的供应商与金褐色的制造厂），订单曲线由于提前期时滞放大与批量聚集，呈现更剧烈的瞬时跃升与垂直回落。
            </span>
          </div>
          <span className="font-mono text-[11px] text-amber-800 shrink-0">
            点击上方节点卡片可即时隔离对比
          </span>
        </div>
      </div>
    </div>
  );
};
