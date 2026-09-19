/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowRight, 
  RotateCcw, 
  Play, 
  FastForward, 
  Layers, 
  AlertTriangle, 
  HelpCircle,
  PackageCheck
} from "lucide-react";

export const OrderAmplificationModule: React.FC = () => {
  const [activeMechanism, setActiveMechanism] = useState<"forecast" | "batching" | "gaming">("forecast");
  const [stepIndex, setStepIndex] = useState<number>(3);

  // 模拟三种成因的单步演化数据 (完整扩展至 t1 ~ t15 全周期)
  const forecastData = [
    { t: 1, demand: 100, forecast: 100, targetStock: 400, pipeline: 200, inventory: 200, order: 100, note: "稳态运行：终端需求平稳在 100，各方预测平稳" },
    { t: 2, demand: 100, forecast: 100, targetStock: 400, pipeline: 200, inventory: 200, order: 100, note: "基准平衡：在手库存 + 在途管道 = 目标库存 S*=400" },
    { t: 3, demand: 110, forecast: 102, targetStock: 408, pipeline: 200, inventory: 190, order: 118, note: "扰动初现：需求微升 10 个单位，为弥补提前期 L=3 的滞后，订货量被拉升至 118 (+18%)" },
    { t: 4, demand: 115, forecast: 105, targetStock: 420, pipeline: 218, inventory: 185, order: 132, note: "过度修正：移动平均上移带动安全库存上调，订货量攀升至 132 (+32%)，远超实际需求 115" },
    { t: 5, demand: 115, forecast: 109, targetStock: 436, pipeline: 240, inventory: 195, order: 146, note: "波峰冲顶：提前期内累积预测误差放大，向上游释放 146 件的峰值巨量订单" },
    { t: 6, demand: 110, forecast: 110, targetStock: 440, pipeline: 260, inventory: 220, order: 110, note: "需求见顶回落：但前期订货在途管道已严重饱胀，补货开始集中涌入" },
    { t: 7, demand: 100, forecast: 108, targetStock: 432, pipeline: 270, inventory: 250, order: 62, note: "严重超调下挫：前期过度下单的货物陆续到港，库存飙升至 250 爆满，订单瞬间腰斩至 62！" },
    { t: 8, demand: 100, forecast: 105, targetStock: 420, pipeline: 240, inventory: 275, order: 45, note: "深度萧条谷底：库存爆仓（275件），停止补货，订单暴跌至 45，上游工厂面临断崖式停产" },
    { t: 9, demand: 95, forecast: 102, targetStock: 408, pipeline: 190, inventory: 260, order: 56, note: "去库存阵痛：在手库存依靠日常终端消费缓慢消化，下游向上游释放的订单维持在极低位 56" },
    { t: 10, demand: 100, forecast: 100, targetStock: 400, pipeline: 140, inventory: 235, order: 75, note: "消化过剩库存：在途在手物料逐步缩减，目标库存回归基准 400，订单弱势回升至 75" },
    { t: 11, demand: 100, forecast: 99, targetStock: 396, pipeline: 115, inventory: 205, order: 91, note: "库存触及安全线：在手库存降至 205 接近临界点，补货管道基本排空，决策者重新加大下单" },
    { t: 12, demand: 105, forecast: 100, targetStock: 400, pipeline: 110, inventory: 180, order: 115, note: "次级反弹脉冲：库存跌破 200，需求小幅扰动 105，再次诱发恐慌性补库存动作（订货 115）" },
    { t: 13, demand: 100, forecast: 101, targetStock: 404, pipeline: 130, inventory: 185, order: 109, note: "收敛衰减振荡：系统阻尼生效，订单波动幅度大幅收窄至 +9%" },
    { t: 14, demand: 100, forecast: 100, targetStock: 400, pipeline: 170, inventory: 195, order: 104, note: "接近稳态均衡：在手库存 195 与在途 170 逼近稳态目标，订货量向 100 收敛" },
    { t: 15, demand: 100, forecast: 100, targetStock: 400, pipeline: 200, inventory: 200, order: 100, note: "重回基准稳态：经历完整的“过度繁荣-断崖去库-衰减振荡”周期，系统彻底重获平衡" },
  ];

  const batchingData = [
    { t: 1, demand: 25, inventory: 100, threshold: 40, batchSize: 150, order: 0, note: "在库 75，未破再订货点 40，向上游发送 0 订单" },
    { t: 2, demand: 25, inventory: 75, threshold: 40, batchSize: 150, order: 0, note: "在库 50，依旧未触发批量阈值，上游依然看到 0 需求" },
    { t: 3, demand: 30, inventory: 50, threshold: 40, batchSize: 150, order: 150, note: "跌破阈值：在库降至 20 < 40，触发整车 FTL 批量，瞬间抛出 150 大单！" },
    { t: 4, demand: 25, inventory: 140, threshold: 40, batchSize: 150, order: 0, note: "饱腹停滞：大单到货后在库骤升，随后数期订单重新归零" },
    { t: 5, demand: 20, inventory: 115, threshold: 40, batchSize: 150, order: 0, note: "上游工厂困惑：终端真实需求平缓，但接收到的订单在 0 与 150 间剧烈脉冲" },
    { t: 6, demand: 25, inventory: 95, threshold: 40, batchSize: 150, order: 0, note: "在库消耗至 70：持续处于零订货订单真空期，上游设备稼动率骤降" },
    { t: 7, demand: 25, inventory: 70, threshold: 40, batchSize: 150, order: 0, note: "在库 45 临界点：接近阈值 40，上游产线因长达 4 期无订单开始被动减速停工" },
    { t: 8, demand: 30, inventory: 45, threshold: 40, batchSize: 150, order: 150, note: "二次脉冲突袭：在库跌至 15 < 40，再次抛出 150 整车订单，上游猝不及防紧急加班" },
    { t: 9, demand: 25, inventory: 135, threshold: 40, batchSize: 150, order: 0, note: "大批量再次入库：仓储在手库存飙升至 135，订单再次断崖归零进入冰冻期" },
    { t: 10, demand: 25, inventory: 110, threshold: 40, batchSize: 150, order: 0, note: "高额在库资金沉淀：持有成本剧增，批量规则强制压制下游灵活小批量补货" },
    { t: 11, demand: 25, inventory: 85, threshold: 40, batchSize: 150, order: 0, note: "在库持续消化至 60：上游工厂面临严峻的'忽而饥饿、忽而暴食'的设备负荷振荡" },
    { t: 12, demand: 30, inventory: 60, threshold: 40, batchSize: 150, order: 0, note: "在库降至 30 < 40：若遇干线运输延误，下游即将面临瞬时断货缺货风险" },
    { t: 13, demand: 20, inventory: 30, threshold: 40, batchSize: 150, order: 150, note: "三次脉冲触发：下达第 3 轮 150 批量大单，上游出现产能严重拥堵与排单积压" },
    { t: 14, demand: 25, inventory: 160, threshold: 40, batchSize: 150, order: 0, note: "脉冲式牛鞭定型：终端需求方差仅为 12，但向上游传导的订单方差高达 5600+" },
    { t: 15, demand: 25, inventory: 135, threshold: 40, batchSize: 150, order: 0, note: "协同治理启示：改用连续小批量（如引入 Milk-Run 循环取货或 VMI 补库）可彻底熨平脉冲" },
  ];

  const gamingData = [
    { t: 1, realNeed: 100, capacity: 100, allocRatio: "100%", orderPlaced: 100, actualGot: 100, note: "供需均衡：产能充足，下游按需 100 真实下单，上游 100% 完整履约" },
    { t: 2, realNeed: 120, capacity: 100, allocRatio: "80%", orderPlaced: 150, actualGot: 120, note: "短缺信号：上游产能吃紧配额 80%，零售商为拿到 120，故意夸大虚报下单 150" },
    { t: 3, realNeed: 130, capacity: 100, allocRatio: "50%", orderPlaced: 260, actualGot: 130, note: "恐慌升级：传闻供货率降至 50%，各家疯狂双倍下单，上游积压虚假天量排期" },
    { t: 4, realNeed: 140, capacity: 100, allocRatio: "35%", orderPlaced: 400, actualGot: 140, note: "博弈白热化：配给率骤降至 35%，零售商报复性狂下 400 件订单，制造厂误判市场迎来超额繁荣" },
    { t: 5, realNeed: 135, capacity: 120, allocRatio: "40%", orderPlaced: 337, actualGot: 135, note: "盲目扩产：上游制造厂加急租赁厂房添置产线，产能提升至 120，排产虚假繁荣" },
    { t: 6, realNeed: 130, capacity: 160, allocRatio: "65%", orderPlaced: 200, actualGot: 130, note: "新产能释放：新产线上线，配给比例回升至 65%，下游嗅到供应宽松，迅速缩减下单" },
    { t: 7, realNeed: 120, capacity: 200, allocRatio: "100%", orderPlaced: 0, actualGot: 0, note: "泡沫破灭：上游产能猛增至 200，供应完全恢复后，下游瞬间撤销全部虚报订单，排期断崖归 0！" },
    { t: 8, realNeed: 110, capacity: 200, allocRatio: "100%", orderPlaced: 20, actualGot: 20, note: "余震冲击：前期超额囤积的货品压垮下游渠道仓库，下游停止订货，上游订单冰冻仅 20" },
    { t: 9, realNeed: 100, capacity: 200, allocRatio: "100%", orderPlaced: 40, actualGot: 40, note: "严重产能过剩：上游工厂设备稼动率暴跌至 20%，不得不面临裁员与设备闲置巨额亏损" },
    { t: 10, realNeed: 100, capacity: 180, allocRatio: "100%", orderPlaced: 65, actualGot: 65, note: "去产能重组：上游关停部分临时产线，下游渠道库存去化过半，采购订单缓慢回升" },
    { t: 11, realNeed: 100, capacity: 150, allocRatio: "100%", orderPlaced: 85, actualGot: 85, note: "心理创伤修复：上下游重建互信，下游停止双倍重复订货，转为按周刚需采购" },
    { t: 12, realNeed: 100, capacity: 120, allocRatio: "100%", orderPlaced: 95, actualGot: 95, note: "供需重新匹配：上游产能调整至 120（略有弹性），订单量 95 接近稳态" },
    { t: 13, realNeed: 100, capacity: 110, allocRatio: "100%", orderPlaced: 100, actualGot: 100, note: "稳态恢复：真实需求 100，实际发货 100，博弈泡沫完全挤出" },
    { t: 14, realNeed: 100, capacity: 105, allocRatio: "100%", orderPlaced: 100, actualGot: 100, note: "机制治理验证：若建立基于历史销售额配额（Past-sales allocation）即可从根源规避博弈" },
    { t: 15, realNeed: 100, capacity: 100, allocRatio: "100%", orderPlaced: 100, actualGot: 100, note: "协同终局：通过 CPFR 共享真实产能与终实需求，全链信息透明彻底根除虚假博弈订单" },
  ];

  const getCurrentDataset = () => {
    if (activeMechanism === "forecast") return forecastData;
    if (activeMechanism === "batching") return batchingData;
    return gamingData;
  };

  const dataset = getCurrentDataset();
  const currentStepData = dataset[Math.min(stepIndex, dataset.length - 1)];

  return (
    <div className="space-y-6">
      {/* 模块标头切片 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
                模块 03 · 微观解构
              </span>
              <span className="text-xs text-stone-400 font-mono">Microscopic Order Distortion Mechanics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              订单放大演播：三大微观机理单步推演
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-3xl">
              单步解构<strong className="text-stone-800">需求预测更新</strong>、<strong className="text-stone-800">批量订货（Order Batching）</strong>及<strong className="text-stone-800">短缺博弈（Rationing Gaming）</strong>的具体过程，透视订单信息如何从真实需求被逐步扭曲为虚假海啸。
            </p>
          </div>

          {/* 成因切换切片组合 */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 border border-stone-200">
            {[
              { id: "forecast", label: "预测更新放大", sub: "Forecast Overshoot" },
              { id: "batching", label: "批量订货脉冲", sub: "Order Batching" },
              { id: "gaming", label: "短缺博弈泡沫", sub: "Rationing Gaming" },
            ].map((m) => {
              const isSelected = activeMechanism === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setActiveMechanism(m.id as any);
                    setStepIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                    isSelected
                      ? "bg-white text-stone-900 font-semibold shadow-2xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <div>{m.label}</div>
                  <div className="text-[9px] text-stone-400 font-mono">{m.sub}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 单步推演步进器控制器 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mt-4 pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-stone-700">单步推演进度切片:</span>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-semibold">
                t{stepIndex + 1} / t15
              </span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {dataset.map((_, idx) => (
                <button
                  key={idx}
                  id={`step-slice-t${idx + 1}-btn`}
                  onClick={() => setStepIndex(idx)}
                  title={`切换至时步 t${idx + 1}`}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    stepIndex === idx
                      ? "bg-stone-900 text-stone-100 scale-105 shadow-2xs ring-2 ring-stone-900/20"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                  }`}
                >
                  t{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="step-prev-btn"
              onClick={() => setStepIndex(Math.max(0, stepIndex - 1))}
              disabled={stepIndex === 0}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            >
              上一时步
            </button>
            <button
              id="step-next-btn"
              onClick={() => setStepIndex(Math.min(dataset.length - 1, stepIndex + 1))}
              disabled={stepIndex >= dataset.length - 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-900 text-stone-100 hover:bg-stone-800 disabled:opacity-40 flex items-center gap-1 shadow-2xs cursor-pointer disabled:cursor-not-allowed"
            >
              <span>单步推进</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
            <button
              id="step-reset-btn"
              onClick={() => setStepIndex(0)}
              className="p-1.5 text-xs rounded-lg text-stone-500 hover:bg-stone-100 border border-stone-200 cursor-pointer"
              title="重置推演回 t1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 微观机理流程图解切片 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-700" />
            <span>当前时步 (t = {stepIndex + 1}) 微观信号失真链路</span>
          </h3>
          <span className="text-xs text-stone-500 font-mono">
            微观机理: {activeMechanism === "forecast" ? "移动平均时滞过度修正" : activeMechanism === "batching" ? "(s, S) 周期阈值脉冲" : "配额打折双倍虚假下单"}
          </span>
        </div>

        {/* 动态可视化信号卡片拓扑 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* 环节 1: 真实终端需求 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 relative">
            <div className="text-[10px] text-stone-400 font-mono">环节 1: 市场真实</div>
            <div className="text-xs font-bold text-stone-800 mt-1">终端顾客消耗</div>
            <div className="text-2xl font-mono font-bold text-teal-800 mt-2">
              {"demand" in currentStepData ? currentStepData.demand : (currentStepData as any).realNeed}
              <span className="text-xs font-normal text-stone-500 ml-1">件/周</span>
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              平稳低频变动，反映真实消费行为
            </div>
          </div>

          {/* 环节 2: 决策层修正 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 relative">
            <div className="text-[10px] text-stone-400 font-mono">环节 2: 算法/决策规则</div>
            <div className="text-xs font-bold text-stone-800 mt-1">
              {activeMechanism === "forecast" ? "平滑预测与目标库存" : activeMechanism === "batching" ? "再订货阈值判定" : "感知供需配额率"}
            </div>
            <div className="text-xl font-mono font-bold text-stone-800 mt-2">
              {activeMechanism === "forecast" ? `S* = ${(currentStepData as any).targetStock}` : activeMechanism === "batching" ? `在库 ${(currentStepData as any).inventory} ≤ ${(currentStepData as any).threshold}` : `供应配额 ${(currentStepData as any).allocRatio}`}
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              时滞乘数与配额假定驱动心理扭曲
            </div>
          </div>

          {/* 环节 3: 订货量输出 */}
          <div className="p-4 rounded-xl border border-stone-300 bg-amber-50/40 relative">
            <div className="text-[10px] text-amber-700 font-mono">环节 3: 最终订货输出</div>
            <div className="text-xs font-bold text-amber-900 mt-1">向上一级下达订单</div>
            <div className="text-2xl font-mono font-bold text-amber-700 mt-2">
              {"order" in currentStepData ? currentStepData.order : (currentStepData as any).orderPlaced}
              <span className="text-xs font-normal text-amber-700 ml-1">件</span>
            </div>
            <div className="text-[11px] text-amber-800 mt-1">
              相较真实需求严重偏离失真
            </div>
          </div>

          {/* 环节 4: 诊断解构提示 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-stone-100/80 flex flex-col justify-between">
            <div>
              <div className="text-[10px] text-stone-500 font-mono">运筹审计诊断</div>
              <div className="text-xs font-semibold text-stone-800 mt-1">微观扭曲成因：</div>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                {currentStepData.note}
              </p>
            </div>
            <div className="mt-2 text-[10px] text-stone-400 font-mono">
              Step {stepIndex + 1} of {dataset.length}
            </div>
          </div>
        </div>

        {/* 演播历史账本切片表格 */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-stone-700 mb-2">时序演化账本切片 (Micro Ledger)</div>
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-100 text-stone-600 font-semibold border-b border-stone-200">
                  <th className="py-2.5 px-3">时步 (t)</th>
                  <th className="py-2.5 px-3">真实需求</th>
                  <th className="py-2.5 px-3">中间关键指标</th>
                  <th className="py-2.5 px-3">最终下达订单</th>
                  <th className="py-2.5 px-3">放大偏离度</th>
                  <th className="py-2.5 px-3">运筹机理解析</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {dataset.map((row: any, idx) => {
                  const isCurrent = idx === stepIndex;
                  const real = row.demand ?? row.realNeed;
                  const ord = row.order ?? row.orderPlaced;
                  const delta = ord - real;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setStepIndex(idx)}
                      className={`cursor-pointer transition-colors ${
                        isCurrent ? "bg-stone-100 font-medium" : "hover:bg-stone-50/70"
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono">
                        <span className={`px-1.5 py-0.5 rounded ${isCurrent ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-700"}`}>
                          t{row.t}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-800">{real}</td>
                      <td className="py-2.5 px-3 font-mono text-stone-600">
                        {row.forecast ? `预测 ${row.forecast} | 目标S ${row.targetStock}` : row.threshold ? `在库 ${row.inventory} (阈值${row.threshold})` : `配给率 ${row.allocRatio}`}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-700">{ord}</td>
                      <td className="py-2.5 px-3 font-mono">
                        <span className={delta > 0 ? "text-red-600" : delta < 0 ? "text-sky-600" : "text-stone-400"}>
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 truncate max-w-xs">{row.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
