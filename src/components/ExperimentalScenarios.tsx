import React from 'react';
import { FlaskConical, Info, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

export function ExperimentalScenarios() {
  const scenarios = [
    {
      id: 1,
      title: "场景 1: 双11脉冲",
      subtitle: "核心目标：测试供应链在需求极端峰值下的瞬时吞吐与恢复能力。",
      description: "点击“市场突发状况”模块中的“需求暴增”，模拟突发性市场脉冲对整个供应链分销环节的冲击。",
      success: "成功标准: 在波动平复前，全链条各级成员均需保持正库存（不出现持续欠货）。",
      color: "bg-indigo-50 border-indigo-100 text-indigo-700",
      iconColor: "text-indigo-500",
      accent: "bg-indigo-500"
    },
    {
      id: 2,
      title: "场景 2: 物流运输危机",
      subtitle: "核心挑战：应对长周期物理延迟导致的供应断裂与补货滞后感。",
      description: "调节控制面板将“物流延迟 (L)”设为 4，观察由于长提前期导致的补货枯竭，体验供应链对实物延迟的失控感。",
      success: "成功标准: 通过前期备货或动态调整，将全链条的累计欠货量控制在 100 单位以内。",
      color: "bg-amber-50 border-amber-100 text-amber-700",
      iconColor: "text-amber-500",
      accent: "bg-amber-500"
    },
    {
      id: 3,
      title: "场景 3: 信息孤岛挑战",
      subtitle: "核心挑战：在极度滞后的反馈循环中维持库存稳态，避免决策共振。",
      description: "调节控制面板将“信息延迟 (D)”设为 4，模拟信息严重滞后的环境。尝试通过稳健的订货策略对抗“过时需求”引发的波动。",
      success: "成功标准: 最终统计数据中，生产商的订货波动方差需显著小于零售商的需求方差（实现反牛鞭效应）。",
      color: "bg-emerald-50 border-emerald-100 text-emerald-700",
      iconColor: "text-emerald-500",
      accent: "bg-emerald-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 translate-x-1/4 -translate-y-1/4">
          <FlaskConical className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
            <FlaskConical className="w-4 h-4 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-300">SCM 实验沙盘 / Experimental Sandbox</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">模拟实验场景挑战</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            欢迎来到实验模拟区。在这里，我们预设了现实供应链中可能遇到的极端环境。
            请根据场景描述操作顶部的<strong>参数控制面板</strong>，挑战在波动中寻找平衡。
          </p>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((scenario, idx) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`flex flex-col rounded-2xl border ${scenario.color} overflow-hidden shadow-sm group hover:shadow-md transition-all`}
          >
            <div className="p-6 space-y-4 flex-grow">
              <div className="flex items-center justify-between">
                <div className={`p-2 bg-white rounded-xl shadow-sm ${scenario.iconColor}`}>
                  <FlaskConical className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase transparency-50">Challenge {scenario.id}</span>
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-lg text-slate-900">{scenario.title}</h3>
                <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">{scenario.subtitle}</p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {scenario.description}
              </p>
            </div>
            
            <div className="px-6 py-4 bg-white/50 border-t border-inherit flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${scenario.accent}`} />
                <p className="text-xs font-bold text-slate-700 leading-tight">
                  {scenario.success}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">
                操作建议 <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 shrink-0">
          <Info className="w-6 h-6 text-orange-500" />
        </div>
        <div className="space-y-1">
          <h4 className="font-black text-slate-900">实验策略提示</h4>
          <p className="text-sm text-slate-500 leading-relaxed max-w-4xl">
            在供应链管理中，<strong>“减少不确定性”</strong>和<strong>“缩短提前期”</strong>是抗衡波动的核心。
            当您在场景 2 中面临长延迟时，尝试观察是否有任何方法可以提前预知下游需求。
            在场景 3 中，观察当信息不对称时，各环节决策的独立性如何通过“反应过度”导致系统性崩溃。
          </p>
        </div>
      </div>
    </div>
  );
}
