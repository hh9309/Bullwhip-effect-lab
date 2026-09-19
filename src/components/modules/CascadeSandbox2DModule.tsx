/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from "react";
import { SimulationParameters, EchelonKey } from "../../types";
import { ECHELONS } from "../../utils/constants";
import { simulateMultiEchelon } from "../../utils/simulation";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Waves, 
  Sliders, 
  Zap, 
  Activity, 
  TrendingUp, 
  Shuffle,
  Gauge,
  Camera,
  Layers
} from "lucide-react";
import { OrderVelocityDashboard } from "./OrderVelocityDashboard";
import { EchelonSnapshotModal } from "./EchelonSnapshotModal";

// 快速计算单节点瞬时缺货概率
function calculateStockoutProb(inventory: number, demand: number, volatility: number, leadTime: number, backlog: number = 0): number {
  if (inventory <= 0 || backlog > 0) return 100;
  const sigmaD = Math.max(2, demand * (volatility / 100) * Math.sqrt(Math.max(1, leadTime)));
  const z = (inventory - demand) / sigmaD;
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
  const cdf = 0.5 * (1.0 + sign * y);
  return Math.min(100, Math.max(0, Number(((1 - cdf) * 100).toFixed(0))));
}

interface CascadeSandbox2DProps {
  params: SimulationParameters;
  onChangeParams: (updater: (prev: SimulationParameters) => SimulationParameters) => void;
}

