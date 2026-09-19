/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CASE_STUDIES } from "../../utils/constants";
import { CaseStudyItem } from "../../types";
import { 
  Building2, 
  Calendar, 
  Tag, 
  Quote, 
  TrendingDown, 
  CheckCircle2, 
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { HuaweiSupplyChainFlowAnimation } from "./HuaweiSupplyChainFlowAnimation";

export const CaseStudiesModule: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("pg-pampers");

  const currentCase = CASE_STUDIES.find((c) => c.id === selectedCaseId) || CASE_STUDIES[0];

  return (
    <div className="space-y-6">
      {/* 模块引言切片 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
                模块 05 · 实战决策
              </span>
              <span className="text-xs text-stone-400 font-mono">Four Classic & Modern Industrial Cases</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              四大案例剖析：从快消、零售到半导体高端旗舰
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-3xl">
              深度还原宝洁帮宝适、沃尔玛 EDLP 战略、MIT 啤酒游戏及华为高端旗舰集成供应链真实博弈事件，实现学术理论与全球一流商业实践的深度对齐。
            </p>
          </div>
        </div>

        {/* 四大案例切片卡片选择器 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {CASE_STUDIES.map((c) => {
            const isSelected = selectedCaseId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? "bg-stone-900 text-white border-stone-900 shadow-xs ring-1 ring-stone-900/10"
                    : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-white text-stone-700"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] opacity-75 mb-1 font-mono">
                  <span>{c.year}</span>
                  <span className="truncate max-w-[90px]">{c.industry}</span>
                </div>
                <div className="font-semibold text-sm line-clamp-1">{c.title}</div>
                <div className={`text-xs mt-1 line-clamp-2 ${isSelected ? "text-stone-300" : "text-stone-500"}`}>
                  {c.company}
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 案例深度剖析详情切片 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：案例诊断、机理复盘与解决方案 */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-5">
            {/* 案头概要 */}
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-stone-500 mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>{currentCase.company}</span>
                <span>·</span>
                <Calendar className="w-3.5 h-3.5" />
                <span>{currentCase.year}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-900">
                {currentCase.title}
              </h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed bg-stone-50/70 p-3.5 rounded-xl border border-stone-100">
                {currentCase.summary}
              </p>
            </div>

            {/* 痛点症状与深层病灶 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-red-200/80 bg-red-50/30 space-y-1">
                <div className="text-xs font-semibold text-red-900">表面灾难性症状 (Symptoms)</div>
                <p className="text-xs text-red-800/90 leading-relaxed">
                  {currentCase.symptom}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30 space-y-1">
                <div className="text-xs font-semibold text-amber-900">本质根本诱因 (Root Cause)</div>
                <p className="text-xs text-amber-800/90 leading-relaxed">
                  {currentCase.rootCause}
                </p>
              </div>
            </div>

            {/* 级联传导机制四步清单 */}
            <div>
              <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider mb-2.5">
                供应链传导与扭曲机制剖析 (Cascading Chain)
              </h4>
              <div className="space-y-2">
                {currentCase.mechanism.map((m, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-stone-50/60 border border-stone-200/60 text-xs text-stone-700 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 工业界破局解决方案 */}
            <div className="p-4 rounded-xl border border-teal-200/80 bg-teal-50/40">
              <div className="text-xs font-semibold text-teal-900 flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                工业级破局对策与实施路径 (Solution & Implementation)
              </div>
              <p className="text-xs text-teal-900/90 leading-relaxed">
                {currentCase.solution}
              </p>
            </div>
          </div>
        </div>

        {/* 右侧：实战量化成果切片与经典箴言 */}
        <div className="lg:col-span-4 space-y-4">
          {/* 量化审计成效卡 */}
          <div className="rounded-2xl bg-white border border-stone-200 p-5 shadow-2xs space-y-4">
            <h4 className="text-xs font-semibold text-stone-800 border-b border-stone-100 pb-2.5">
              实战量化平抑审计指标
            </h4>

            <div className="space-y-3">
              {currentCase.impactMetrics.map((met, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200/80">
                  <div className="text-xs text-stone-500 font-medium">{met.label}</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs text-red-600 line-through font-mono">
                        {met.before}
                      </span>
                      <span className="text-xs text-stone-400">➔</span>
                      <span className="text-lg font-mono font-bold text-teal-800">
                        {met.after}
                      </span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600 font-mono">
                      {met.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 战略箴言引用卡 */}
            <div className="p-4 rounded-xl bg-stone-900 text-stone-200 text-xs leading-relaxed relative overflow-hidden">
              <Quote className="w-8 h-8 text-stone-700 absolute -bottom-1 -right-1 opacity-40" />
              <p className="font-serif italic relative z-10 text-stone-100">
                {currentCase.quotes}
              </p>
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentCase.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部全景动态图：华为手机供应链全环节实体运作仿真动画 */}
      <HuaweiSupplyChainFlowAnimation />
    </div>
  );
};
