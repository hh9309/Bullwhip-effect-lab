/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimulationParameters, EchelonMetrics } from "../types";
import { calculateTheoreticalBWE, simulateMultiEchelon } from "./simulation";

export type DiagnosticSeverity = "critical" | "warning" | "info" | "optimal";

export interface DiagnosticRecommendation {
  id: string;
  title: string;
  severity: DiagnosticSeverity;
  triggerCondition: string;
  anomalyType: "batching" | "leadTime" | "forecasting" | "gaming" | "informationSilo" | "shockOverload" | "balanced";
  theoryOrigin: string;
  diagnosisText: string;
  actionAdvice: string;
  expectedImpact: string;
  suggestedParams?: Partial<SimulationParameters>;
  suggestedPrompt: string;
}

export interface DiagnosticReport {
  timestamp: string;
  riskLevel: "high" | "medium" | "low" | "optimal";
  overallRiskScore: number; // 0 (完美稳态) - 100 (极度危险发散)
  summaryTitle: string;
  summaryDescription: string;
  recommendations: DiagnosticRecommendation[];
  detectedChanges: string[];
  maxActualBwe: number;
  theoreticalBwe: number;
  worstServiceLevel: number;
}

/**
 * 实时比对实验参数变动与多级仿真输出异常，基于经典供应链运筹理论产出诊断与主动优化策略
 */