export const CascadeSandbox2DModule: React.FC<CascadeSandbox2DProps> = ({
  params,
  onChangeParams,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(12);
  const [speed, setSpeed] = useState<number>(1);
  const [selectedEchelon, setSelectedEchelon] = useState<EchelonKey>("manufacturer");
  const [snapshotEchelon, setSnapshotEchelon] = useState<EchelonKey | null>(null);

  // 生成完整仿真数据
  const simResult = simulateMultiEchelon(params, 32);

  // 动画步进控制
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 32);
    }, 800 / speed);
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  // 2D 级联波浪 Canvas 渲染
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let waveOffset = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 清屏淡雅米白背景
      ctx.fillStyle = "#fafaf9";
      ctx.fillRect(0, 0, width, height);

      // 绘制各层级水平波浪泳道
      const echelons: EchelonKey[] = ["retailer", "wholesaler", "distributor", "manufacturer", "supplier"];
      const laneHeight = height / echelons.length;

      echelons.forEach((echKey, idx) => {
        const echConfig = ECHELONS.find((e) => e.key === echKey)!;
        const yCenter = (idx + 0.5) * laneHeight;
        const data = simResult.timeSeries[echKey];
        const currentData = data[currentStep] || data[0];

        // 泳道微弱分隔线
        ctx.strokeStyle = "#f0ece9";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, (idx + 1) * laneHeight);
        ctx.lineTo(width, (idx + 1) * laneHeight);
        ctx.stroke();

        // 泳道背景标签
        ctx.fillStyle = echConfig.color;
        ctx.font = "bold 11px 'Plus Jakarta Sans', sans-serif";
        ctx.fillText(echConfig.name, 16, yCenter - laneHeight * 0.28);

        ctx.font = "bold 9px sans-serif";
        ctx.fillStyle = echConfig.color;
        ctx.fillText("📷 点击查看快照", 110, yCenter - laneHeight * 0.28);

        ctx.font = "10px monospace";
        ctx.fillStyle = "#78716c";
        ctx.fillText(`在库: ${currentData?.inventory ?? 0} | 在途: ${currentData?.pipeline ?? 0} | 订单: ${currentData?.order ?? 0}`, 16, yCenter + laneHeight * 0.35);

        // 绘制级联动态正弦流体波浪
        // 振幅逐级放大：越靠近供应商，波幅指数级倍增
        const metric = simResult.metrics.find((m) => m.key === echKey);
        const bweFactor = metric ? Math.min(6, metric.bwe) : 1;
        const baseAmp = 6 + idx * 4 * (params.leadTime / 3) * (bweFactor / 1.5);

        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = echConfig.color;

        // 渐变填充区域
        const grad = ctx.createLinearGradient(0, yCenter - baseAmp, 0, yCenter + baseAmp);
        grad.addColorStop(0, echConfig.color + "22");
        grad.addColorStop(1, echConfig.color + "03");
        ctx.fillStyle = grad;

        const startX = 220;
        const waveWidth = width - startX - 20;

        ctx.moveTo(startX, yCenter);

        for (let x = 0; x <= waveWidth; x += 3) {
          // 结合历史时序数据与动态流动相位
          const tIndex = Math.min(31, Math.floor((x / waveWidth) * 31));
          const stepOrder = data[tIndex]?.order || params.demandMean;
          const orderDelta = (stepOrder - params.demandMean) / 4;

          const sine = Math.sin((x / 40) - waveOffset * (0.8 + idx * 0.2));
          const y = yCenter + sine * (baseAmp * 0.6) + orderDelta;

          ctx.lineTo(startX + x, y);
        }

        ctx.lineTo(startX + waveWidth, yCenter + laneHeight * 0.4);
        ctx.lineTo(startX, yCenter + laneHeight * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 绘制当前时间游标竖线
        const cursorX = startX + (currentStep / 31) * waveWidth;
        ctx.fillStyle = echConfig.color;
        ctx.beginPath();
        ctx.arc(cursorX, yCenter, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      // 绘制全局时间刻度线
      const startX = 220;
      const waveWidth = width - startX - 20;
      const cursorX = startX + (currentStep / 31) * waveWidth;
      ctx.strokeStyle = "#1c1917";
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cursorX, 10);
      ctx.lineTo(cursorX, height - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      waveOffset += 0.04;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [simResult, currentStep, params]);

  // 点击 Canvas 泳道快速触发该节点的状态快照
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const laneHeight = rect.height / 5;
    const laneIndex = Math.min(4, Math.max(0, Math.floor(y / laneHeight)));
    const echelons: EchelonKey[] = ["retailer", "wholesaler", "distributor", "manufacturer", "supplier"];
    const clickedKey = echelons[laneIndex];
    if (clickedKey) {
      setSelectedEchelon(clickedKey);
      setSnapshotEchelon(clickedKey);
    }
  };

  return (
    <div className="space-y-6">
      {/* 模块引言与控制切片 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
                模块 02 · 动态演播
              </span>
              <span className="text-xs text-stone-400 font-mono">2D Cascade Dynamic Wave Simulator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              2D 级联沙盒：多级波幅逐级放大全景演播
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-3xl">
              直接拖拽终端需求形态或提前期 <span className="font-mono">L</span>，以连续 2D 流体波浪演播需求波动从零售端一路向源头供应商传导的“波幅几何级倍增”过程。
            </p>
          </div>

          {/* 演播播放控制器切片 */}
          <div className="flex items-center gap-2 shrink-0 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-stone-100 hover:bg-stone-800 transition-colors shadow-2xs"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? "暂停演播" : "继续演播"}</span>
            </button>

            <button
              onClick={() => setCurrentStep((prev) => (prev + 1) % 32)}
              className="p-1.5 text-xs rounded-lg text-stone-700 hover:bg-stone-200 transition-colors"
              title="单步推进 +1 期"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentStep(0)}
              className="p-1.5 text-xs rounded-lg text-stone-700 hover:bg-stone-200 transition-colors"
              title="复位时间轴"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-stone-300 mx-1" />

            {/* 倍速切片 */}
            <div className="flex items-center text-xs font-mono font-semibold">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-1 rounded ${
                    speed === s ? "bg-white text-stone-900 shadow-2xs" : "text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 交互输入形态切片切换 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* 冲击类型选择 */}
          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60">
            <label className="text-xs font-semibold text-stone-700 mb-2 block">
              终端需求输入形态切片 (Shock Mode)
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { type: "pulse", label: "脉冲尖峰", icon: Zap },
                { type: "step", label: "阶跃跳跃", icon: TrendingUp },
                { type: "sine", label: "正弦周期", icon: Waves },
                { type: "random", label: "布朗扰动", icon: Shuffle },
              ].map((item) => {
                const isCurrent = params.shockType === item.type;
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() =>
                      onChangeParams((prev) => ({
                        ...prev,
                        shockType: item.type as any,
                      }))
                    }
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition-all text-left ${
                      isCurrent
                        ? "bg-white border-stone-800 text-stone-900 font-semibold shadow-2xs"
                        : "bg-white/60 border-stone-200 text-stone-600 hover:bg-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-stone-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 冲击幅度滑块 */}
          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700">需求冲击幅度 (Magnitude)</label>
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-800">
                +{params.shockMagnitude}%
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={params.shockMagnitude}
              onChange={(e) =>
                onChangeParams((prev) => ({
                  ...prev,
                  shockMagnitude: Number(e.target.value),
                }))
              }
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>+10% (温和微调)</span>
              <span>+100% (翻倍爆发)</span>
            </div>
          </div>

          {/* 提前期 L 实时拖拽 */}
          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700">全链提前期 L (Lead Time)</label>
              <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-800">
                {params.leadTime} 期
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={params.leadTime}
              onChange={(e) =>
                onChangeParams((prev) => ({
                  ...prev,
                  leadTime: Number(e.target.value),
                }))
              }
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>L=1 (无缝协同)</span>
              <span>L=8 (长鞭海啸)</span>
            </div>
          </div>

          {/* 当前时步指示器 */}
          <div className="p-3 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">演播时间步 (Time Step)</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                t = {currentStep} / 31 期
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min={0}
                max={31}
                value={currentStep}
                onChange={(e) => setCurrentStep(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-teal-700"
              />
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              拖动滑块可穿梭时空查看各节点波前到达状态
            </div>
          </div>
        </div>
      </div>

      {/* 2D 动态波浪演播画布 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-semibold text-stone-900">
              5级级联波浪可视化泳道 (2D Wave Cascading Swimlanes)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
            <Camera className="w-3.5 h-3.5 text-stone-700" />
            <span>点击泳道或卡片查看节点「瞬时状态快照」</span>
          </div>
        </div>

        {/* Canvas 容器 */}
        <div className="w-full overflow-x-auto rounded-xl border border-stone-100 bg-stone-50/40 relative group">
          <canvas
            ref={canvasRef}
            width={880}
            height={360}
            onClick={handleCanvasClick}
            className="w-full h-80 sm:h-96 block cursor-pointer"
            title="点击任意层级泳道，呼出该节点在当前时间点的状态快照"
          />
          <div className="absolute top-2 right-3 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity text-[10px] font-mono px-2 py-1 rounded bg-stone-900/80 text-white backdrop-blur-xs flex items-center gap-1.5">
            <Camera className="w-3 h-3 text-emerald-400" />
            <span>点击泳道查看当前时步快照 (t={currentStep})</span>
          </div>
        </div>

        {/* 5大层级实时方差指标切片卡片群 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {simResult.metrics.map((m) => {
            const isSelected = selectedEchelon === m.key;
            const echelonData = simResult.timeSeries[m.key] || [];
            const currentData = echelonData[currentStep] || echelonData[0];
            const stockoutProb = calculateStockoutProb(
              currentData?.inventory ?? 0,
              currentData?.demand ?? params.demandMean,
              params.demandVolatility,
              params.leadTime,
              currentData?.backlog ?? 0
            );

            return (
              <div
                key={m.key}
                onClick={() => {
                  setSelectedEchelon(m.key);
                  setSnapshotEchelon(m.key);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer group relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-stone-800 shadow-xs ring-1 ring-stone-800/10"
                    : "bg-stone-50/60 border-stone-200 hover:border-stone-400 hover:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-[11px] font-semibold text-stone-700 truncate">{m.name}</div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEchelon(m.key);
                        setSnapshotEchelon(m.key);
                      }}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-2xs shrink-0 cursor-pointer"
                      title="查看瞬时状态快照"
                    >
                      <Camera className="w-2.5 h-2.5 text-emerald-300" />
                      <span>快照</span>
                    </button>
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-base font-mono font-bold text-stone-900">{m.bwe}x</span>
                    <span className="text-[10px] text-stone-400 font-mono">BWE</span>
                  </div>
                </div>

                {/* 瞬时状态三要素小计 */}
                <div className="mt-2.5 pt-2 border-t border-stone-200/60 text-[11px] space-y-1 font-mono">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="text-stone-400 text-[10px]">瞬时在库:</span>
                    <span className="font-semibold text-stone-800">{currentData?.inventory ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="text-stone-400 text-[10px]">在途订单:</span>
                    <span className="font-semibold text-stone-800">{currentData?.pipeline ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-stone-400 text-[10px]">缺货概率:</span>
                    <span className={`font-bold ${
                      stockoutProb >= 50 ? "text-rose-600" : stockoutProb >= 20 ? "text-amber-600" : "text-emerald-600"
                    }`}>
                      {stockoutProb}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-stone-400 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  点击查看深度快照 ➔
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 状态快照弹窗提示框 */}
      {snapshotEchelon && (
        <EchelonSnapshotModal
          echelonKey={snapshotEchelon}
          currentStep={currentStep}
          totalSteps={32}
          timeSeries={simResult.timeSeries}
          metrics={simResult.metrics}
          params={params}
          onClose={() => setSnapshotEchelon(null)}
          onStepChange={(newStep) => setCurrentStep(newStep)}
          onSelectEchelon={(newKey) => {
            setSelectedEchelon(newKey);
            setSnapshotEchelon(newKey);
          }}
        />
      )}

      {/* 实时订单流速仪表盘 (Order Velocity & Volatility Dashboard) */}
      <OrderVelocityDashboard
        timeSeries={simResult.timeSeries}
        metrics={simResult.metrics}
        currentStep={currentStep}
        baseDemandMean={params.demandMean}
      />
    </div>
  );
};
