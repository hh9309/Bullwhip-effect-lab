/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Calculator, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Percent
} from "lucide-react";
import { KatexMath, InlineMathText } from "../../common/KatexRenderer";

export const BweCalculationSlice: React.FC = () => {
  // 微型即时试算交互状态
  const [calcL, setCalcL] = useState<number>(2);
  const [calcP, setCalcP] = useState<number>(4);

  // 计算三项拆解
  const itemBase = 1.0;
  const itemLinear = (2 * calcL) / calcP;
  const itemQuadratic = (2 * Math.pow(calcL, 2)) / Math.pow(calcP, 2);
  const totalBwe = itemBase + itemLinear + itemQuadratic;

  // 4级级联推算
  const cascade4Tiers = Math.pow(totalBwe, 4);

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-6">
      {/* 标题与切片定位 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
              切片 03 · 严谨算理
            </span>
            <span className="text-xs text-stone-400 font-mono">BWE Variance Amplification Ratio Formulation</span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
            方差放大率 (BWE) 计算原理与数学推导全解
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            从离散时序统计定义、Chen et al. (2000) 经典解析下界定理到多级供应链连乘复合效应的完整公式解构。
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-semibold border border-stone-200">
            理论定理 + 离散统计双闭环
          </span>
        </div>
      </div>

      {/* 第一部分：统计定义与离散时序计算公式切片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 左侧：离散样本统计定义 */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3.5">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-stone-700" />
              1. 离散时序采样统计计算法 (Sample Variance Ratio)
            </span>
            <span className="text-[10px] font-mono text-stone-500">统计学定义</span>
          </div>

          <div className="text-xs text-stone-600 leading-relaxed space-y-2">
            <p>
              在实测或仿真运行中，牛鞭效应方差放大率（Bullwhip Effect, BWE）定义为<strong>某节点发出的采购订单方差</strong>与其<strong>接收到的下游需求方差</strong>之比：
            </p>

            <div className="py-2 px-3 rounded-lg bg-white border border-stone-200 text-center overflow-x-auto">
              <KatexMath 
                math="BWE_{sample} = \frac{\mathrm{Var}(O)}{\mathrm{Var}(D)} = \frac{\frac{1}{N-1}\sum_{t=1}^N (O_t - \bar{O})^2}{\frac{1}{N-1}\sum_{t=1}^N (D_t - \bar{D})^2}"
                block={false}
                className="font-bold text-stone-900 text-xs sm:text-sm"
              />
            </div>

            <p className="text-[11px] text-stone-500">
              其中 <KatexMath math="N" /> 为样本观测周期数，<KatexMath math="\bar{D}" /> 和 <KatexMath math="\bar{O}" /> 分别为需求与订单的样本时序均值。
            </p>
          </div>

          {/* 状态评级标尺 */}
          <div className="p-3 rounded-lg bg-white border border-stone-200 space-y-1.5 text-[11px]">
            <span className="font-semibold text-stone-800 block">BWE 数值区间健康度诊断标尺：</span>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
              <div className="p-1.5 rounded bg-teal-50 border border-teal-200 text-teal-900">
                <strong>BWE ≤ 1.0 :</strong> 理想受控/平滑阻尼
              </div>
              <div className="p-1.5 rounded bg-sky-50 border border-sky-200 text-sky-900">
                <strong>1.0 &lt; BWE ≤ 1.8 :</strong> 正常轻度时滞放大
              </div>
              <div className="p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900">
                <strong>1.8 &lt; BWE ≤ 3.5 :</strong> 中度高危震荡
              </div>
              <div className="p-1.5 rounded bg-red-50 border border-red-200 text-red-900">
                <strong>BWE &gt; 3.5 :</strong> 严重失控海啸危机
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：经典理论解析下界 (Chen et al. 2000) */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3.5">
          <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
            <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
              2. 经典运筹学解析下界定理 (Chen et al. 2000)
            </span>
            <span className="text-[10px] font-mono text-stone-500">运筹学定理</span>
          </div>

          <div className="text-xs text-stone-600 leading-relaxed space-y-2">
            <p>
              在各节点独立采用简单移动平均（SMA，平滑窗口 <KatexMath math="p" />）预测需求、补货时滞为 <KatexMath math="L" /> 时，其理论下界具有严格的代数解析闭式解：
            </p>

            <div className="py-2.5 px-3 rounded-lg bg-white border border-stone-200 text-center overflow-x-auto">
              <KatexMath 
                math="BWE \ge 1 + \frac{2L}{p} + \frac{2L^2}{p^2}"
                block={false}
                className="font-bold text-stone-900 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-1 text-[11px] text-stone-700 pt-1">
              <div className="flex items-start gap-1.5">
                <span className="font-mono font-bold text-stone-900 shrink-0">① 常数项 1:</span>
                <span>需求等额直接传导基准项，表示真实消费的 100% 原始映射。</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-mono font-bold text-sky-800 shrink-0">② 线性项 2L/p:</span>
                <span>提前期内累计预期漂移项，受时滞 <KatexMath math="L" /> 的一阶线性牵引。</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-mono font-bold text-amber-800 shrink-0">③ 二次项 2L²/p²:</span>
                <span>历史自相关与跨期差分扩散核心项，导致波动呈非线性爆炸的罪魁祸首！</span>
              </div>
            </div>
          </div>

          {/* 敏感性偏导数结论 */}
          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-[11px] text-amber-950 flex items-center justify-between">
            <span className="font-semibold">对时滞 L 的敏感性:</span>
            <KatexMath math="\frac{\partial BWE}{\partial L} = \frac{2}{p} + \frac{4L}{p^2} > 0" className="text-xs font-mono font-bold" />
          </div>
        </div>
      </div>

      {/* 第二部分：微型实时公式拆解体验沙盒 */}
      <div className="p-4 sm:p-5 rounded-xl border border-stone-200 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-stone-900">
              实时参数公式拆解沙盒 (Interactive Decomposition)
            </span>
          </div>
          <span className="text-[11px] text-stone-400 font-mono">
            微调参数即时观察三大因式占比变化
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* 左侧：输入控制器 */}
          <div className="md:col-span-5 space-y-3.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-700">提前期时滞 L (Lead Time):</span>
                <span className="font-mono font-bold text-stone-900">{calcL} 周期</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={calcL}
                onChange={(e) => setCalcL(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>L=1 (极速物流)</span>
                <span>L=6 (漫长海运)</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-stone-700">预测平滑窗口 p (Smoothing Periods):</span>
                <span className="font-mono font-bold text-stone-900">{calcP} 阶</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={calcP}
                onChange={(e) => setCalcP(Number(e.target.value))}
                className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-stone-900"
              />
              <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                <span>p=2 (激进拟合)</span>
                <span>p=10 (平稳过滤)</span>
              </div>
            </div>
          </div>

          {/* 右侧：实时拆解结果 */}
          <div className="md:col-span-7 p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">当前理论方差放大率 (单级):</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-serif font-bold text-amber-800">
                  {totalBwe.toFixed(2)}x
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono font-semibold">
                  {totalBwe > 3.0 ? "严重震荡" : totalBwe > 1.8 ? "中度放大" : "相对平缓"}
                </span>
              </div>
            </div>

            {/* 三项公式拆解堆叠条 */}
            <div className="space-y-1">
              <div className="h-4 rounded-full overflow-hidden flex text-[10px] font-mono font-bold text-white text-center leading-4">
                <div 
                  style={{ width: `${(itemBase / totalBwe) * 100}%` }} 
                  className="bg-stone-500 truncate px-1"
                  title={`基准项 1: ${(itemBase / totalBwe * 100).toFixed(0)}%`}
                >
                  基准 1.0
                </div>
                <div 
                  style={{ width: `${(itemLinear / totalBwe) * 100}%` }} 
                  className="bg-sky-600 truncate px-1"
                  title={`线性项 2L/p = ${itemLinear.toFixed(2)}: ${(itemLinear / totalBwe * 100).toFixed(0)}%`}
                >
                  线性 {itemLinear.toFixed(2)}
                </div>
                <div 
                  style={{ width: `${(itemQuadratic / totalBwe) * 100}%` }} 
                  className="bg-amber-600 truncate px-1"
                  title={`二次项 2L²/p² = ${itemQuadratic.toFixed(2)}: ${(itemQuadratic / totalBwe * 100).toFixed(0)}%`}
                >
                  二次 {itemQuadratic.toFixed(2)}
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-stone-500 font-mono pt-1">
                <span>基准常数项: <strong>1.00</strong></span>
                <span>线性项 (2L/p): <strong className="text-sky-700">{itemLinear.toFixed(2)}</strong></span>
                <span>二次项 (2L²/p²): <strong className="text-amber-700">{itemQuadratic.toFixed(2)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 第三部分：多级供应链级联累乘定理切片 */}
      <div className="p-4 sm:p-5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3">
        <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2">
          <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-700" />
            3. 多级供应链级联累乘定理 (Multi-Tier Chain Multiplier Effect)
          </span>
          <span className="text-[10px] font-mono text-indigo-700 font-semibold">
            全链几何倍增法则
          </span>
        </div>

        <p className="text-xs text-indigo-900/90 leading-relaxed">
          在多级供应链中，上一级的发出订单直接转为下一级的输入需求信号（即 <KatexMath math="D_{k+1} = O_k" />）。各节点如果均独立预测、独立决策，全网从终端零售至源头原材料商的<strong>总方差放大率呈现乘积级几何膨胀</strong>：
        </p>

        <div className="py-2.5 px-3 rounded-lg bg-white border border-indigo-200 text-center overflow-x-auto">
          <KatexMath 
            math="BWE_{Total} = \frac{\mathrm{Var}(O_K)}{\mathrm{Var}(D_1)} = \prod_{k=1}^K BWE_k \ge \prod_{k=1}^K \left(1 + \frac{2L_k}{p_k} + \frac{2L_k^2}{p_k^2}\right)"
            block={false}
            className="font-bold text-indigo-950 text-xs sm:text-sm"
          />
        </div>

        <div className="p-3 rounded-lg bg-white/80 border border-indigo-200 text-xs text-indigo-950 space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
            <span>级联灾难算例对比：</span>
          </div>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            若当前 4 级供应链中每级放大率为 <strong>{totalBwe.toFixed(2)}x</strong>，则传递至源头原材料供应商时，总方差放大倍数将飙升至：
            <span className="font-mono font-bold text-amber-800 ml-1">
              ({totalBwe.toFixed(2)})⁴ = {cascade4Tiers > 999 ? cascade4Tiers.toExponential(2) : cascade4Tiers.toFixed(1)}x ！
            </span>
            这也是为何终端只有 5% 的微小需求起伏，却能在源头晶圆或高分子树脂厂掀起 300% 停产与爆仓海啸的根本数学成因。
          </p>
        </div>
      </div>
    </div>
  );
};
