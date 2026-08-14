import React from 'react';
import { Calculator, Sigma, TrendingUp, Box } from 'lucide-react';

export function FormulasModule() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-slate-900">供应链管理核心公式</h3>
      </div>
      
      <div className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Box className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-700">订货量计算 (Order-Up-To)</span>
          </div>
          <p className="text-sm font-mono text-blue-700 bg-white p-2 rounded border border-blue-50">
            O_t = max(0, Target - Inv_t + Backlog_t)
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            其中 Target = 预期需求 × 提前期 + 安全库存
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Sigma className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-slate-700">需求/订单方差 (Variance)</span>
          </div>
          <p className="text-sm font-mono text-purple-700 bg-white p-2 rounded border border-purple-50">
            σ² = Σ(x_i - μ)² / n
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            方差越大，代表需求或订单的不确定性越高。
          </p>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-red-600" />
            <span className="text-xs font-semibold text-slate-700">牛鞭效应放大倍数 (Amplification)</span>
          </div>
          <p className="text-sm font-mono text-red-700 bg-white p-2 rounded border border-red-50">
            B = σ²_order / σ²_demand
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            当 B &gt; 1 时，存在牛鞭效应。B 越大，波动放大越剧烈。
          </p>
        </div>
      </div>
    </div>
  );
}
