/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Store, 
  Building2, 
  Truck, 
  Factory, 
  Pickaxe, 
  GitBranch, 
  Sliders, 
  Calculator, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  BarChart3
} from "lucide-react";
import { KatexMath, InlineMathText } from "../../common/KatexRenderer";

interface EchelonMechanismItem {
  id: string;
  echelonName: string;
  echelonRole: string;
  icon: React.ElementType;
  color: string;
  demandProfile: {
    type: string;
    nature: string;
    frequency: string;
    volatilityDescription: string;
    formula: string;
  };
  orderingPolicy: {
    name: string;
    model: string;
    trigger: string;
    formula: string;
    explanation: string;
  };
  safetyStockLogic: {
    name: string;
    formula: string;
    mechanism: string;
  };
  distortionSource: string;
  remedyStrategy: string;
}

const ECHELON_MECHANISMS: EchelonMechanismItem[] = [
  {
    id: "retailer",
    echelonName: "零售商 (Retailer)",
    echelonRole: "直接面对终端个人或家庭消费，处于供应链末梢感应端",
    icon: Store,
    color: "teal",
    demandProfile: {
      type: "终端独立随机需求 (Independent Demand)",
      nature: "分散个体日常消费，服从独立同分布 D_t \\sim \\mathcal{N}(\\mu, \\sigma^2)",
      frequency: "高频、小额、日度连续客流",
      volatilityDescription: "基础随机白噪声，波动幅度一般较低 (CV ≈ 10% - 25%)",
      formula: "D_t = \\mu + \\epsilon_t, \\quad \\epsilon_t \\sim \\mathcal{N}(0, \\sigma^2)",
    },
    orderingPolicy: {
      name: "周期性目标库存补货策略 (Order-up-to / R, S)",
      model: "每隔 R 周期盘点一次，下达订单补齐至动态浮动的目标库存水位 S_t",
      trigger: "周期结算点到达，根据移动平均预测更新 \\hat{D}_t 重新计算 S_t",
      formula: "O_t = D_{t-1} + (L+1)(\\hat{D}_t - \\hat{D}_{t-1})",
      explanation: "订货不仅要补足上一期的实际售出消耗量 D_{t-1}，还必须叠加由于提前期乘数 (L+1) 放大后的预测更新差额修正项。",
    },
    safetyStockLogic: {
      name: "提前期服务水平安全库存",
      formula: "SS = z \\cdot \\sigma \\sqrt{L+1}",
      mechanism: "覆盖补货提前期 L 与盘点周期内的需求标准差，z 为正态分布服务水平分位数。",
    },
    distortionSource: "短期折扣促销导致的前瞻性购买 (Forward Buying) 与平滑预测窗口过小引起的目标线高频振荡。",
    remedyStrategy: "实行天天平价 (EDLP)、缩短提前期并推行 VMI (供应商管理库存)。",
  },
  {
    id: "wholesaler",
    echelonName: "批发商 (Wholesaler)",
    echelonRole: "汇集区域内数十家零售门店的补货订单，履行区域缓冲与仓储调配",
    icon: Building2,
    color: "sky",
    demandProfile: {
      type: "下游零售订单总和 (Lumpy / Aggregated Demand)",
      nature: "离散脉冲型需求，零售商只有在存货见底或凑单时才集中爆发下单",
      frequency: "周度或双周度，间歇性突增",
      volatilityDescription: "方差显著高于终端消费，出现周期性波峰波谷",
      formula: "D_{W, t} = \\sum_{k=1}^M O_{retailer, k, t}",
    },
    orderingPolicy: {
      name: "经济订货批量连续盘点策略 (s, Q / EOQ Policy)",
      model: "当可用库存下降至再订货点 s 时，以固定的经济订货批量 Q 下达采购单",
      trigger: "库存头寸 IP_t = I_t + 在途 - 欠交 \\le s",
      formula: "Q^* = \\sqrt{\\frac{2 D_W K}{h}}, \\quad s = \\hat{D}_W \\cdot L_W + SS_W",
      explanation: "为了摊薄固定的跨区订货作业与分拣成本 K，强制设定起订门槛 Q，将零售端的连续需求切片为离散阶跃脉冲。",
    },
    safetyStockLogic: {
      name: "再订货点安全裕量",
      formula: "SS_W = z \\cdot \\sigma_{D_W} \\sqrt{L_W}",
      mechanism: "针对下游离散脉冲订单的不确定性，设置高额防护垫，防止下游多家门店同时突击下单导致击穿。",
    },
    distortionSource: "订货批量合并效应 (Order Batching)；多家零售商订货周期出现同频共振。",
    remedyStrategy: "推广循环取货 (Milk-Run)、EDI 自动化小批量多频次传输、联合补货降低固定成本 K。",
  },
  {
    id: "distributor",
    echelonName: "分销商 (Distributor)",
    echelonRole: "跨省干线调配与多区域仓储中枢，受制于公路/铁路干线运输装载率",
    icon: Truck,
    color: "indigo",
    demandProfile: {
      type: "干线多仓聚合需求 (Regional Trunk Demands)",
      nature: "高阶跃、大方差，呈现高度非线性的突增突降",
      frequency: "半月或月度大宗调拨",
      volatilityDescription: "方差放大比通常达到零售端的 2.5 ~ 3.5 倍以上",
      formula: "D_{D, t} = \\text{Pulse}(t, T_{cycle}) \\times \\sum Q_{wholesaler}",
    },
    orderingPolicy: {
      name: "整车装载满载策略 (Full Truckload / FTL MOQ)",
      model: "按照卡车容积与载重上限，拼凑整车批次向工厂订购，未满整车不予发运",
      trigger: "多品类混合体积达到整车卡车立方容积 V_{truck}",
      formula: "O_{D, t} = \\left\\lceil \\frac{\\max(0, Target - IP_t)}{Q_{FTL}} \\right\\rceil \\cdot Q_{FTL}",
      explanation: "干线运费按单趟计费，零担运费远高于整车，强制凑整机制直接导致时间维度的需求剧烈堆积。",
    },
    safetyStockLogic: {
      name: "干线运输时滞安全缓冲",
      formula: "SS_D = z \\cdot \\sqrt{L_D \\sigma_{D_D}^2 + \\hat{D}_D^2 \\sigma_{L_D}^2}",
      mechanism: "除了需求波动外，还必须额外吸收干线长途运输自身的时间不确定性 \\sigma_{L_D}。",
    },
    distortionSource: "运费规模阶梯折扣导致的采购时机投机，以及对上游工厂交期的不信任造成的双重安全库存。",
    remedyStrategy: "采用越库直通配送 (Cross-Docking)、多客户拼车干线共享仓、协同计划预测补货 (CPFR)。",
  },
  {
    id: "manufacturer",
    echelonName: "制造工厂 (Manufacturer)",
    echelonRole: "总装制造与部件加工，受换模工装时间、产能节拍与在制品 (WIP) 严格约束",
    icon: Factory,
    color: "amber",
    demandProfile: {
      type: "大区分销中心采购大单 (Lumpy OEM Requisition)",
      nature: "巨型波浪式冲击，需求均值虽然恒定但瞬时方差极其夸张",
      frequency: "月度排产计划调整与季度滚动滚动刷新",
      volatilityDescription: "需求信号严重失真，峰值常超过正常生产线产能极限",
      formula: "D_{M, t} = \\text{Distributor Orders} + \\text{Emergency Spikes}",
    },
    orderingPolicy: {
      name: "主生产计划与物料需求计划 (MPS / MRP + EPQ)",
      model: "基于有限产能排产 (Finite Capacity Scheduling)，排定经济生产批量 EPQ",
      trigger: "MRP 净需求分解跑算，平衡换模停机损耗与库存积压成本",
      formula: "EPQ = \\sqrt{\\frac{2 D S_{setup}}{h (1 - d/P)}}, \\quad Prod_t \\le Cap_{max}",
      explanation: "机床换模停机耗时耗资，工厂必须凑足大批量连续作业；一旦遇到产能瓶颈，只能对下游进行延迟交货或配给。",
    },
    safetyStockLogic: {
      name: "在制品与成品双重缓冲 (WIP + FG Buffer)",
      formula: "WIP_{target} = \\text{Throughput} \\times T_{lead} \\quad (\\text{Little's Law})",
      mechanism: "依据利特尔法则设置动态在制品管道，以应对突发机器故障或订单浪涌。",
    },
    distortionSource: "生产提前期长导致对终端变动的迟钝滞后；遇紧缺时产能排期引发的下游恐慌。",
    remedyStrategy: "推行精益生产与快速换模技术 (SMED)、实施准时制生产 (JIT)、建立端到端 POS 直连。",
  },
  {
    id: "supplier",
    echelonName: "原材料供应商 (Supplier)",
    echelonRole: "源头晶圆/化工树脂/金属原料，重资产投资、生产周期最长且产能调整最僵硬",
    icon: Pickaxe,
    color: "red",
    demandProfile: {
      type: "巨量大宗原料订购单 (Raw Material Purchase Orders)",
      nature: "长期沉寂伴随突发爆发（暴饮暴食现象 Boom-and-Bust）",
      frequency: "季度或半年度长单签署",
      volatilityDescription: "方差放大达最高峰值 (BWE 往往高达 6x - 10x 以上)",
      formula: "D_{S, t} = \\sum_{j} \\text{BOM Multiplier}_j \\cdot O_{mfg, j, t}",
    },
    orderingPolicy: {
      name: "刚性连续生产与短缺配额策略 (Continuous Run & Rationing)",
      model: "冶炼炉/晶圆炉必须 24 小时恒温连续作业；面临供需缺口时按比例配发 α",
      trigger: "大宗期货现货合同交割，总需求超过产能上限时触发配额博弈",
      formula: "\\text{Allocated}_k = \\min\\left(O_k, \\; \\frac{O_k}{\\sum O_i} \\cdot Cap_{supplier}\\right)",
      explanation: "当发生供应紧缺时，供应商按各买家订单比例配货。这导致下游各制造厂故意将申报订单虚报放大 200% - 300%，博弈泡沫随即诞生。",
    },
    safetyStockLogic: {
      name: "原料安全战略储备池",
      formula: "SS_S = \\text{Safety Days} \\times \\bar{D}_{raw}",
      mechanism: "建立长周期原油、矿石或晶圆安全战略底仓，应对国际物流大停航或地缘政治断供。",
    },
    distortionSource: "短缺博弈与虚假订单 (Shortage Gaming & Phantom Orders)；一旦缺货解除，下游大量撤单导致上游断崖跌入寒冬。",
    remedyStrategy: "根据下游历史真实销售记录而非申报订单实行按实配额；对退单收取高额惩罚性定金；签署长期产能预留协议。",
  },
];

