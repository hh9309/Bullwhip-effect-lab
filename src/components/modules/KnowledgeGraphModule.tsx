/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { KNOWLEDGE_NODES } from "../../utils/constants";
import { KnowledgeNode } from "../../types";
import { 
  Network, 
  BookOpen, 
  HelpCircle, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  Zap, 
  ArrowRightLeft,
  Share2,
  GitPullRequest,
  Calculator,
  LayoutGrid
} from "lucide-react";
import { KatexMath, InlineMathText } from "../common/KatexRenderer";
import { SupplyChainTopologySlice } from "./knowledge/SupplyChainTopologySlice";
import { EchelonMechanismsSlice } from "./knowledge/EchelonMechanismsSlice";
import { BweCalculationSlice } from "./knowledge/BweCalculationSlice";

export const KnowledgeGraphModule: React.FC = () => {
  // 切片视图选择状态
  const [activeSliceTab, setActiveSliceTab] = useState<"all" | "topology" | "mechanisms" | "bwe" | "causes">("all");
  
  // 成因与对策切片内部状态
  const [selectedNodeId, setSelectedNodeId] = useState<string>("cause-forecast");
  const [filterCategory, setFilterCategory] = useState<"all" | "cause" | "remedy">("all");

  const currentNode = KNOWLEDGE_NODES.find((n) => n.id === selectedNodeId) || KNOWLEDGE_NODES[0];

  const causes = KNOWLEDGE_NODES.filter((n) => n.category === "cause");
  const remedies = KNOWLEDGE_NODES.filter((n) => n.category === "remedy");

  const glossaryItems = [
    { term: "BWE (Bullwhip Effect)", desc: "牛鞭效应方差放大系数，定义为发出订单方差与接收需求方差之比 Var(O) / Var(D)。" },
    { term: "Order-up-to (s, S)", desc: "基本库存补货策略，当库存低于点 s 时，下达订单补齐至目标水位 S。" },
    { term: "EOQ (经济订货批量)", desc: "平衡单次固定订购成本与单位货物持有成本的最优单次订货量。" },
    { term: "Cross-Docking (越库配送)", desc: "在配送中心不进行入库存储，到货后直接在分拣平台分装转运出库，极致压缩提前期 L。" },
    { term: "Milk-Run (循环取货)", desc: "一辆卡车按固定线路依次走访多个供应商拼载取货，以小批量高频次取代各自独立的整车堆积。" },
    { term: "Phantom Orders (虚假订单)", desc: "下游企业在短缺配给预期下故意夸大、事后无成本取消的泡沫采购订单。" },
  ];

  return (
    <div className="space-y-6">
      {/* 模块主顶栏与切片导航 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
                模块 09 · 知识导引与图谱
              </span>
              <span className="text-xs text-stone-400 font-mono">Supply Chain Mechanics & Knowledge Slices</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              知识导引与图谱：供应链结构、订货机制与方差放大理论
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-4xl leading-relaxed">
              以精炼切片系统解构<strong className="text-stone-800">供应链拓扑结构</strong>、<strong className="text-stone-800">各环节订货机制与需求分布</strong>、<strong className="text-stone-800">方差放大率 (BWE) 严谨数学算理</strong>与李效良教授四大成因对策治理网络。
            </p>
          </div>

          {/* 切片快速切换器 */}
          <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-xl text-xs font-medium shrink-0 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSliceTab("all")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeSliceTab === "all" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>全景通览</span>
            </button>
            <button
              onClick={() => setActiveSliceTab("topology")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeSliceTab === "topology" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-stone-700" />
              <span>切片01·结构图</span>
            </button>
            <button
              onClick={() => setActiveSliceTab("mechanisms")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeSliceTab === "mechanisms" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5 text-teal-700" />
              <span>切片02·环节机制</span>
            </button>
            <button
              onClick={() => setActiveSliceTab("bwe")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeSliceTab === "bwe" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-700" />
              <span>切片03·BWE计算</span>
            </button>
            <button
              onClick={() => setActiveSliceTab("causes")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeSliceTab === "causes" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-rose-700" />
              <span>切片04·成因对策</span>
            </button>
          </div>
        </div>
      </div>

      {/* 切片 01: 供应链拓扑结构图 */}
      {(activeSliceTab === "all" || activeSliceTab === "topology") && (
        <SupplyChainTopologySlice />
      )}

      {/* 切片 02: 各环节订货机制与需求 */}
      {(activeSliceTab === "all" || activeSliceTab === "mechanisms") && (
        <EchelonMechanismsSlice />
      )}

      {/* 切片 03: 方差放大率 (BWE) 计算推导 */}
      {(activeSliceTab === "all" || activeSliceTab === "bwe") && (
        <BweCalculationSlice />
      )}

      {/* 切片 04: 李效良四大经典成因与对策治理知识库 */}
      {(activeSliceTab === "all" || activeSliceTab === "causes") && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
                    切片 04 · 成因对策
                  </span>
                  <span className="text-xs text-stone-400 font-mono">Lee et al. 1997 Root Causes & Countermeasures</span>
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
                  四大经典成因与系统对策知识图谱
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  预测更新、批量订货、价格波动与短缺博弈的因果机理及工程落地破局方案。
                </p>
              </div>

              {/* 筛选胶囊 */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium shrink-0">
                <button
                  onClick={() => setFilterCategory("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterCategory === "all" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600"
                  }`}
                >
                  全部
                </button>
                <button
                  onClick={() => setFilterCategory("cause")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterCategory === "cause" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600"
                  }`}
                >
                  成因
                </button>
                <button
                  onClick={() => setFilterCategory("remedy")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filterCategory === "remedy" ? "bg-white text-stone-900 shadow-2xs font-semibold" : "text-stone-600"
                  }`}
                >
                  对策
                </button>
              </div>
            </div>

            {/* 成因对策映射矩阵 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              {/* 左侧：四大成因 */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    四大核心成因 (Root Causes)
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">4 诱因</span>
                </div>
                <div className="space-y-2">
                  {causes.map((c) => {
                    const isSelected = selectedNodeId === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedNodeId(c.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white border-stone-900 shadow-xs ring-1 ring-stone-900/10"
                            : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900">{c.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-900 font-mono">
                            成因
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                          {c.subtitle}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 右侧：四大对策 */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    破局对策矩阵 (Countermeasures)
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">4 路径</span>
                </div>
                <div className="space-y-2">
                  {remedies.map((r) => {
                    const isSelected = selectedNodeId === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedNodeId(r.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white border-stone-900 shadow-xs ring-1 ring-stone-900/10"
                            : "bg-stone-50/60 border-stone-200 hover:border-stone-300 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900">{r.title}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100/70 text-teal-900 font-mono">
                            对策
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500 mt-1 line-clamp-1">
                          {r.subtitle}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 选中节点深度解析与术语词典 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 当前节点深度卡片 */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {currentNode.category === "cause" ? "理论诱因剖析" : "工程落地对策"}
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-1.5">
                      {currentNode.title}
                    </h3>
                  </div>
                  {currentNode.mathFormula && (
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-stone-400 font-mono block mb-1">代表性数学公式 (KaTeX)</span>
                      <div className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-900 border border-stone-200 inline-block">
                        <KatexMath math={currentNode.mathFormula} className="text-xs font-medium" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-stone-600 leading-relaxed bg-stone-50/70 p-4 rounded-xl border border-stone-100">
                  <InlineMathText text={currentNode.description} />
                </div>

                <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-1">
                  <div className="text-xs font-semibold text-teal-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                    核心行动路径与干预抓手
                  </div>
                  <p className="text-xs text-teal-900/90 leading-relaxed">
                    {currentNode.keyAction}
                  </p>
                </div>
              </div>
            </div>

            {/* 右侧：专业术语速查词典 */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-white border border-stone-200 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <h4 className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-stone-600" />
                    运筹学经典术语词典速查
                  </h4>
                  <span className="text-[10px] text-stone-400 font-mono">Glossary</span>
                </div>

                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {glossaryItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                      <div className="font-mono font-bold text-stone-800">{item.term}</div>
                      <p className="text-stone-600 mt-1 text-[11px] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
