import React from 'react';
import { BookOpen, Target, Clock, Zap, Info, ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function KnowledgeBase() {
  const [activeTab, setActiveTab] = React.useState(0);

  const beerGameSummary = "1960年代由MIT研发的经典仿真模型。它模拟由零售、批发、分销及制造组成的四级纵向供应链。深刻揭示了即便终端需求波动极其平稳，仅因系统内不可消除的传递延迟（包括信息流与物流）以及各环节决策者的“信息孤岛”与局部优化困境，需求信号仍会向上游逐级呈指数级放大，即著名的“牛鞭效应（Bullwhip Effect）”。这种破坏性周期震荡本质上是由系统反馈结构而非外部随机因素驱动的。本项目旨在通过实时数据推演，帮助您从全局视角洞察波动的根源并沉浸式探索稳链策略。";

  const sections = [
    {
      icon: <Target className="w-5 h-5 text-emerald-500" />,
      title: "环节订货公式",
      label: "订货",
      content: "节点统一采用补货控制逻辑 O_t = max(0, Target - I_t + Backlog)。决策者需在实时响应下游订单的同时，精准对齐预设的目标库存水位，并对历史累积的未满足需求（欠货）进行缺口对冲。在仿真路径中，受制于物理距离的“信息延迟”导致反馈环路具有天然滞后性。参与者需要深刻理解，这种决策公式在静态环境虽极度高效，但在面临延迟波动的动态环境中，往往会自发成为诱发系统剧烈震荡的放大器，甚至导致库存崩盘。"
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-500" />,
      title: "按单生产逻辑",
      label: "生产",
      content: "生产商严格执行“按单生产（BTO）”敏捷策略：当期接收分销商订单后即刻启动全量生产，并在紧随其后的次期快速发货。此模式不仅实现了生产环节的精益管理，更大幅降低了成品积压导致的资金风险。然而，由于完全舍弃了缓冲库存，该模块在面对下游突发的需求脉冲或库存骤降时表现出极高的脆弱性，交付压力将瞬间传导至整个链条，对供应链的响应速度与生产稳定性提出了近乎苛刻的挑战。"
    },
    {
      icon: <Clock className="w-5 h-5 text-blue-500" />,
      title: "物流时间延迟",
      label: "延迟",
      content: "物流延迟真实模拟了货物在空间位移、分拣装卸及质量检测等物理过程中耗费的刚性时间。即便在数字化时代的今天信息可以瞬间对齐，实物货物的真实流动仍受地理与机械效率限制。这种“信息流”与“实物流”之间的相位差与异步性，是导致供应链产生相位滞后、库存波动及“牛鞭效应”的物理层核心根基。通过本实验模块，您可以系统性量化评估当物流效率提升（延迟缩短）时，整体系统的抗压稳态将呈现何种程度的非线性增强。"
    },
    {
      icon: <Info className="w-5 h-5 text-indigo-500" />,
      title: "实效库存计算",
      label: "库存",
      content: "本系统采用严谨的“全局流量对冲”一致性核算法：实时库存定义为累积进货减去已发货量；而累积欠货（Backlog）则定义为下游累计需求减去实际已发货总量。相比传统的单期期末结算，该模型具有更高的财务透明度与逻辑一致性，能有效防止因订单异常波动导致的审计失真，清晰呈现从库存盈余到欠货堆积的演变过程。理解并实时监控这种累积偏差，是企业实施供应商管理库存（VMI）等高级动态协同策略的不可或缺的基础。"
    }
  ];

  const targetSection = {
    title: "学习考核目标 / Learning Goals",
    items: [
      "微观感知“牛鞭效应”在延迟与非对称决策环境中的产生与放大规律。",
      "验证“按单生产(BTO)”面对需求脉冲或库存骤降时的恢复韧性与断链风险。",
      "掌握基于“流量偏差”的供应链核算法，理解欠货对现金流的系统性影响。",
      "探索通过提高信息透明度与物流效率，从根源平抑波动并优化成本。"
    ]
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group h-full">
      {/* Top Hero Section: Beer Game Summary */}
      <div className="bg-indigo-600 p-6 text-white relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-12 opacity-10 -rotate-12 translate-x-1/4 -translate-y-1/4">
          <BookOpen className="w-48 h-48" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <h2 className="font-black text-xl tracking-tight uppercase">啤酒游戏概要 / Guide</h2>
          </div>
          <p className="text-[14px] text-indigo-100 leading-relaxed font-medium">
            {beerGameSummary}
          </p>
        </div>
      </div>
      
      {/* Slices Navigation */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">知识切片 / Slices</span>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {sections.map((section, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                activeTab === idx 
                  ? "bg-white text-indigo-600 shadow-sm border border-indigo-100" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Active Slice Content */}
      <div className="p-6 bg-white min-h-[140px] shrink-0">
        <div className="flex gap-4 items-start w-full relative">
          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 shrink-0">
            {sections[activeTab].icon}
          </div>
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{sections[activeTab].title}</h3>
                <div className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-bold text-slate-400 uppercase">Module {activeTab + 1}</div>
              </div>
              <p className="text-[15px] text-slate-600 leading-relaxed">
                {sections[activeTab].content}
              </p>
          </div>
        </div>
      </div>

      {/* Persistent Target Section */}
      <div className="mt-auto px-6 py-4 bg-slate-50/50 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-rose-500" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{targetSection.title}</h3>
        </div>
        <ul className="space-y-1.5">
          {targetSection.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[14px] text-slate-500 leading-tight">
              <div className="w-1 h-1 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-6 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> 教学版本: v2.4</span>
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 已锁定: 累积平衡算法</span>
        </div>
        <div className="flex items-center gap-1 text-indigo-600">
          交互型供应链知识图谱 <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
