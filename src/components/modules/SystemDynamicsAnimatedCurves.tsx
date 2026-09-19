/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { SystemDynamicsState } from "../../types";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  Layers, 
  Clock, 
  Activity, 
  ShieldAlert,
  Sliders,
  ChevronRight,
  Info
} from "lucide-react";

interface Props {
  sdData: SystemDynamicsState[];
  productionDelay: number;
  orderInfoDelay: number;
  safetyStockMultiplier: number;
  stepShockMagnitude: number;
}

export const SystemDynamicsAnimatedCurves: React.FC<Props> = ({
  sdData,
  productionDelay,
  orderInfoDelay,
  safetyStockMultiplier,
  stepShockMagnitude,
}) => {
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playSpeed, setPlaySpeed] = useState<number>(1);
  const [visibleLines, setVisibleLines] = useState<{
    demand: boolean;
    retailer: boolean;
    wholesaler: boolean;
    production: boolean;
    inventory: boolean;
  }>({
    demand: true,
    retailer: true,
    wholesaler: true,
    production: true,
    inventory: true,
  });

  const totalWeeks = sdData.length > 0 ? sdData.length - 1 : 36;

  // 定时推进当前仿真周数
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = Math.max(120, 600 / playSpeed);
    const timer = setInterval(() => {
      setCurrentWeek((prev) => {
        if (prev >= totalWeeks) {
          // 循环播放或停留在终点
          return 0;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, totalWeeks]);

  // 获取当前周的状态数据
  const currentState = useMemo(() => {
    if (!sdData || sdData.length === 0) return null;
    const clampedWeek = Math.min(currentWeek, sdData.length - 1);
    return sdData[clampedWeek] || sdData[0];
  }, [sdData, currentWeek]);

  // 计算当前周的系统动力学特征与诊断
  const phaseInfo = useMemo(() => {
    const t = currentWeek;
    if (t < 6) {
      return {
        name: "基线平稳平衡期",
        phase: "Phase 1: Steady Equilibrium",
        badgeColor: "bg-stone-100 text-stone-700 border-stone-300",
        description: "外部需求稳定在 20 单位，各级维持常量安全库存与平稳补货，供应链处于静态低熵运行状态。",
        dominantLoop: "平衡调节环 B1 (系统自稳定中)",
        loopType: "balancing",
      };
    } else if (t === 6) {
      return {
        name: "⚡ 外部需求阶跃冲击",
        phase: "Phase 2: External Step Shock",
        badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
        description: `终端需求发生阶跃上升 +${stepShockMagnitude}% (由 20 跃增至 ${currentState?.customerDemand || 30})，稳态被瞬间打破！`,
        dominantLoop: "外部阶跃激励输入",
        loopType: "shock",
      };
    } else if (t <= 11) {
      return {
        name: "时滞盲区与恐慌倍增",
        phase: "Phase 3: Lag Blindspot & Panic",
        badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
        description: `生产物理时延 L=${productionDelay} 周导致货物无法即时下线，可用库存持续暴跌，各级为自保大幅调高安全库存预估！`,
        dominantLoop: "正反馈恐慌强化环 R1 (主导失衡)",
        loopType: "reinforcing",
      };
    } else if (t <= 18) {
      return {
        name: "💥 制造排产过冲峰值",
        phase: "Phase 4: Whiplash Production Crest",
        badgeColor: "bg-red-100 text-red-900 border-red-300",
        description: "层层放大的虚假在途需求涌入制造端，工厂排产攀升至极限峰值，呈现出典型的牛鞭效应剧烈过冲！",
        dominantLoop: "多阶时滞累积过冲 (3阶微分振荡极值)",
        loopType: "peak",
      };
    } else if (t <= 26) {
      return {
        name: "🛑 在途洪水涌入与断崖砍单",
        phase: "Phase 5: Inventory Deluge & Order Collapse",
        badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
        description: "前期积压的大量在制品 (WIP) 集中完工入库，库存急剧爆仓，而各级订单出现‘断崖式归零’！",
        dominantLoop: "反向负反馈过矫正 (库存过剩吞噬订单)",
        loopType: "glut",
      };
    } else {
      return {
        name: "🔄 次级阻尼衰减震荡",
        phase: "Phase 6: Damped Secondary Wave",
        badgeColor: "bg-teal-100 text-teal-900 border-teal-300",
        description: "各级在漫长消耗巨额呆滞库存后，系统在阻尼衰减中寻找新的稳态平衡点，伴随低频次生波动。",
        dominantLoop: "阻尼回归平衡环 B1 (逐渐收敛)",
        loopType: "settling",
      };
    }
  }, [currentWeek, currentState, stepShockMagnitude, productionDelay]);

  // SVG 绘图坐标计算
  const width = 740;
  const height = 260;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;
  const maxVal = 300;

  // 坐标映射
  const getX = (t: number) => {
    return paddingLeft + (t / totalWeeks) * (width - paddingLeft - paddingRight);
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxVal, val));
    return height - paddingBottom - (clamped / maxVal) * (height - paddingTop - paddingBottom);
  };

  // 生成部分/完整路径
  const generateProgressivePath = (selector: (d: SystemDynamicsState) => number, upToWeek: number) => {
    const slice = sdData.slice(0, upToWeek + 1);
    if (slice.length === 0) return "";
    return slice
      .map((d, i) => {
        const x = getX(d.time);
        const y = getY(selector(d));
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
  };

  // 生成排产曲线下的半透明渐变面积波浪
  const generateAreaPath = (selector: (d: SystemDynamicsState) => number, upToWeek: number) => {
    const slice = sdData.slice(0, upToWeek + 1);
    if (slice.length === 0) return "";
    const linePath = slice
      .map((d, i) => {
        const x = getX(d.time);
        const y = getY(selector(d));
        return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ");
    
    const lastX = getX(slice[slice.length - 1].time);
    const firstX = getX(slice[0].time);
    const baselineY = height - paddingBottom;
    return `${linePath} L ${lastX.toFixed(1)} ${baselineY} L ${firstX.toFixed(1)} ${baselineY} Z`;
  };

  // 关键节点跳转
  const handleJumpToWeek = (targetW: number) => {
    setCurrentWeek(Math.min(totalWeeks, Math.max(0, targetW)));
  };

  const toggleLine = (key: keyof typeof visibleLines) => {
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 当前周的瞬时放大倍数
  const instantaneousBWE = useMemo(() => {
    if (!currentState) return 1.0;
    const dem = currentState.customerDemand || 20;
    const prod = currentState.manufacturerProduction || 20;
    return Number((prod / dem).toFixed(2));
  }, [currentState]);

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-5">
      {/* 顶部标题与动态演化状态指示 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-stone-900 text-stone-100 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" />
              时序演化动力学推演
            </span>
            <span className="text-xs text-stone-500 font-mono">
              36-Week Dynamic Oscillation Waveform
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <span>系统动力学 36 周时序震荡演化曲线（动态推演）</span>
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl">
            直观展现从第 0 周稳态、第 6 周需求微扰阶跃，到制造工厂排产巨幅冲顶、以及随后库存海啸爆发的全周期因果动态过程。
          </p>
        </div>

        {/* 播控按钮组 */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 shadow-2xs transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "暂停演化" : "播放演化"}</span>
          </button>

          {/* 演化倍速 */}
          <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden text-xs bg-white">
            {[0.5, 1, 2, 4].map((sp) => (
              <button
                key={sp}
                onClick={() => setPlaySpeed(sp)}
                className={`px-2 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                  playSpeed === sp
                    ? "bg-stone-200 text-stone-900 font-bold"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>

          {/* 重置回到第 0 周 */}
          <button
            onClick={() => {
              setCurrentWeek(0);
              setIsPlaying(true);
            }}
            className="p-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 shadow-2xs transition-all cursor-pointer"
            title="重新从第 0 周演化"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 实时动力学相位状态横幅 (Synchronized Dynamic Phase Alert) */}
      <div className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 ${phaseInfo.badgeColor}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/80 border border-stone-200/60 flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow-2xs">
            W{currentWeek.toString().padStart(2, "0")}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{phaseInfo.name}</span>
              <span className="text-[11px] font-mono opacity-80">[{phaseInfo.phase}]</span>
            </div>
            <p className="text-xs mt-0.5 leading-relaxed opacity-90">
              {phaseInfo.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono shrink-0 bg-white/70 px-3 py-1.5 rounded-lg border border-stone-200/40">
          <span className="opacity-75">主导回路:</span>
          <span className="font-bold">{phaseInfo.dominantLoop}</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 核心动态 SVG 曲线画布 (Animated Dynamic SVG Vector Stage) */}
      {/* ===================================================================== */}
      <div className="relative rounded-2xl bg-stone-950 border border-stone-800 p-3 sm:p-5 overflow-hidden shadow-inner text-white select-none">
        {/* 背景轻量微网格 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#37415115_1px,transparent_1px),linear-gradient(to_bottom,#37415115_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* 顶部画布角标 */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-stone-400 mb-2 border-b border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-stone-300 font-sans font-medium">
              3阶微分方程时延震荡推演 · 仿真进度: {currentWeek} / 36 周
            </span>
          </div>
          <div className="text-stone-400">
            瞬时放大比: <strong className="text-amber-400 font-bold">{instantaneousBWE}x</strong>
          </div>
        </div>

        {/* SVG 主图 */}
        <div className="relative w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-64 sm:h-72 overflow-visible"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, (clickX - paddingLeft) / (width - paddingLeft - paddingRight)));
              handleJumpToWeek(Math.round(ratio * totalWeeks));
            }}
          >
            <defs>
              {/* 制造排产波浪渐变 */}
              <linearGradient id="prodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity="0.45" />
                <stop offset="70%" stopColor="#d97706" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
              </linearGradient>

              {/* 需求阶跃发生区纵向高亮条 */}
              <linearGradient id="shockStripe" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.0" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y 轴刻度水平网格线 */}
            {[0, 75, 150, 225, 300].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="#292524"
                    strokeWidth="1"
                    strokeDasharray={val === 0 ? "none" : "3 3"}
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    fill="#78716c"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* X 轴刻度垂直网格线 (每 6 周标一次) */}
            {[0, 6, 12, 18, 24, 30, 36].map((w) => {
              const x = getX(w);
              return (
                <g key={w}>
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={height - paddingBottom}
                    stroke={w === 6 ? "#b45309" : "#292524"}
                    strokeWidth={w === 6 ? "1.5" : "1"}
                    strokeDasharray={w === 6 ? "4 2" : "2 4"}
                  />
                  <text
                    x={x}
                    y={height - paddingBottom + 16}
                    fill={w === 6 ? "#fbbf24" : "#78716c"}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    W{w}
                  </text>
                </g>
              );
            })}

            {/* t=6 阶跃突变事件标识条 */}
            <rect
              x={getX(6) - 12}
              y={paddingTop}
              width={24}
              height={height - paddingTop - paddingBottom}
              fill="url(#shockStripe)"
              pointerEvents="none"
            />
            <text
              x={getX(6)}
              y={paddingTop - 8}
              fill="#fbbf24"
              fontSize="9"
              fontFamily="sans-serif"
              fontWeight="bold"
              textAnchor="middle"
            >
              ⚡ t=6 阶跃突变
            </text>

            {/* 完整 36 周背景幽灵参考轮廓线 (Ghost Background Trajectory) */}
            <path
              d={generateProgressivePath((d) => d.customerDemand, totalWeeks)}
              fill="none"
              stroke="#57534e"
              strokeWidth="1"
              strokeDasharray="2 3"
              opacity="0.3"
            />
            <path
              d={generateProgressivePath((d) => d.manufacturerProduction, totalWeeks)}
              fill="none"
              stroke="#d97706"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.25"
            />
            <path
              d={generateProgressivePath((d) => d.manufacturerInventory, totalWeeks)}
              fill="none"
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.25"
            />

            {/* 制造排产波浪渐变填充面积 (伴随时间动态推移) */}
            {visibleLines.production && (
              <path
                d={generateAreaPath((d) => d.manufacturerProduction, currentWeek)}
                fill="url(#prodGradient)"
              />
            )}

            {/* 动态推进曲线 1: 终端需求 (灰色点划线) */}
            {visibleLines.demand && (
              <path
                d={generateProgressivePath((d) => d.customerDemand, currentWeek)}
                fill="none"
                stroke="#a8a29e"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            )}

            {/* 动态推进曲线 2: 零售商订单 (天蓝) */}
            {visibleLines.retailer && (
              <path
                d={generateProgressivePath((d) => d.retailerOrder, currentWeek)}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
              />
            )}

            {/* 动态推进曲线 3: 批发商订单 (靛蓝) */}
            {visibleLines.wholesaler && (
              <path
                d={generateProgressivePath((d) => d.wholesalerOrder, currentWeek)}
                fill="none"
                stroke="#818cf8"
                strokeWidth="2"
              />
            )}

            {/* 动态推进曲线 4: 制造商排产 (琥珀金高亮粗线) */}
            {visibleLines.production && (
              <path
                d={generateProgressivePath((d) => d.manufacturerProduction, currentWeek)}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
              />
            )}

            {/* 动态推进曲线 5: 工厂在库库存 (绯红双划线) */}
            {visibleLines.inventory && (
              <path
                d={generateProgressivePath((d) => d.manufacturerInventory, currentWeek)}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeDasharray="4 2"
              />
            )}

            {/* 动态时序扫描线 (Vertical Scanning Head Line at currentWeek) */}
            {currentState && (
              <g>
                <line
                  x1={getX(currentWeek)}
                  y1={paddingTop - 4}
                  x2={getX(currentWeek)}
                  y2={height - paddingBottom}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  opacity="0.8"
                />
                
                {/* 扫描线顶部小指示帽 */}
                <circle
                  cx={getX(currentWeek)}
                  cy={paddingTop - 4}
                  r="3.5"
                  fill="#fbbf24"
                  className="animate-pulse"
                />

                {/* 动态各曲线上当前点的呼吸光斑 (Dynamic Point Beads) */}
                {visibleLines.demand && (
                  <circle
                    cx={getX(currentWeek)}
                    cy={getY(currentState.customerDemand)}
                    r="3.5"
                    fill="#a8a29e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
                {visibleLines.retailer && (
                  <circle
                    cx={getX(currentWeek)}
                    cy={getY(currentState.retailerOrder)}
                    r="4"
                    fill="#38bdf8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
                {visibleLines.wholesaler && (
                  <circle
                    cx={getX(currentWeek)}
                    cy={getY(currentState.wholesalerOrder)}
                    r="4"
                    fill="#818cf8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
                {visibleLines.production && (
                  <g>
                    <circle
                      cx={getX(currentWeek)}
                      cy={getY(currentState.manufacturerProduction)}
                      r="6"
                      fill="#f59e0b"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <circle
                      cx={getX(currentWeek)}
                      cy={getY(currentState.manufacturerProduction)}
                      r="10"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="1"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  </g>
                )}
                {visibleLines.inventory && (
                  <circle
                    cx={getX(currentWeek)}
                    cy={getY(currentState.manufacturerInventory)}
                    r="4.5"
                    fill="#f43f5e"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            )}

            {/* 轴标签 */}
            <text
              x={paddingLeft}
              y={paddingTop - 12}
              fill="#a8a29e"
              fontSize="9"
              fontFamily="sans-serif"
              textAnchor="start"
            >
              数量单位 (Units)
            </text>
            <text
              x={width - paddingRight}
              y={height - paddingBottom + 30}
              fill="#a8a29e"
              fontSize="9"
              fontFamily="monospace"
              textAnchor="end"
            >
              时间演化 (Weeks)
            </text>
          </svg>
        </div>

        {/* 动态图例开关与高亮选择器 */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800 text-xs text-stone-300">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              onClick={() => toggleLine("demand")}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer ${
                visibleLines.demand ? "opacity-100 font-semibold" : "opacity-40"
              }`}
            >
              <span className="w-3 h-0.5 bg-stone-400 inline-block border-dashed" />
              <span>终端真实需求</span>
            </button>

            <button
              onClick={() => toggleLine("retailer")}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer ${
                visibleLines.retailer ? "opacity-100 font-semibold" : "opacity-40"
              }`}
            >
              <span className="w-3 h-0.5 bg-sky-400 inline-block" />
              <span>零售商订单</span>
            </button>

            <button
              onClick={() => toggleLine("wholesaler")}
              className={`flex items-center gap-1.5 transition-opacity cursor-pointer ${
                visibleLines.wholesaler ? "opacity-100 font-semibold" : "opacity-40"
              }`}
            >
              <span className="w-3 h-0.5 bg-indigo-400 inline-block" />
              <span>批发商订单</span>
            </button>

            <button
              onClick={() => toggleLine("production")}
              className={`flex items-center gap-1.5 text-amber-300 transition-opacity cursor-pointer ${
                visibleLines.production ? "opacity-100 font-bold" : "opacity-40"
              }`}
            >
              <span className="w-3.5 h-1 bg-amber-400 inline-block rounded-full shadow-[0_0_8px_#f59e0b]" />
              <span>工厂排产 (剧烈过冲)</span>
            </button>

            <button
              onClick={() => toggleLine("inventory")}
              className={`flex items-center gap-1.5 text-rose-300 transition-opacity cursor-pointer ${
                visibleLines.inventory ? "opacity-100 font-semibold" : "opacity-40"
              }`}
            >
              <span className="w-3 h-0.5 bg-rose-400 inline-block border-dashed" />
              <span>工厂在库库存</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-stone-500">
            点击画布或拖动滑块可任意定位时序
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 36 周时序交互滑块与关键演化拐点快速跳转栏 */}
      {/* ===================================================================== */}
      <div className="space-y-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
        <div className="flex items-center justify-between text-xs text-stone-700">
          <span className="font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-stone-600" />
            <span>时序推演进度 (0 ~ 36 周任意定位)</span>
          </span>
          <span className="font-mono font-bold bg-white px-2.5 py-0.5 rounded border border-stone-200">
            第 {currentWeek} 周 / 共 36 周
          </span>
        </div>

        {/* 交互进度滑条 */}
        <input
          type="range"
          min={0}
          max={totalWeeks}
          step={1}
          value={currentWeek}
          onChange={(e) => {
            setCurrentWeek(Number(e.target.value));
            setIsPlaying(false);
          }}
          className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
        />

        {/* 关键阶段一键跳转快捷键 */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-stone-500 font-medium">关键动力学拐点跳转：</span>
          <button
            onClick={() => handleJumpToWeek(0)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
              currentWeek === 0 ? "bg-stone-900 text-white border-stone-900 font-bold" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
            }`}
          >
            t=0 初始稳态
          </button>
          <button
            onClick={() => handleJumpToWeek(6)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
              currentWeek === 6 ? "bg-amber-600 text-white border-amber-600 font-bold" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
            }`}
          >
            ⚡ t=6 阶跃突发
          </button>
          <button
            onClick={() => handleJumpToWeek(10)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
              currentWeek === 10 ? "bg-rose-600 text-white border-rose-600 font-bold" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
            }`}
          >
            t=10 时滞恐慌
          </button>
          <button
            onClick={() => handleJumpToWeek(16)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
              currentWeek === 16 ? "bg-red-600 text-white border-red-600 font-bold" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
            }`}
          >
            💥 t=16 排产顶峰
          </button>
          <button
            onClick={() => handleJumpToWeek(24)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
              currentWeek === 24 ? "bg-purple-600 text-white border-purple-600 font-bold" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
            }`}
          >
            🛑 t=24 爆仓与停产
          </button>
          <button
            onClick={() => handleJumpToWeek(36)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all cursor-pointer ${
              currentWeek === 36 ? "bg-stone-900 text-white border-stone-900 font-bold" : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
            }`}
          >
            t=36 周期收敛
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 当前周实时遥测数值卡片 (Real-time Telemetry at Week t) */}
      {/* ===================================================================== */}
      {currentState && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* 终端真实需求 */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[11px] text-stone-500 font-medium flex items-center justify-between">
              <span>终端真实需求 D(t)</span>
              <span className="w-2 h-2 rounded-full bg-stone-400" />
            </div>
            <div className="text-xl font-mono font-bold text-stone-900 mt-1">
              {currentState.customerDemand} <span className="text-[11px] font-normal text-stone-400">箱/周</span>
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              {currentWeek >= 6 ? `较基线增加 +${stepShockMagnitude}%` : "基准需求常量"}
            </div>
          </div>

          {/* 零售商订货 */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[11px] text-sky-700 font-medium flex items-center justify-between">
              <span>零售商订货 Q_ret(t)</span>
              <span className="w-2 h-2 rounded-full bg-sky-400" />
            </div>
            <div className="text-xl font-mono font-bold text-sky-900 mt-1">
              {currentState.retailerOrder} <span className="text-[11px] font-normal text-stone-400">箱/周</span>
            </div>
            <div className="text-[10px] text-sky-600 mt-0.5">
              在库: {currentState.retailerInventory} 箱
            </div>
          </div>

          {/* 批发商订货 */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
            <div className="text-[11px] text-indigo-700 font-medium flex items-center justify-between">
              <span>批发商订货 Q_who(t)</span>
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
            </div>
            <div className="text-xl font-mono font-bold text-indigo-900 mt-1">
              {currentState.wholesalerOrder} <span className="text-[11px] font-normal text-stone-400">箱/周</span>
            </div>
            <div className="text-[10px] text-indigo-600 mt-0.5">
              在途: {currentState.wholesalerPipeline} 箱
            </div>
          </div>

          {/* 制造商排产 */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
            <div className="text-[11px] text-amber-900 font-bold flex items-center justify-between">
              <span>工厂排产量 Q_mfg(t)</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-xl font-mono font-bold text-amber-950 mt-1">
              {currentState.manufacturerProduction} <span className="text-[11px] font-normal text-stone-500">箱/周</span>
            </div>
            <div className="text-[10px] text-amber-700 font-mono mt-0.5">
              放大倍率: {instantaneousBWE}x
            </div>
          </div>

          {/* 工厂在库库存 */}
          <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200">
            <div className="text-[11px] text-rose-900 font-bold flex items-center justify-between">
              <span>工厂在库库存 Inv_mfg(t)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            </div>
            <div className="text-xl font-mono font-bold text-rose-950 mt-1">
              {currentState.manufacturerInventory} <span className="text-[11px] font-normal text-stone-500">箱</span>
            </div>
            <div className="text-[10px] text-rose-700 mt-0.5">
              在制品 (WIP): {currentState.manufacturerWip} 箱
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