export const EchelonMechanismsSlice: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>("retailer");

  const current = ECHELON_MECHANISMS.find((e) => e.id === selectedId) || ECHELON_MECHANISMS[0];

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-6">
      {/* 标题与切片定位 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
              切片 02 · 环节机制
            </span>
            <span className="text-xs text-stone-400 font-mono">Echelon Ordering Mechanics & Demand Modeling</span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
            供应链各个环节订货机制与需求特征全景矩阵
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            逐层剖析从零售到原料商的输入需求分布特征、订货决策数学模型、安全库存策略与局部方差扭曲机制。
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 text-xs font-medium overflow-x-auto no-scrollbar">
          {ECHELON_MECHANISMS.map((e) => {
            const isSelected = e.id === selectedId;
            return (
              <button
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-white text-stone-900 shadow-2xs font-semibold"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/60"
                }`}
              >
                <span>{e.echelonName.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 选定环节核心决策切片 */}
      <div className="space-y-5">
        {/* 顶部标题行 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl bg-stone-50 border border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center font-bold">
              {React.createElement(current.icon, { className: "w-5 h-5" })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-stone-900">{current.echelonName}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-200 text-stone-700">
                  Echelon Tier
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">{current.echelonRole}</p>
            </div>
          </div>
        </div>

        {/* 左右分栏：左侧需求输入特征 vs 右侧订货决策模型 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 左侧：输入需求特征切片 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-stone-700" />
                  输入需求特征剖析 (Input Demand Profile)
                </span>
                <span className="text-[10px] font-mono text-stone-400">Demand Model</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70">
                  <span className="text-[10px] text-stone-400 font-mono block">需求类型与性质</span>
                  <div className="font-semibold text-stone-800 mt-0.5">{current.demandProfile.type}</div>
                  <p className="text-stone-600 text-[11px] mt-1">{current.demandProfile.nature}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70">
                    <span className="text-[10px] text-stone-400 font-mono block">到达频率</span>
                    <span className="font-medium text-stone-800">{current.demandProfile.frequency}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70">
                    <span className="text-[10px] text-stone-400 font-mono block">波动特性</span>
                    <span className="font-medium text-stone-800">{current.demandProfile.volatilityDescription}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 数学表达卡 */}
            <div className="p-3 rounded-lg bg-stone-100/70 border border-stone-200 text-xs">
              <span className="text-[10px] text-stone-500 font-mono block mb-1">
                需求输入数学表达 (KaTeX):
              </span>
              <div className="text-center py-1 overflow-x-auto">
                <KatexMath math={current.demandProfile.formula} block={false} className="font-bold text-stone-900" />
              </div>
            </div>
          </div>

          {/* 右侧：订货决策机制切片 */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-stone-700" />
                  订货补货机制模型 (Replenishment Mechanism)
                </span>
                <span className="text-[10px] font-mono text-stone-400">Order Logic</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70">
                  <span className="text-[10px] text-stone-400 font-mono block">补货策略法则</span>
                  <div className="font-semibold text-stone-800 mt-0.5">{current.orderingPolicy.name}</div>
                  <p className="text-stone-600 text-[11px] mt-1">{current.orderingPolicy.model}</p>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-[11px]">
                  <span className="text-[10px] text-stone-400 font-mono block">触发与更新阈值</span>
                  <p className="text-stone-700 mt-0.5 leading-relaxed">{current.orderingPolicy.trigger}</p>
                </div>
              </div>
            </div>

            {/* 订货决策公式与物理释义 */}
            <div className="p-3 rounded-lg bg-stone-100/70 border border-stone-200 text-xs space-y-1.5">
              <span className="text-[10px] text-stone-500 font-mono block">
                发出订货量计算法则 (KaTeX):
              </span>
              <div className="text-center py-1 overflow-x-auto">
                <KatexMath math={current.orderingPolicy.formula} block={false} className="font-bold text-stone-900" />
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed pt-1 border-t border-stone-200/60">
                {current.orderingPolicy.explanation}
              </p>
            </div>
          </div>
        </div>

        {/* 底部两栏：安全库存机制与该环节治理对策 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
            <div className="flex items-center justify-between font-semibold text-stone-800">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-stone-600" />
                安全库存控制逻辑 ({current.safetyStockLogic.name})
              </span>
              <KatexMath math={current.safetyStockLogic.formula} className="text-xs font-mono font-bold" />
            </div>
            <p className="text-stone-600 text-[11px] leading-relaxed">
              {current.safetyStockLogic.mechanism}
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-teal-900">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
              <span>方差失真根源与针对性破局对策</span>
            </div>
            <div className="text-[11px] text-teal-900/90 space-y-1 leading-relaxed">
              <div><strong>失真诱因：</strong>{current.distortionSource}</div>
              <div><strong>破局路径：</strong>{current.remedyStrategy}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
