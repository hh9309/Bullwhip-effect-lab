/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers, 
  Clock, 
  Truck, 
  Factory, 
  Store, 
  Building2, 
  Pickaxe, 
  Users,
  Activity,
  AlertTriangle,
  Info
} from "lucide-react";
import { KatexMath } from "../../common/KatexRenderer";

interface EchelonNodeDetail {
  id: string;
  name: string;
  enName: string;
  icon: React.ElementType;
  role: string;
  color: string;
  badgeBg: string;
  demandSource: string;
  orderBehavior: string;
  typicalLeadTime: string;
  batchConstraint: string;
  varianceAmplification: string;
  keyChallenge: string;
}

const TOPOLOGY_NODES: EchelonNodeDetail[] = [
  {
    id: "consumer",
    name: "终端消费者",
    enName: "End Consumer",
    icon: Users,
    role: "真实需求的发源地，产生小批量、分散且高频的日常消费信号",
    color: "text-rose-700 bg-rose-50 border-rose-200",
    badgeBg: "bg-rose-100 text-rose-800",
    demandSource: "终端生活需求，受价格、季节、偏好驱动，总体相对平稳",
    orderBehavior: "按需即买即走，极少主动囤货（促销期除外）",
    typicalLeadTime: "实时 (L ≈ 0)",
    batchConstraint: "单件消费，无批量约束 (Q = 1)",
    varianceAmplification: "基准基线 (Var = 1.00x)",
    keyChallenge: "真实需求往往被包装促销透支掩盖",
  },
  {
    id: "retailer",
    name: "零售商",
    enName: "Retailer (商超/门店/电商)",
    icon: Store,
    role: "最靠近消费者的触点，通过 POS 系统感知销售脉搏并维持货架服务水平",
    color: "text-teal-700 bg-teal-50 border-teal-200",
    badgeBg: "bg-teal-100 text-teal-800",
    demandSource: "终端顾客的直接离散客流需求 D_t",
    orderBehavior: "采用移动平均或指数平滑预测，定期或连续补齐至目标库存水位 S",
    typicalLeadTime: "1 - 2 周期",
    batchConstraint: "箱装起订 (Case Pack)",
    varianceAmplification: "轻度放大 (~ 1.2x - 1.5x)",
    keyChallenge: "促销折扣导致的前瞻性囤货与预测更新超调",
  },
  {
    id: "wholesaler",
    name: "批发商",
    enName: "Wholesaler (区域中心仓)",
    icon: Building2,
    role: "汇集区域内数十家零售门店订单，执行整批仓储中转与跨店平衡",
    color: "text-sky-700 bg-sky-50 border-sky-200",
    badgeBg: "bg-sky-100 text-sky-800",
    demandSource: "下游各零售商的周期性补货订单集合",
    orderBehavior: "基于 EOQ 或 Min-Max 规则，达到订货阈值才集中下达采购单",
    typicalLeadTime: "2 - 4 周期",
    batchConstraint: "托盘级起订 (Pallet MOQ)",
    varianceAmplification: "中度放大 (~ 1.8x - 2.5x)",
    keyChallenge: "多门店订货周期同步重叠产生的周期性脉冲峰值",
  },
  {
    id: "distributor",
    name: "分销商",
    enName: "Distributor (大区分拨枢纽)",
    icon: Truck,
    role: "全国干线调配与集约物流中枢，承担干线运输成本与库存缓冲",
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    badgeBg: "bg-indigo-100 text-indigo-800",
    demandSource: "多个批发中心的大宗汇总补货单",
    orderBehavior: "为了规避高额物流运费，强制凑满整车装载 (FTL) 才向工厂订购",
    typicalLeadTime: "3 - 5 周期",
    batchConstraint: "整车装载批量 (Full Truck Load)",
    varianceAmplification: "显著放大 (~ 2.8x - 3.8x)",
    keyChallenge: "运费规模效应导致大单间歇性爆发，加剧时间维度的集中度",
  },
  {
    id: "manufacturer",
    name: "制造工厂",
    enName: "Manufacturer (总装制造)",
    icon: Factory,
    role: "依据物料需求计划 (MRP) 安排主生产计划 (MPS)，受机床产能与换模约束",
    color: "text-amber-800 bg-amber-50 border-amber-200",
    badgeBg: "bg-amber-100 text-amber-900",
    demandSource: "各大区分销枢纽的巨额间歇性订单",
    orderBehavior: "综合考虑工装换模、生产节拍与在制品 (WIP)，执行经济生产批量 (EPQ)",
    typicalLeadTime: "4 - 8 周期 (含采购、排产、品控)",
    batchConstraint: "生产批次/换模节拍批量",
    varianceAmplification: "高度放大 (~ 4.0x - 6.0x)",
    keyChallenge: "生产提前期漫长导致对下游真实需求极度迟钝，产能忽而超载忽而闲置",
  },
  {
    id: "supplier",
    name: "原材料供应商",
    enName: "Raw Materials Supplier (晶圆/粒子/大宗)",
    icon: Pickaxe,
    role: "供应链最上游源头，重资产高投资，产能刚性且扩张调配周期最长",
    color: "text-red-700 bg-red-50 border-red-200",
    badgeBg: "bg-red-100 text-red-800",
    demandSource: "各制造工厂的原材料采购大单",
    orderBehavior: "连续刚性生产，大宗合约长协锁定；遇紧缺时采取按比例配额配发",
    typicalLeadTime: "8 - 16+ 周期 (长达数月/数季)",
    batchConstraint: "大宗集装箱/吨级冶炼批次",
    varianceAmplification: "极端震荡 (~ 6.0x - 10.0x+)",
    keyChallenge: "下游因短缺恐慌发起虚假超额订货博弈，泡沫破裂时面临巨额原料死库",
  },
];

