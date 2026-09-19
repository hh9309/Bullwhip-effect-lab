/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LAB_MODULES } from "../../utils/constants";
import { ModuleId, LabTier } from "../../types";
import { 
  Boxes, 
  Sparkles, 
  BookOpen, 
  RotateCcw,
  Layers
} from "lucide-react";

interface HeaderProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  onReset: () => void;
  currentBwe: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onSelectModule,
  onReset,
  currentBwe,
}) => {
  const sortedModules = [...LAB_MODULES].sort((a, b) => a.number - b.number);

  const tiers: { key: LabTier; name: string; desc: string; icon: any }[] = [
    { key: "algebra-sim", name: "底层：代数与仿真", desc: "理论代数推导与系统动力学反馈", icon: Boxes },
    { key: "interaction-playback", name: "中层：交互与演播", desc: "2D级联沙盒与订单微观失真", icon: Sparkles },
    { key: "practice-decision", name: "顶层：实战与决策", desc: "四大工业案例、AI决策与报告", icon: BookOpen },
  ];

  return (
    <header className="border-b border-stone-200 bg-stone-50/95 backdrop-blur-xs sticky top-0 z-40">
      {/* 顶栏主标题与9大切片导航 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 space-y-2">
        {/* 主标题第一行：左侧实验室名称 + 最右侧理论方差放大率与重置实验 */}
        <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-serif font-bold text-base sm:text-lg shadow-xs shrink-0">
              鞭
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-serif font-bold tracking-tight text-stone-900 whitespace-nowrap">
                牛鞭效应实验室
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700 font-medium hidden sm:inline-block">
                Bullwhip Lab v3.8
              </span>
            </div>
          </div>

          {/* 第一行最右侧：理论方差放大率 (BWE) 指标卡 + 重置实验按钮 */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg border border-stone-200 bg-white shadow-2xs">
              <span className="text-xs text-stone-500 font-medium whitespace-nowrap">理论方差放大率 (BWE):</span>
              <span className={`text-sm font-mono font-bold ${currentBwe > 3 ? "text-amber-700" : "text-teal-700"}`}>
                {currentBwe.toFixed(2)}x
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-mono whitespace-nowrap">
                {currentBwe > 4 ? "高危震荡" : currentBwe > 2 ? "中度放大" : "受控状态"}
              </span>
            </div>

            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 border border-stone-200 bg-stone-100/80 transition-colors cursor-pointer shrink-0"
              title="重置仿真实验环境"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置实验</span>
            </button>
          </div>
        </div>

        {/* 主标题第二行：9个切片完整平铺在一行（已去除‘9大切片：’和副标题描述） */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
          {sortedModules.map((mod) => {
            const isSelected = activeModule === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => onSelectModule(mod.id)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
                  isSelected
                    ? "bg-stone-900 text-white font-semibold shadow-2xs ring-1 ring-stone-900"
                    : "bg-white text-stone-700 hover:bg-stone-200/70 hover:text-stone-900 border border-stone-200"
                }`}
                title={`第 0${mod.number} 切片 · ${mod.name}（${mod.tierName}）`}
              >
                <span
                  className={`font-mono text-[11px] ${
                    isSelected ? "text-amber-300 font-bold" : "text-stone-400"
                  }`}
                >
                  0{mod.number}
                </span>
                <span>{mod.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3层架构矩阵与9大核心模块切片选择器 */}
      <div className="border-t border-stone-200/80 bg-stone-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {tiers.map((tier) => {
              const modulesInTier = LAB_MODULES.filter((m) => m.tier === tier.key);
              const isTierActive = modulesInTier.some((m) => m.id === activeModule);

              return (
                <div
                  key={tier.key}
                  className={`rounded-xl p-2 transition-all border ${
                    isTierActive
                      ? "bg-white border-stone-300 shadow-2xs"
                      : "bg-stone-100/60 border-stone-200/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isTierActive ? "bg-teal-600" : "bg-stone-400"
                        }`}
                      />
                      {tier.name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {modulesInTier.length} 模块
                    </span>
                  </div>

                  {/* 模块切片按钮组合 */}
                  <div className="flex flex-wrap gap-1">
                    {modulesInTier.map((mod) => {
                      const isSelected = activeModule === mod.id;
                      return (
                        <button
                          key={mod.id}
                          onClick={() => onSelectModule(mod.id)}
                          className={`flex-1 min-w-[120px] text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between gap-1.5 ${
                            isSelected
                              ? "bg-stone-900 text-white font-medium shadow-xs"
                              : "bg-white/80 text-stone-700 hover:bg-stone-200/70 border border-stone-200/80"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className={`w-4 h-4 rounded text-[10px] font-mono flex items-center justify-center shrink-0 font-bold ${
                                isSelected
                                  ? "bg-stone-800 text-stone-200"
                                  : "bg-stone-100 text-stone-600"
                              }`}
                            >
                              {mod.number}
                            </span>
                            <span className="truncate">{mod.name}</span>
                          </div>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded shrink-0 font-mono ${
                              isSelected
                                ? "bg-stone-800 text-stone-300"
                                : "bg-stone-100 text-stone-500"
                            }`}
                          >
                            {mod.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
