/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { calculateTheoreticalBWE, calculateDerivativeL, calculateDerivativeP } from "../../utils/simulation";
import { ChevronRight, Sliders, CheckCircle2 } from "lucide-react";
import { KatexMath, InlineMathText } from "../common/KatexRenderer";

interface TheoreticalAlgebraProps {
  leadTime: number;
  smoothingP: number;
  onChangeLeadTime: (v: number) => void;
  onChangeSmoothingP: (v: number) => void;
}

export const TheoreticalAlgebraModule: React.FC<TheoreticalAlgebraProps> = ({
  leadTime,
  smoothingP,
  onChangeLeadTime,
  onChangeSmoothingP,
}) => {
  const [activeProofStep, setActiveProofStep] = useState<number>(0);
  const [comparisonPList] = useState<number[]>([2, 5, 10]);

  const bwe = calculateTheoreticalBWE(leadTime, smoothingP);
  const dL = calculateDerivativeL(leadTime, smoothingP);
  const dP = calculateDerivativeP(leadTime, smoothingP);

  const termLinear = Number(((2 * leadTime) / smoothingP).toFixed(3));
  const termQuadratic = Number(((2 * Math.pow(leadTime, 2)) / Math.pow(smoothingP, 2)).toFixed(3));

  const proofSteps = [
    {
      step: 1,
      title: "需求生成与移动平均预测更新",
      formula: "\\hat{D}_t = \\frac{1}{p} \\sum_{i=1}^{p} D_{t-i}",
      explanation: "假设各节点面对顾客或下级独立同分布（i.i.d）的随机需求 $D_t$（均值 $\\mu$、方差 $\\sigma^2$）。决策者采用 $p$ 期简单移动平均更新未来单期预期值 $\\hat{D}_t$。当新一期需求 $D_t$ 到达时，预测调整量为 $\\Delta \\hat{D}_t = \\frac{D_t - D_{t-p}}{p}$。",
    },
    {
      step: 2,
      title: "基本库存控制策略 (Order-up-to-S Policy)",
      formula: "S_t = (L + 1) \\hat{D}_t + z \\cdot \\sigma \\sqrt{L + 1}",
      explanation: "提前期为 $L$（涵盖订单传输时滞与物理补货时滞）。为保障服务水平，在每个决策周期初，企业将目标库存点 $S_t$ 设置为覆盖提前期内累计期望需求与安全库存之和。由于安全库存项为常数，目标库存的动态调整量完全由预测更新驱动：$\\Delta S_t = (L+1)(\\hat{D}_t - \\hat{D}_{t-1})$。",
    },
    {
      step: 3,
      title: "订货量离散差分方程推导",
      formula: "O_t = S_t - S_{t-1} + D_{t-1} = D_{t-1} + \\frac{L + 1}{p} (D_{t-1} - D_{t-1-p})",
      explanation: "订货量 $O_t$ 等于当期期末补齐目标库存差额与期内消耗的总和。代入预测更新公式，展开整理后可得：订货决策不仅要如数补充当期实际消费需求 $D_{t-1}$，还必须叠加由于提前期乘数 $(L+1)$ 放大后的预测差额校正项！",
    },
    {
      step: 4,
      title: "方差展开与交叉滞后协方差计算",
      formula: "\\mathrm{Var}(O) = \\mathrm{Var}\\left( \\left(1 + \\frac{L+1}{p}\\right) D_{t-1} - \\frac{L+1}{p} D_{t-1-p} \\right)",
      explanation: "根据方差代数性质 $\\mathrm{Var}(a X - b Y) = a^2 \\mathrm{Var}(X) + b^2 \\mathrm{Var}(Y) - 2ab \\mathrm{Cov}(X,Y)$。由于各期真实需求 $D$ 相互独立，当 $p \\ge 1$ 时 $\\mathrm{Cov}(D_{t-1}, D_{t-1-p}) = 0$。代入平方展开计算。",
    },
    {
      step: 5,
      title: "经典方差放大系数 (BWE) 最终下界定理",
      formula: "BWE = \\frac{\\mathrm{Var}(O)}{\\mathrm{Var}(D)} \\ge 1 + \\frac{2L}{p} + \\frac{2L^2}{p^2}",
      explanation: "经过代数化简与不等式放缩，得到著名的 Chen, Drezner, Ryan & Simchi-Levi (2000) 经典定理。该定理在数学上严格证明了：即便所有参与者都采取最优理性预测，只要存在时滞 $L > 0$，订货方差就必然严格大于需求方差，且二次项 $\\frac{2L^2}{p^2}$ 赋予了其指数级的发散特性！",
    },
  ];

  // 生成 SVG 曲线点
  const maxL = 8;
  const generateCurvePoints = (pVal: number) => {
    const points: string[] = [];
    const width = 360;
    const height = 180;
    for (let l = 1; l <= maxL; l += 0.5) {
      const val = 1 + (2 * l) / pVal + (2 * Math.pow(l, 2)) / Math.pow(pVal, 2);
      // y 映射：1 -> 170, 15 -> 20
      const x = 30 + ((l - 1) / (maxL - 1)) * (width - 50);
      const y = Math.max(15, 170 - ((val - 1) / 10) * 150);
      points.push(`${x},${y}`);
    }
    return points.join(" ");
  };

  return (
    <div className="space-y-6">
      {/* 模块引言切片 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
                模块 01 · 底层理论
              </span>
              <span className="text-xs text-stone-400 font-mono">Algebraic Proof & Parametric Sensitivity</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              理论代数与建模：方差放大系数严格推导
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-3xl">
              形式化构建多级序列供应链，推导方差放大系数 <span className="font-serif italic font-semibold text-stone-800">BWE</span> 公式，从微积分与概率统计层面解剖时滞 <span className="font-mono">L</span> 与平滑参数 <span className="font-mono">p</span> 的二次方放大机制。
            </p>
          </div>

          {/* 核心公式展示框 */}
          <div className="px-5 py-3.5 rounded-xl bg-stone-50 border border-stone-200 shrink-0 text-center">
            <div className="text-xs text-stone-500 font-medium mb-1.5">核心理论公式定理 (KaTeX)</div>
            <div className="py-1">
              <KatexMath
                math="BWE = \frac{\mathrm{Var}(O)}{\mathrm{Var}(D)} \ge 1 + \frac{2L}{p} + \frac{2L^2}{p^2}"
                block={false}
                className="text-base sm:text-lg font-bold"
              />
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              Var(Order) / Var(Demand) ≥ 放大下界
            </div>
          </div>
        </div>

        {/* 交互参数调优切片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* 控制滑块 L */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-stone-500" />
                提前期 L (Lead Time)
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-800">
                {leadTime} 期
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={leadTime}
              onChange={(e) => onChangeLeadTime(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>L=1 (极速物流)</span>
              <span>L=8 (跨国长海运)</span>
            </div>
          </div>

          {/* 控制滑块 p */}
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-stone-500" />
                平滑参数 p (Smoothing)
              </label>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-800">
                {smoothingP} 阶
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              step={1}
              value={smoothingP}
              onChange={(e) => onChangeSmoothingP(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-800"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
              <span>p=2 (激进跟风)</span>
              <span>p=12 (高度平滑)</span>
            </div>
          </div>

          {/* 当前计算结果：BWE */}
          <div className="p-3.5 rounded-xl border border-teal-200/80 bg-teal-50/40">
            <div className="text-xs font-semibold text-teal-800">当期理论方差放大系数</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-mono font-bold text-teal-900">{bwe}x</span>
              <span className="text-xs text-teal-700">
                (比终端高 {( (bwe - 1) * 100 ).toFixed(0)}%)
              </span>
            </div>
            <div className="text-[11px] text-teal-700/80 mt-1 font-mono">
              线性项: {termLinear} | 二次项: {termQuadratic}
            </div>
          </div>

          {/* 敏感性偏导数诊断 */}
          <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40">
            <div className="text-xs font-semibold text-amber-900">时滞边际敏感度 ∂(BWE)/∂L</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-mono font-bold text-amber-950">+{dL}</span>
              <span className="text-xs text-amber-800">/期</span>
            </div>
            <div className="text-[11px] text-amber-800/80 mt-1">
              每延长 1 期提前期，BWE 立即激增 +{dL}
            </div>
          </div>
        </div>
      </div>

      {/* 左右分栏切片：左侧公式逐步推导，右侧敏感度函数曲线 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左栏：5步形式化推导切片卡 */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-900" />
              严密代数推导过程切片 (Step-by-Step Proof)
            </h3>
            <span className="text-xs text-stone-500 font-mono">点击步骤展开证明明细</span>
          </div>

          <div className="space-y-2">
            {proofSteps.map((item, idx) => {
              const isCurrent = activeProofStep === idx;
              return (
                <div
                  key={item.step}
                  onClick={() => setActiveProofStep(idx)}
                  className={`rounded-xl border transition-all cursor-pointer p-4 ${
                    isCurrent
                      ? "bg-white border-stone-800 shadow-xs ring-1 ring-stone-800/10"
                      : "bg-white/80 border-stone-200 hover:border-stone-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? "bg-stone-900 text-stone-100"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {item.step}
                      </span>
                      <span className="text-sm font-semibold text-stone-900">{item.title}</span>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 shrink-0">
                      <KatexMath math={item.formula} className="text-xs" />
                    </div>
                  </div>

                  {isCurrent && (
                    <div className="mt-3 pt-3 border-t border-stone-100 text-xs text-stone-600 leading-relaxed bg-stone-50/60 p-3 rounded-lg">
                      <p>
                        <InlineMathText text={item.explanation} />
                      </p>
                      <div className="mt-2 text-[11px] text-teal-800 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        运筹学结论：时滞导致对近期误差的历史累积放大，呈现不可逆的差分扩散。
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 右栏：函数曲线与敏感性剖析切片 */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl bg-white border border-stone-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-stone-800">
                  抛物线发散：BWE 与提前期 L 敏感曲线
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">不同平滑参数 p 下的方差倍率轨迹</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                二次项主导
              </span>
            </div>

            {/* SVG 曲线绘制 */}
            <div className="relative border border-stone-100 rounded-xl bg-stone-50/60 p-2">
              <svg viewBox="0 0 380 200" className="w-full h-44 overflow-visible">
                {/* 网格线与刻度 */}
                <line x1="30" y1="20" x2="30" y2="170" stroke="#e5e5e5" strokeWidth="1" />
                <line x1="30" y1="170" x2="360" y2="170" stroke="#e5e5e5" strokeWidth="1" />

                <text x="30" y="15" fill="#a8a29e" fontSize="9" textAnchor="middle">BWE</text>
                <text x="360" y="185" fill="#a8a29e" fontSize="9" textAnchor="end">提前期 L</text>

                {/* Y轴基线 */}
                <text x="25" y="174" fill="#a8a29e" fontSize="9" textAnchor="end">1.0</text>
                <text x="25" y="100" fill="#a8a29e" fontSize="9" textAnchor="end">5.0</text>
                <text x="25" y="30" fill="#a8a29e" fontSize="9" textAnchor="end">10.0</text>

                {/* 对比曲线 1: p = 2 (激进波动 - 红色) */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  points={generateCurvePoints(2)}
                />

                {/* 对比曲线 2: p = 5 (中度平滑 - 蓝色) */}
                <polyline
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  points={generateCurvePoints(5)}
                />

                {/* 对比曲线 3: p = 10 (保守平滑 - 绿色) */}
                <polyline
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2"
                  points={generateCurvePoints(10)}
                />

                {/* 当前状态高亮圆点 */}
                {(() => {
                  const currX = 30 + ((leadTime - 1) / (maxL - 1)) * (360 - 50);
                  const currY = Math.max(15, 170 - ((bwe - 1) / 10) * 150);
                  return (
                    <g>
                      <circle cx={currX} cy={currY} r="5" fill="#1c1917" />
                      <circle cx={currX} cy={currY} r="9" fill="none" stroke="#1c1917" strokeWidth="1.5" opacity="0.4" />
                      <text x={currX} y={currY - 12} fill="#1c1917" fontSize="10" fontWeight="bold" textAnchor="middle">
                        当前 ({leadTime}, {bwe})
                      </text>
                    </g>
                  );
                })()}
              </svg>

              {/* 图例 */}
              <div className="flex items-center justify-between text-[11px] text-stone-600 px-2 mt-2 pt-2 border-t border-stone-200/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-red-500 inline-block" /> p=2 (激进敏锐)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-sky-600 inline-block" /> p=5 (基准中位)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-teal-600 inline-block" /> p=10 (厚重平滑)
                </span>
              </div>
            </div>

            {/* 运筹学实战启示切片 */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-2">
              <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                <ChevronRight className="w-4 h-4 text-stone-600" />
                代数定理对工业实战的三大铁律：
              </div>
              <ul className="space-y-1.5 pl-5 list-disc text-stone-600">
                <li>
                  <strong className="text-stone-800">时滞 L 的二次惩罚：</strong> 当 <KatexMath math="L" /> 从 2 期增至 4 期，二次项 <KatexMath math="\frac{2L^2}{p^2}" /> 膨胀 4 倍！缩短物流交货期比一切算法优化都有效。
                </li>
                <li>
                  <strong className="text-stone-800">过度拟合反受其害：</strong> 若企业试图通过极小的平滑窗口 <KatexMath math="p" />（如 p=2）“紧贴市场”，反而会导致方差成倍失控。
                </li>
                <li>
                  <strong className="text-stone-800">斩断信息链条：</strong> 只要中间层级存在独立自主预测，牛鞭效应在代数上就必然发生；唯一消除该项的方法是 POS 数据全链透明化。
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
