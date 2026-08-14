import { Calculator, Sigma, TrendingUp, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { SimulationState } from '@/lib/simulation';

interface FormulaModuleProps {
  config: SimulationState['config'];
}

export function FormulaModule({ config }: FormulaModuleProps) {
  return (
    <div className="bg-white pt-8 pb-8 px-8 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Calculator className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">供应链核心公式集成</h2>
      </div>

      <div className="space-y-6">
        {/* Order Quantity */}
        <div className="group">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>订货量计算 (Order-Up-To)</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg font-mono text-[11px] text-slate-800 border border-slate-100 group-hover:border-blue-200 transition-colors">
            O_t = max(0, Target - Inv + Backlog) 
            <span className="block text-[8px] text-indigo-500 mt-1">* 生产商产出取决于上期收到的下游需求总量</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Target = (预期需求 × {config.baseLeadTime + 1}) + 安全库存
            <span className="block text-blue-500">* 当前物流延迟 L={config.baseLeadTime}，信息延迟 D={config.orderDelay}</span>
          </p>
        </div>

        {/* Variance */}
        <div className="group">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Sigma className="w-4 h-4 text-purple-500" />
            <span>需求方差 (Variance)</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg font-mono text-[11px] text-slate-800 border border-slate-100 group-hover:border-purple-200 transition-colors">
            σ² = Σ(x_i - μ)² / n
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            衡量波动核心指标，方差越大，供应链不确定性越高。
          </p>
        </div>

        {/* Bullwhip Effect */}
        <div className="group">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Info className="w-4 h-4 text-emerald-500" />
            <span>库存与欠货 (Inv & Backlog)</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg font-mono text-[11px] text-slate-800 border border-slate-100 group-hover:border-emerald-200 transition-colors">
            Inv = (初始 + 累计进货) - 累计发货
            <span className="block text-[8px] mt-1 font-bold text-red-500">Backlog = 累计需求 - 累计发货</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            基于累计流量差额的一致性核算逻辑。
          </p>
        </div>

        {/* Amplification */}
        <div className="group">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
            <Info className="w-4 h-4 text-rose-500" />
            <span>牛鞭倍数 (Amplification)</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg font-mono text-[11px] text-slate-800 border border-slate-100 group-hover:border-rose-200 transition-colors">
            B = Var(Orders) / Var(Demand)
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            B &gt; 1 表示需求放大，比值越大系统波动越剧烈。
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[10px] text-amber-700 leading-relaxed">
            提示：在仿真中，我们使用的是朴素预测法（Naive Forecast），即假设下一期需求等于本期需求。
          </p>
        </div>
      </div>
    </div>
  );
}