export const SupplyChainTopologySlice: React.FC = () => {
  const [activeNodeId, setActiveNodeId] = useState<string>("retailer");

  const currentNode = TOPOLOGY_NODES.find((n) => n.id === activeNodeId) || TOPOLOGY_NODES[1];

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-6">
      {/* 标题与切片定位 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
              切片 01 · 拓扑全景
            </span>
            <span className="text-xs text-stone-400 font-mono">End-to-End Multi-Echelon Supply Chain Structure</span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900">
            多级供应链拓扑结构与双向流动网络
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            解构从终端消费者到源头原材料商的六大层级，解析信息流（逆流上行）与实物流（顺流下行）的动态时滞传导。
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-1 text-amber-700 font-medium px-2 py-1 rounded bg-amber-50 border border-amber-200">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>信息流：订单逆向放大 ↑</span>
          </div>
          <div className="flex items-center gap-1 text-teal-700 font-medium px-2 py-1 rounded bg-teal-50 border border-teal-200">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>物流：产品顺向交付 ↓</span>
          </div>
        </div>
      </div>

      {/* 交互式端到端链条图谱 */}
      <div className="p-4 sm:p-5 rounded-xl bg-stone-50/80 border border-stone-200 space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-stone-600" />
            <span>全网 6 大节点协同链条（点击任一节点查看透视切片）：</span>
          </span>
          <span className="text-stone-400 hidden sm:inline">左侧下游 (市场端) ⟵——⟶ 右侧上游 (资源端)</span>
        </div>

        {/* 节点横向流转卡片列 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {TOPOLOGY_NODES.map((node, index) => {
            const Icon = node.icon;
            const isSelected = node.id === activeNodeId;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-white border-stone-900 shadow-xs ring-2 ring-stone-900/10"
                    : "bg-white/70 border-stone-200 hover:border-stone-400 hover:bg-white"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] text-stone-400 font-bold">
                      0{index + 1}
                    </span>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${node.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <div className="text-xs font-bold text-stone-900 leading-tight">
                    {node.name}
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5 truncate">
                    {node.enName.split(" ")[0]}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                  <span className="text-stone-500 font-mono">放大幅度</span>
                  <span className="font-mono font-semibold text-amber-700">
                    {index === 0 ? "1.0x" : `${(1 + index * 0.9).toFixed(1)}x+`}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-stone-900 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 双向数据流动指示条 */}
        <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-900 shrink-0 mt-0.5">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <span>订单信息逆流上行 (Information Transmission)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/80 font-mono">从左至右 ↑</span>
              </div>
              <p className="text-amber-900/80 text-[11px] mt-0.5 leading-relaxed">
                消费者购买产生 POS 原始需求，各环节由于存在<strong>安全库存叠加、预测推算误差与订货批量</strong>，向上传递时方差逐级几何级放大。
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-teal-100 text-teal-900 shrink-0 mt-0.5">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-teal-950 flex items-center gap-1.5">
                <span>实体货物顺流下行 (Physical Fulfillment)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-200/80 font-mono">从右至左 ↓</span>
              </div>
              <p className="text-teal-900/80 text-[11px] mt-0.5 leading-relaxed">
                从原材料冶炼、部件总装、跨区干线运输到末端货架补货。存在不可压缩的<strong>生产制造提前期与在途管道运输时滞 (Lead Time L)</strong>。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 选中节点的深度透视卡片 */}
      <div className="p-5 rounded-xl border border-stone-200 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${currentNode.color}`}>
              {React.createElement(currentNode.icon, { className: "w-4 h-4" })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-stone-900">{currentNode.name}</h4>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${currentNode.badgeBg}`}>
                  {currentNode.enName}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">{currentNode.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-stone-400">预估方差倍数:</span>
            <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-bold">
              {currentNode.varianceAmplification}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="text-stone-400 font-mono text-[10px] block">输入需求源 (Input Demand)</span>
            <p className="text-stone-800 font-medium leading-relaxed">{currentNode.demandSource}</p>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="text-stone-400 font-mono text-[10px] block">订货决策机制 (Ordering Logic)</span>
            <p className="text-stone-800 font-medium leading-relaxed">{currentNode.orderBehavior}</p>
          </div>

          <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/70 space-y-1">
            <span className="text-stone-400 font-mono text-[10px] block">约束与物理时滞 (Constraints)</span>
            <div className="flex items-center justify-between text-stone-700">
              <span>起订约束: <strong>{currentNode.batchConstraint}</strong></span>
              <span>时滞: <strong>{currentNode.typicalLeadTime}</strong></span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/70 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-950">该环节核心痛点与牛鞭根源：</strong>
            <span className="text-amber-900/90 ml-1">{currentNode.keyChallenge}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