export function generateAiDiagnosticReport(
  params: SimulationParameters,
  prevParams?: SimulationParameters | null
): DiagnosticReport {
  const theoreticalBwe = calculateTheoreticalBWE(params.leadTime, params.smoothingP);
  const simResult = simulateMultiEchelon(params);
  
  // 找出多级中方差放大最严重与服务水平最低的节点
  let maxActualBwe = 1.0;
  let worstServiceLevel = 100;
  let maxBweEchelon = "供应商";

  simResult.metrics.forEach((m: EchelonMetrics) => {
    if (m.bwe > maxActualBwe) {
      maxActualBwe = m.bwe;
      maxBweEchelon = m.name;
    }
    if (m.serviceLevel < worstServiceLevel) {
      worstServiceLevel = m.serviceLevel;
    }
  });

  // 检测参数显著变动
  const detectedChanges: string[] = [];
  if (prevParams) {
    if (prevParams.batchingSize !== params.batchingSize) {
      detectedChanges.push(`订货批量 Q 从 ${prevParams.batchingSize} 变更至 ${params.batchingSize}`);
    }
    if (Math.abs(prevParams.leadTime - params.leadTime) >= 1) {
      detectedChanges.push(`提前期 L 从 ${prevParams.leadTime}期 变动至 ${params.leadTime}期`);
    }
    if (Math.abs(prevParams.smoothingP - params.smoothingP) >= 1) {
      detectedChanges.push(`平滑期数 p 从 ${prevParams.smoothingP}阶 变动至 ${params.smoothingP}阶`);
    }
    if (prevParams.rationingRatio !== params.rationingRatio) {
      detectedChanges.push(`配额比率 α 从 ${(prevParams.rationingRatio * 100).toFixed(0)}% 变动至 ${(params.rationingRatio * 100).toFixed(0)}%`);
    }
    if (prevParams.enableVMI !== params.enableVMI) {
      detectedChanges.push(`VMI 协同状态变更为 [${params.enableVMI ? "开启" : "关闭"}]`);
    }
    if (prevParams.enableCPFR !== params.enableCPFR) {
      detectedChanges.push(`CPFR 协同状态变更为 [${params.enableCPFR ? "开启" : "关闭"}]`);
    }
    if (prevParams.enablePOSSharing !== params.enablePOSSharing) {
      detectedChanges.push(`POS 数据直通状态变更为 [${params.enablePOSSharing ? "开启" : "关闭"}]`);
    }
  }

  const recommendations: DiagnosticRecommendation[] = [];

  // 1. 批量效应诊断 (Order Batching Anomaly)
  if (params.batchingSize > 1 && !params.enableVMI) {
    recommendations.push({
      id: "rec-batching",
      title: "批量订货周期性脉冲异动",
      severity: params.batchingSize >= 4 ? "critical" : "warning",
      triggerCondition: `分销商订货批量 Q = ${params.batchingSize}，诱发典型间歇性离散采购脉冲`,
      anomalyType: "batching",
      theoryOrigin: "Hau L. Lee (1997) 供应链四大成因之【批量订货 (Order Batching)】",
      diagnosisText: `当前分销商设置了起订量（MOQ）限制（Q = ${params.batchingSize}）。下游往往累积数期真实需求后才突发性下达大单，导致上游制造端在“长期待机”与“突发爆产”之间剧烈震荡，产生了人为的锯齿状脉冲。`,
      actionAdvice: `建议减少分销商的订货批量以降低牛鞭效应（例如将 Q 调小至 1），或启用 VMI (供应商管理库存) 推行小批量高频配送。`,
      expectedImpact: `预期可将制造端与供应商波幅方差削减 35%~55%，消除周期性爆仓与闲置。`,
      suggestedParams: {
        batchingSize: 1,
        enableVMI: true,
      },
      suggestedPrompt: `请基于 Hau Lee 的批量订货理论，深入分析当前分销商订货批量 Q=${params.batchingSize} 如何造成上游方差阶跃放大，并给出在不显著增加干线物流频次成本的前提下推行“小批量、高频次准时制(JIT)”补货的具体落地方案。`,
    });
  }

  // 2. 提前期过长及二次方放大异动 (Long Lead Time Anomaly)
  if (params.leadTime >= 4) {
    recommendations.push({
      id: "rec-lead-time",
      title: "长提前期引发管道时滞发散",
      severity: params.leadTime >= 6 ? "critical" : "warning",
      triggerCondition: `交付提前期 L = ${params.leadTime} 期，理论放大基底 BWE ≥ ${theoreticalBwe.toFixed(2)}x`,
      anomalyType: "leadTime",
      theoryOrigin: "Chen, Drezner, Ryan & Simchi-Levi (2000) 提前期敏感度定理：∂BWE/∂L ∝ 2L/p²",
      diagnosisText: `提前期 L 对牛鞭效应的影响呈严格的二次方敏感（含 2L²/p² 项）。当 L = ${params.leadTime} 时，下游订货到上游收货之间的“管道存量”过度蓄水。在需求发生阶跃冲击时，各级节点在未看到回货前误判为运力丢失，极易诱发严重的恐慌性追加重复订货。`,
      actionAdvice: `建议压缩分销与物流提前期（将 L 降至 2 期以内），或采用前置仓、华为专机航线实现敏捷拉动，降低感知延迟。`,
      expectedImpact: `每降低 1 期物理提前期，上游理论方差放大率将以二次方速率迅速收敛，安全库存可压降 30% 以上。`,
      suggestedParams: {
        leadTime: Math.max(1, params.leadTime - 2),
      },
      suggestedPrompt: `依据 Chen & Simchi-Levi 的定理方程 BWE >= 1 + 2L/p + 2L^2/p^2，请为我们推导提前期从 L=${params.leadTime} 压缩至 L=2 时对全链牛鞭效应一阶偏导数 ∂BWE/∂L 的边际收益，并结合华为集成供应链(ISC)的制造前置仓实践给出缩短 L 的管理举措。`,
    });
  }

  // 3. 预测平滑过冲异常 (Forecasting Overreaction)
  if (params.smoothingP <= 2) {
    recommendations.push({
      id: "rec-forecasting",
      title: "预测平滑期过短导致过度反应",
      severity: "warning",
      triggerCondition: `平滑期数 p = ${params.smoothingP} 阶，历史观测记忆过浅，系统对白噪声极度敏感`,
      anomalyType: "forecasting",
      theoryOrigin: "Sterman (1989) 系统动力学【误将短期波动误判为长期结构趋势】",
      diagnosisText: `当前移动平均平滑窗口过窄（p = ${params.smoothingP}）。这意味着任何单期的随机随机扰动（如偶然性脉冲），都会被预测算法直接放大并当作结构性趋势纳入目标基准库存计算，导致下游下单波动剧烈超过终端真实需求。`,
      actionAdvice: `建议扩大预测平滑窗口（将 p 提升至 5~8 阶），或引入加权指数平滑与贝叶斯自适应滤波算法以过滤虚假高频白噪声。`,
      expectedImpact: `平抑短期脉冲造成的误判过冲，将订单对单次扰动的超调量（Overshoot）降低 40% 以上。`,
      suggestedParams: {
        smoothingP: 6,
      },
      suggestedPrompt: `当前预测平滑阶数 p=${params.smoothingP} 极小，请解释为什么过短的平滑周期会成为系统动力学中典型的“正反馈不稳定源”？应该如何在对真实趋势的敏感度和对随机噪声的抗干扰性之间寻找最优平滑参数 p*？`,
    });
  }

  // 4. 短缺配额博弈与虚假重复下单 (Shortage Gaming Anomaly)
  if (params.rationingRatio < 0.9 && !params.enableCPFR) {
    recommendations.push({
      id: "rec-gaming",
      title: "配额受限触发短缺博弈虚报",
      severity: params.rationingRatio <= 0.7 ? "critical" : "warning",
      triggerCondition: `配额履约比率 α = ${(params.rationingRatio * 100).toFixed(0)}%，渠道商正发起超额“影子订单”`,
      anomalyType: "gaming",
      theoryOrigin: "Hau L. Lee (1997) 供应链四大成因之【短缺博弈 (Rationing & Gaming)】",
      diagnosisText: `当下游渠道感知到产能受限、供货商按订货比例切分短缺时，理性的个体博弈策略是“报大单以抢小额”（下达 150%~200% 的虚报订货）。一旦上游扩产完毕，下游立即撤单，导致供应商遭遇惨烈的库存积压坍塌。`,
      actionAdvice: `建议废除依订货量切分的简单配额，转而实行“以历史真实售出数据配额 (Turn-and-Earn)”机制，并开启 CPFR 联合预测协议对齐真实消耗。`,
      expectedImpact: `消除虚报“幽灵订单”（Phantom Orders），使供应商端真实有效需求还原度提升至 95% 以上。`,
      suggestedParams: {
        rationingRatio: 1.0,
        enableCPFR: true,
      },
      suggestedPrompt: `请详细分析当配额供给比率只有 ${(params.rationingRatio * 100).toFixed(0)}% 时，为什么传统的订单配售机制必然诱发类似 1990 年代 Cisco 或半导体芯片行业“虚假双倍下单(Double Ordering)”的公地悲剧？请对比华为配额分配机制与传统的差异。`,
    });
  }

  // 5. 信息孤岛与协同策略缺失 (Information Silo Anomaly)
  if (
    maxActualBwe >= 2.5 &&
    !params.enableVMI &&
    !params.enableCPFR &&
    !params.enablePOSSharing
  ) {
    recommendations.push({
      id: "rec-info-silo",
      title: "多级信息断层与协同策略缺失",
      severity: maxActualBwe >= 4.0 ? "critical" : "warning",
      triggerCondition: `最大实际放大倍率已达 ${maxActualBwe.toFixed(2)}x (${maxBweEchelon})，且当前全链路协同对策为 0`,
      anomalyType: "informationSilo",
      theoryOrigin: "Forrester (1961) 工业动力学【缺乏端到端真实需求可见性导致逐级失真】",
      diagnosisText: `目前整条链条处于典型的“传统推式/孤岛式”运作，批发商与分销商仅能观察到直接下游的采购单，无法感知零售端真实 POS 扫码数据，信息在传递中被每一层级的安全库存和提前期层层扭曲放大。`,
      actionAdvice: `建议开启 POS 数据全网实时共享（或同步开启 VMI 供应商管理库存），让核心制造工厂直接穿透中间层级直连终端需求。`,
      expectedImpact: `彻底切断上游对中间层级失真订单的盲目依赖，将全链平均牛鞭效应指数压制回 1.2x 以下的低振荡稳态。`,
      suggestedParams: {
        enablePOSSharing: true,
        enableVMI: true,
      },
      suggestedPrompt: `在当前参数下，实际方差放大率已高达 ${maxActualBwe.toFixed(2)}x。请从运筹学信息价值（Value of Information）的角度论证：如果推行沃尔玛/宝洁模式的 POS 数据共享与 VMI，上游供应商的预期安全库存与缺货率能降低多少？`,
    });
  }

  // 6. 需求冲击过载与断货风险 (Severe Shock & Service Failure)
  if (worstServiceLevel < 85 || (params.shockMagnitude >= 60 && params.demandVolatility >= 25)) {
    recommendations.push({
      id: "rec-shock-overload",
      title: "突发需求过载诱发高缺货断流",
      severity: "critical",
      triggerCondition: `全链最低履约率跌至 ${worstServiceLevel.toFixed(1)}%，承受剧烈冲击 (幅度 ${params.shockMagnitude}%, 波动率 ${params.demandVolatility}%)`,
      anomalyType: "shockOverload",
      theoryOrigin: "安全库存与服务水平折衷定理：SS = z · σ_D · √L",
      diagnosisText: `高强度外部冲击突破了各层级预设的安全库存防线，出现了连续多期的欠货积压（Backlog）。缺货引发下游对缺货赔付的恐慌，逆向加剧了订单的峰值超调。`,
      actionAdvice: `建议适度平抑冲击幅度或开启 CPFR 协同补货，建立供需缓冲池（Buffer Capacity）以抵御非线性尖峰需求。`,
      expectedImpact: `提升全链履约率至 95% 以上基准，规避缺货罚金与商誉损失。`,
      suggestedParams: {
        enableCPFR: true,
        shockMagnitude: Math.min(30, params.shockMagnitude),
      },
      suggestedPrompt: `当前最低服务履约率已降至 ${worstServiceLevel.toFixed(1)}%，发生严重断货。请给出在应对此类剧烈需求脉冲冲击时，供应链安全库存配置公式 $SS = z \\cdot \\sigma_D \\sqrt{L}$ 的动态调整模型，以及如何利用弹性产能应对超额订货。`,
    });
  }

  // 如果没有任何异常，给出积极稳态的肯定
  if (recommendations.length === 0) {
    recommendations.push({
      id: "rec-optimal",
      title: "供应链参数协同处于健康稳态",
      severity: "optimal",
      triggerCondition: `理论 BWE=${theoreticalBwe.toFixed(2)}x，实测 BWE 处于低幅收敛区间`,
      anomalyType: "balanced",
      theoryOrigin: "集成供应链协同平衡态 (ISC Balanced State)",
      diagnosisText: `当前订货批量均衡，提前期适中，预测平滑有效，协同治理策略发挥了良好阻尼效应，系统表现出良好的二阶阻尼衰减特性，无结构性发散隐患。`,
      actionAdvice: `建议继续保持当前的敏捷协同机制，或在沙盒中尝试微调压力参数以探索供应链鲁棒性边界。`,
      expectedImpact: `维持 98% 以上的高现货率与低在库资金占用。`,
      suggestedPrompt: `当前供应链参数整体处于较好状态。请基于系统动力学平衡态理论，总结该参数组合之所以能够有效遏制牛鞭效应的核心机理，并推荐若干用于教学展示的边界极端实验参数。`,
    });
  }

  // 评估整体风险等级与综合评分 (0~100)
  let riskScore = Math.min(100, Math.round(
    (maxActualBwe - 1.0) * 18 + 
    (params.leadTime > 3 ? (params.leadTime - 3) * 12 : 0) +
    (params.batchingSize > 1 ? params.batchingSize * 7 : 0) +
    (params.rationingRatio < 1.0 ? (1.0 - params.rationingRatio) * 50 : 0) +
    (100 - worstServiceLevel) * 0.5
  ));

  if (params.enableVMI) riskScore = Math.max(10, riskScore - 20);
  if (params.enableCPFR) riskScore = Math.max(10, riskScore - 15);
  if (params.enablePOSSharing) riskScore = Math.max(10, riskScore - 15);

  let riskLevel: "high" | "medium" | "low" | "optimal" = "low";
  let summaryTitle = "整体状态正常";
  let summaryDescription = "系统方差处于可控范围，未观测到显著发散。";

  if (riskScore >= 60 || recommendations.some(r => r.severity === "critical")) {
    riskLevel = "high";
    summaryTitle = "⚠️ 捕获到高危结构性牛鞭发散异常";
    summaryDescription = `检测到批量异动或时滞过度蓄水，实测最高放大率达 ${maxActualBwe.toFixed(2)}x，建议采纳以下运筹对策。`;
  } else if (riskScore >= 35 || recommendations.some(r => r.severity === "warning")) {
    riskLevel = "medium";
    summaryTitle = "⚡ 检测到次级供应链震荡风险";
    summaryDescription = `部分参数设定存在次优放大倾向，推荐根据以下理论建议进行参数调优。`;
  } else if (riskScore < 20 && recommendations.every(r => r.severity === "optimal")) {
    riskLevel = "optimal";
    summaryTitle = "✅ 供应链处于低振荡协同健康稳态";
    summaryDescription = `各层级供需节奏匹配良好，牛鞭效应被有效衰减至基线水平。`;
  }

  return {
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    riskLevel,
    overallRiskScore: riskScore,
    summaryTitle,
    summaryDescription,
    recommendations,
    detectedChanges,
    maxActualBwe,
    theoreticalBwe,
    worstServiceLevel,
  };
}
