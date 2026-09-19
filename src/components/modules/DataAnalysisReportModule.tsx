/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { SimulationParameters, EchelonMetrics } from "../../types";
import { simulateMultiEchelon, calculateTheoreticalBWE, calculateDerivativeL, calculateDerivativeP } from "../../utils/simulation";
import { 
  FileText, 
  Printer, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  BarChart3,
  Download,
  Activity,
  Zap,
  Target,
  FileSpreadsheet,
  CheckSquare,
  Square,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Percent,
  Compass,
  GitCompare,
  Layers,
  Clock,
  Briefcase,
  Database
} from "lucide-react";

interface DataAnalysisReportProps {
  params: SimulationParameters;
}

export const DataAnalysisReportModule: React.FC<DataAnalysisReportProps> = ({ params }) => {
  const [reportGeneratedTime] = useState<string>(() => new Date().toLocaleString());
  const [copied, setCopied] = useState<boolean>(false);
  const [csvDownloaded, setCsvDownloaded] = useState<boolean>(false);
  const [tableFilter, setTableFilter] = useState<"all" | "high-risk">("all");

  // 审计核查表勾选状态
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    pos_integration: params.enablePOSSharing,
    vmi_execution: params.enableVMI,
    cpfr_protocol: params.enableCPFR,
    leadtime_leanness: params.leadTime <= 2,
    batching_rational: params.batchingSize <= 1,
    rationing_transparency: params.rationingRatio >= 1.0,
  });

  const toggleCheckItem = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // 运行多级仿真 (30期)
  const simResult = useMemo(() => simulateMultiEchelon(params, 30), [params]);
  const theoreticalBwe = useMemo(
    () => calculateTheoreticalBWE(params.leadTime, params.smoothingP),
    [params.leadTime, params.smoothingP]
  );

  // 核心统计指标计算
  const totalHoldingCost = useMemo(
    () => simResult.metrics.reduce((sum, m) => sum + m.holdingCost, 0),
    [simResult]
  );
  const avgServiceLevel = useMemo(
    () => Number((simResult.metrics.reduce((sum, m) => sum + m.serviceLevel, 0) / simResult.metrics.length).toFixed(1)),
    [simResult]
  );
  const maxBwe = useMemo(
    () => Math.max(...simResult.metrics.map((m) => m.bwe)),
    [simResult]
  );
  const totalStockoutCount = useMemo(
    () => simResult.metrics.reduce((sum, m) => sum + m.stockoutCount, 0),
    [simResult]
  );

  // 综合健康度得分 (0-100)
  const healthScore = useMemo(() => {
    let score = 100;
    // BWE 惩罚 (理论基准每超出 1x 扣 8分)
    const bwePenalty = Math.max(0, (maxBwe - 1.2) * 9);
    // 现货履约率惩罚 (每低于 98% 1% 扣 2分)
    const servicePenalty = Math.max(0, (98 - avgServiceLevel) * 2.5);
    // 缺货次数惩罚
    const stockoutPenalty = totalStockoutCount * 2.5;

    score = Math.round(Math.max(20, Math.min(99, score - bwePenalty - servicePenalty - stockoutPenalty)));
    return score;
  }, [maxBwe, avgServiceLevel, totalStockoutCount]);

  // 综合风险等级判定
  let riskLevel = "正常可控 (Low Risk)";
  let riskGrade = "A";
  let riskBadgeColor = "text-teal-700 bg-teal-50 border-teal-200";
  if (healthScore < 50 || maxBwe > 5 || avgServiceLevel < 85) {
    riskLevel = "极高风险 (Critical Whiplash)";
    riskGrade = "D";
    riskBadgeColor = "text-red-700 bg-red-50 border-red-200";
  } else if (healthScore < 75 || maxBwe > 2.5 || avgServiceLevel < 95) {
    riskLevel = "中度风险 (Moderate Whiplash)";
    riskGrade = "B";
    riskBadgeColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  // 子模块3：财务经济学损耗穿透估算
  const financialMetrics = useMemo(() => {
    // 1. 资金占用与仓储持有成本
    const holdingCost = totalHoldingCost;
    // 2. 缺货造成的潜在违约罚金与客户流失机会成本 (每次断货假设损失 280 元)
    const stockoutPenaltyCost = totalStockoutCount * 320;
    // 3. 产能波动过冲造成的加急派送/加班生产溢价 (随最大方差膨胀)
    const surgeCapacityCost = Math.round(Math.max(0, (maxBwe - 1) * 450));
    // 4. 呆滞跌价损耗成本 (占持有成本约 22%)
    const obsolescenceCost = Math.round(holdingCost * 0.22);

    const totalLossCost = holdingCost + stockoutPenaltyCost + surgeCapacityCost + obsolescenceCost;

    // 协同机制实施后的预计可节约收益 (若全面治理预计节约 35%~55%)
    const potentialSavings = Math.round(totalLossCost * 0.42);

    return {
      holdingCost,
      stockoutPenaltyCost,
      surgeCapacityCost,
      obsolescenceCost,
      totalLossCost,
      potentialSavings,
    };
  }, [totalHoldingCost, totalStockoutCount, maxBwe]);

  // 子模块4：李效良四大成因量化贡献度
  const fourCausesAudit = useMemo(() => {
    // 1. 需求预测更新 (提前期 L 与平滑期 p)
    const forecastRatio = Math.min(65, Math.round(20 + (params.leadTime * 8) - (params.smoothingP * 2)));
    // 2. 批量订货 (Batching)
    const batchingRatio = params.batchingSize > 1 ? Math.min(35, params.batchingSize * 9) : 8;
    // 3. 价格与前瞻购买 (Shock Magnitude)
    const priceRatio = Math.min(30, Math.round(params.shockMagnitude * 0.4));
    // 4. 配额与短缺博弈 (Rationing)
    const rationingImpact = params.rationingRatio < 1.0 ? Math.round((1.0 - params.rationingRatio) * 60) : 10;

    return [
      {
        id: "forecast",
        title: "1. 需求预测更新 (Demand Forecast Updating)",
        theory: "基于移动平均或指数平滑的延迟响应，造成预测方差以 (1 + 2L/p + 2L²/p²) 级联放大",
        severity: params.leadTime >= 4 ? "极高 (Critical)" : params.leadTime >= 2 ? "中等 (Medium)" : "低 (Low)",
        severityColor: params.leadTime >= 4 ? "text-red-700 bg-red-50" : params.leadTime >= 2 ? "text-amber-700 bg-amber-50" : "text-teal-700 bg-teal-50",
        currentParam: `提前期 L=${params.leadTime} 期, 平滑期 p=${params.smoothingP} 阶`,
        share: forecastRatio,
        solution: "缩短补货时滞 L、引入贝叶斯实时终端需求校准或共享下游实际销售流",
      },
      {
        id: "batching",
        title: "2. 批量订货与经济批量 (Order Batching / MOQ)",
        theory: "因固定订货成本或最低起订量（MOQ）产生的离散订货，向下游注入周期性脉冲方差",
        severity: params.batchingSize > 2 ? "极高 (Critical)" : params.batchingSize > 1 ? "中等 (Medium)" : "已消除 (Minimal)",
        severityColor: params.batchingSize > 2 ? "text-red-700 bg-red-50" : params.batchingSize > 1 ? "text-amber-700 bg-amber-50" : "text-teal-700 bg-teal-50",
        currentParam: `批量因子 Q=${params.batchingSize} (${params.batchingSize > 1 ? "存在离散起订约束" : "单件平滑流"})`,
        share: batchingRatio,
        solution: "推行 Milk-Run 循环拼箱取货、EDI 电子数据交换以削减固定下单成本",
      },
      {
        id: "price",
        title: "3. 价格波动与前瞻性囤货 (Price Fluctuations & Forward Buying)",
        theory: "外部促销或突发需求扰动激励下游在短期超量预购囤积，造成销售与发货时序断裂",
        severity: params.shockMagnitude >= 50 ? "严重 (High)" : "可控 (Controlled)",
        severityColor: params.shockMagnitude >= 50 ? "text-red-700 bg-red-50" : "text-teal-700 bg-teal-50",
        currentParam: `冲击类型=${params.shockType}, 脉冲幅度=${params.shockMagnitude}%`,
        share: priceRatio,
        solution: "实施天天平价（EDLP）战略、根据实际终端 Sell-through 结算而非 Sell-in 结算",
      },
      {
        id: "rationing",
        title: "4. 短缺博弈与虚假夸大订单 (Shortage Gaming & Rationing)",
        theory: "当下游预期供应紧张按比例配额分配时，理性纳什均衡促使其夸大订单以博取更多产能",
        severity: params.rationingRatio < 0.8 ? "严重博弈 (High Gaming)" : params.rationingRatio < 1.0 ? "轻度博弈 (Mild)" : "无博弈 (None)",
        severityColor: params.rationingRatio < 0.8 ? "text-red-700 bg-red-50" : params.rationingRatio < 1.0 ? "text-amber-700 bg-amber-50" : "text-teal-700 bg-teal-50",
        currentParam: `配额保障率 α=${params.rationingRatio}`,
        share: rationingImpact,
        solution: "推行基于历史真实履约能力的分配机制、实施全额定金或取消退货权",
      },
    ];
  }, [params]);

  // 子模块5：基线孤岛模式 vs 协同治理模式成效对标
  const benchmarkComparison = useMemo(() => {
    // 假定传统孤岛运营基线 (无协同，L=4, Q=3, α=0.7)
    const baseline = {
      maxBwe: 5.8,
      avgServiceLevel: 82.5,
      totalCost: Math.round(financialMetrics.totalLossCost * 1.6),
      safetyStockUnits: Math.round(params.demandMean * 2.8),
      orderCycleDays: 14,
    };

    // 当前系统测算值
    const current = {
      maxBwe: maxBwe,
      avgServiceLevel: avgServiceLevel,
      totalCost: financialMetrics.totalLossCost,
      safetyStockUnits: Math.round(1.65 * Math.sqrt(params.leadTime) * (params.demandMean * (params.demandVolatility / 100)) * 5),
      orderCycleDays: params.leadTime * 2 + 1,
    };

    // 全面数字化理想目标 (VMI+CPFR+POS全部就绪)
    const target = {
      maxBwe: 1.15,
      avgServiceLevel: 99.2,
      totalCost: Math.round(baseline.totalCost * 0.38),
      safetyStockUnits: Math.round(params.demandMean * 0.9),
      orderCycleDays: 3,
    };

    return { baseline, current, target };
  }, [maxBwe, avgServiceLevel, financialMetrics.totalLossCost, params]);

  // 复制纯文本报告
  const handleCopyReport = () => {
    const reportText = `
================================================================================
【牛鞭效应实验室 · 供应链全景多维度量化审计报告】
================================================================================
报告流水编号: REP-BWE-${Date.now().toString().slice(-6)}
生成时间: ${reportGeneratedTime}
综合健康评分: ${healthScore} / 100 (等级: ${riskGrade} 级 - ${riskLevel})
--------------------------------------------------------------------------------
【第一部分：宏观核心运行指标】
- 理论方差放大系数 (BWE基准下界): ${theoreticalBwe.toFixed(2)}x
- 制造端实测最大方差放大比: ${maxBwe}x
- 全网加权平均客户现货满足率 (OTIF): ${avgServiceLevel}%
- 全链单期综合损耗与在库持有总额: ¥${financialMetrics.totalLossCost.toLocaleString()}
- 当前治理策略就绪状态: VMI=${params.enableVMI ? "已开启" : "未开启"} | CPFR=${params.enableCPFR ? "已开启" : "未开启"} | POS共享=${params.enablePOSSharing ? "已开启" : "未开启"}

--------------------------------------------------------------------------------
【第二部分：全网 5 级节点审计数据清单】
${simResult.metrics.map((m) => `[${m.name}]:
   * 输入需求方差: ${m.demandVariance.toFixed(1)} | 发出订单方差: ${m.orderVariance.toFixed(1)}
   * 方差放大系数: ${m.bwe}x | 平均在库: ${m.avgInventory} 件
   * 单期持有成本: ¥${m.holdingCost} | 现货满足率: ${m.serviceLevel}% | 累计缺货期数: ${m.stockoutCount}`).join("\n")}

--------------------------------------------------------------------------------
【第三部分：财务损耗归因与降本测算】
- 静态持有与资金利息成本: ¥${financialMetrics.holdingCost.toLocaleString()}
- 缺货断货与违约机会成本: ¥${financialMetrics.stockoutPenaltyCost.toLocaleString()}
- 紧急加急调配与产能过冲溢价: ¥${financialMetrics.surgeCapacityCost.toLocaleString()}
- 呆滞跌价与仓储损耗成本: ¥${financialMetrics.obsolescenceCost.toLocaleString()}
- 全面推行协同治理预计可节约收益 (ROI): ¥${financialMetrics.potentialSavings.toLocaleString()} (约 42%)

--------------------------------------------------------------------------------
【第四部分：李效良四大诱因诊断】
${fourCausesAudit.map((c) => `- ${c.title}:
   当前严重度: ${c.severity} | 方差放大贡献率: ~${c.share}%
   对冲方案: ${c.solution}`).join("\n")}

--------------------------------------------------------------------------------
【第五部分：对标分析与改善实施路线】
- 0~30 天 (短期止血): 统一冻结夸大订货，设置最高订购限额；
- 1~3 个月 (机制协同): 实施零售与分销 VMI 协同补货，取消起订量离散限制；
- 3~6 个月 (全网穿透): 建立统一 POS 终端数据湖，实现全链数字孪生闭环。
================================================================================
`.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 导出全量供应链仿真运行参数及全部结果数据为标准 CSV 文件（供外部离线分析）
  const handleDownloadFullSimulationCsv = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const dL = calculateDerivativeL(params.leadTime, params.smoothingP);
    const dP = calculateDerivativeP(params.leadTime, params.smoothingP);

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const csvLines: string[] = [];

    // 0. 报告标题与元数据
    csvLines.push(escapeCsv("=== 牛鞭效应供应链仿真实验 · 全套运行参数与全部结果数据集 ==="));
    csvLines.push(`${escapeCsv("实验报告流水号")},${escapeCsv(`REP-BWE-${Date.now().toString().slice(-6)}`)}`);
    csvLines.push(`${escapeCsv("导出与生成时间戳")},${escapeCsv(new Date().toLocaleString())}`);
    csvLines.push(`${escapeCsv("仿真总计算步长")},${escapeCsv("30 期 (Time Steps T=0..29)")}`);
    csvLines.push(`${escapeCsv("系统抗鞭健康指数得分")},${escapeCsv(`${healthScore} / 100 分`)}`);
    csvLines.push(`${escapeCsv("宏观系统风险综合评级")},${escapeCsv(`${riskGrade} 级 · ${riskLevel}`)}`);
    csvLines.push(`${escapeCsv("全网加权客户现货交付率 (OTIF)")},${escapeCsv(`${avgServiceLevel}%`)}`);
    csvLines.push(`${escapeCsv("制造端实测最大方差放大比 (Max BWE)")},${escapeCsv(`${maxBwe}x`)}`);
    csvLines.push("");

    // 1. 仿真运行全套参数设置 (Simulation Parameters)
    csvLines.push(escapeCsv("--- [第 1 部分] 供应链仿真运行全套参数配置清单 (Simulation Parameters) ---"));
    csvLines.push([
      "参数分类",
      "参数中文名称",
      "系统变量英文标识",
      "当前设定数值",
      "量纲/单位",
      "运筹学机理与业务作用说明",
    ].map(escapeCsv).join(","));

    const shockTypeLabelMap = {
      pulse: "脉冲式单期突增 (Pulse Shock)",
      step: "阶跃式永久跃迁 (Step Shock)",
      sine: "正弦周期波动 (Sine Wave)",
      random: "高斯随机游走 (Gaussian Random)",
    };

    const paramRows = [
      ["终端需求", "基础消费均值", "demandMean", params.demandMean, "件/期", "各周期终端消费者平稳日常购买基准需求量"],
      ["终端需求", "随机变异波动率 (CV)", "demandVolatility", `${params.demandVolatility}%`, "%", "高斯白噪声扰动，标准差占均值比例"],
      ["需求冲击", "扰动注入类型", "shockType", shockTypeLabelMap[params.shockType] || params.shockType, "冲击模式", "模拟促销、外部突发事件或宏观政策变化形态"],
      ["需求冲击", "冲击脉冲幅度", "shockMagnitude", `${params.shockMagnitude}%`, "%", "扰动触发时偏离基准需求的相对幅度"],
      ["补货时滞", "信息与补货提前期 (Lead Time)", "leadTime", params.leadTime, "期 (周期)", "订单信息传输、生产排程制造与干线在途物流的总时滞 L"],
      ["预测机制", "移动平均平滑阶数", "smoothingP", params.smoothingP, "阶 (历史期数)", "各节点进行自适应移动平均预测观测的历史窗口大小 p"],
      ["批量约束", "订货批量规格 (Batching Size)", "batchingSize", params.batchingSize === 1 ? "1 (单件平滑流)" : `${params.batchingSize} 件/批`, "件 (MOQ)", "最低起订量或整车满载运输（FTL）约束，产生离散周期脉冲"],
      ["短缺博弈", "配额供应保障比率", "rationingRatio", params.rationingRatio, "比率 [0.2~1.0]", "上游产能短缺时的按比例配额比率 α，过低会诱发非理性超额申报"],
      ["协同机制", "POS 终端数据实时穿透共享", "enablePOSSharing", params.enablePOSSharing ? "已启用 (True)" : "未启用 (False)", "开关标识", "消除逐级预测信息失真，各级直接参考终端真实销售节拍"],
      ["协同机制", "VMI 供应商管理库存", "enableVMI", params.enableVMI ? "已启用 (True)" : "未启用 (False)", "开关标识", "上游对下游实施集中补货补库决策，消除批量订货脉冲"],
      ["协同机制", "CPFR 协同计划预测与补货", "enableCPFR", params.enableCPFR ? "已启用 (True)" : "未启用 (False)", "开关标识", "全链联合预测与产能透明化，消除产能配额博弈与虚假订单"],
      ["理论极限", "Chen et al. 理论方差放大下界", "theoreticalBWE", theoreticalBwe.toFixed(3), "无量纲倍数", "运筹学解析下界定理: BWE >= 1 + 2L/p + 2L²/p²"],
      ["敏感度", "提前期边际敏感度 d(BWE)/dL", "derivativeL", dL.toFixed(3), "偏导数值", "每增加 1 期补货时滞所引起的方差放大增加速度 (2/p + 4L/p²)"],
      ["敏感度", "平滑期边际敏感度 d(BWE)/dp", "derivativeP", dP.toFixed(3), "偏导数值", "每增加 1 阶平滑期对波动放大的抑制平滑速率"],
    ];

    paramRows.forEach(row => {
      csvLines.push(row.map(escapeCsv).join(","));
    });
    csvLines.push("");

    // 2. 全网五级节点汇总统计指标 (Multi-Echelon Performance Metrics)
    csvLines.push(escapeCsv("--- [第 2 部分] 全网五级节点汇总统计指标台账 (Multi-Echelon Performance Metrics) ---"));
    csvLines.push([
      "层级层序",
      "节点英文标识",
      "节点中文名称",
      "输入需求方差 (Var D)",
      "发出订单方差 (Var Q)",
      "实测方差放大倍数 (BWE)",
      "平均在库库存水平 (件)",
      "单期持有与资金成本 (元)",
      "客户现货履约率 (OTIF %)",
      "累计缺货期数 (期)",
      "系统运行风险诊断",
    ].map(escapeCsv).join(","));

    simResult.metrics.forEach((m, idx) => {
      const isHighRisk = m.bwe >= 2.5 || m.stockoutCount > 1;
      csvLines.push([
        idx + 1,
        m.key,
        m.name,
        m.demandVariance.toFixed(2),
        m.orderVariance.toFixed(2),
        m.bwe.toFixed(2),
        m.avgInventory.toFixed(1),
        m.holdingCost,
        `${m.serviceLevel.toFixed(1)}%`,
        m.stockoutCount,
        isHighRisk ? "高风险预警 (波动过冲/断货)" : "受控 (正常平稳运行)",
      ].map(escapeCsv).join(","));
    });
    csvLines.push("");

    // 3. 财务成本与经济学损耗穿透估算 (Financial Cost Breakdown)
    csvLines.push(escapeCsv("--- [第 3 部分] 供应链财务成本与经济学损耗穿透估算 (Financial & Loss Estimates) ---"));
    csvLines.push([
      "损耗维度分类",
      "估算损耗金额 (元)",
      "占全链总损耗比重 (%)",
      "业务计算口径与归因解释",
    ].map(escapeCsv).join(","));

    const lossItems = [
      ["资金沉淀与在库持有成本", financialMetrics.holdingCost, ((financialMetrics.holdingCost / (financialMetrics.totalLossCost || 1)) * 100).toFixed(1) + "%", "单期全网物理库存资金利息、仓库租金与保险维护费用（2.5元/件/期）"],
      ["缺货违约与客户流失机会成本", financialMetrics.stockoutPenaltyCost, ((financialMetrics.stockoutPenaltyCost / (financialMetrics.totalLossCost || 1)) * 100).toFixed(1) + "%", "终端断货导致的商誉受损、订单流失及渠道违约罚金（320元/次）"],
      ["产能过冲与加急物流运费溢价", financialMetrics.surgeCapacityCost, ((financialMetrics.surgeCapacityCost / (financialMetrics.totalLossCost || 1)) * 100).toFixed(1) + "%", "上游剧烈波动引发的临时加班换模与航空/专车加急运费"],
      ["呆滞跌价与物料损耗成本", financialMetrics.obsolescenceCost, ((financialMetrics.obsolescenceCost / (financialMetrics.totalLossCost || 1)) * 100).toFixed(1) + "%", "积压库存贬值、过季损耗与仓储报废（约占持有成本 22%）"],
      ["全网单期综合损耗与运营沉没总额", financialMetrics.totalLossCost, "100.0%", "全链在当前波动与协同状态下的单期综合运营经济损耗"],
      ["协同机制预期节约优化空间 (ROI)", financialMetrics.potentialSavings, "约 42.0%", "全面落地 VMI + CPFR + POS 穿透后预计可削减的综合损耗总额"],
    ];

    lossItems.forEach(row => {
      csvLines.push(row.map(escapeCsv).join(","));
    });
    csvLines.push("");

    // 4. 全时程各节点动态时序详细数据表 (Step-by-Step Simulation Time Series 0-29)
    csvLines.push(escapeCsv("--- [第 4 部分] 全时程各节点动态时序明细数据 (Step-by-Step Simulation Time Series 0~29) ---"));
    csvLines.push([
      "时间步 (Step t)",
      "层级代码 (Echelon Key)",
      "层级名称 (Echelon Name)",
      "输入需求量 (Demand)",
      "发出订单量 (Order)",
      "期末在库库存 (Inventory)",
      "在途管道物料 (Pipeline)",
      "欠货缺货量 (Backlog)",
      "当期是否发生缺货 (Stockout)",
    ].map(escapeCsv).join(","));

    const echelonKeys: (keyof typeof simResult.timeSeries)[] = [
      "retailer",
      "wholesaler",
      "distributor",
      "manufacturer",
      "supplier",
    ];

    const totalSteps = simResult.timeSeries.retailer?.length || 30;
    for (let t = 0; t < totalSteps; t++) {
      echelonKeys.forEach(ech => {
        const item = simResult.timeSeries[ech]?.[t];
        if (!item) return;
        const echMetric = simResult.metrics.find(m => m.key === ech);
        csvLines.push([
          `t=${t}`,
          ech,
          echMetric?.name || ech,
          item.demand,
          item.order,
          item.inventory,
          item.pipeline,
          item.backlog,
          item.backlog > 0 ? "是 (缺货)" : "否 (正常)",
        ].map(escapeCsv).join(","));
      });
    }
    csvLines.push("");

    // 5. 全网全时程横向宽表矩阵 (Matrix View for Python / Pandas / Excel Pivot)
    csvLines.push(escapeCsv("--- [第 5 部分] 全网全时程横向宽表矩阵 (Pivot Matrix View for Pandas & Excel) ---"));
    csvLines.push([
      "时步 (Step)",
      "零售商_输入需求",
      "零售商_发出订单",
      "零售商_在库库存",
      "零售商_在途物料",
      "零售商_缺货欠货",
      "批发商_输入需求",
      "批发商_发出订单",
      "批发商_在库库存",
      "批发商_在途物料",
      "批发商_缺货欠货",
      "分销商_输入需求",
      "分销商_发出订单",
      "分销商_在库库存",
      "分销商_在途物料",
      "分销商_缺货欠货",
      "制造商_输入需求",
      "制造商_发出订单",
      "制造商_在库库存",
      "制造商_在途物料",
      "制造商_缺货欠货",
      "供应商_输入需求",
      "供应商_发出订单",
      "供应商_在库库存",
      "供应商_在途物料",
      "供应商_缺货欠货",
    ].map(escapeCsv).join(","));

    for (let t = 0; t < totalSteps; t++) {
      const ret = simResult.timeSeries.retailer?.[t] || { demand: 0, order: 0, inventory: 0, pipeline: 0, backlog: 0 };
      const who = simResult.timeSeries.wholesaler?.[t] || { demand: 0, order: 0, inventory: 0, pipeline: 0, backlog: 0 };
      const dis = simResult.timeSeries.distributor?.[t] || { demand: 0, order: 0, inventory: 0, pipeline: 0, backlog: 0 };
      const man = simResult.timeSeries.manufacturer?.[t] || { demand: 0, order: 0, inventory: 0, pipeline: 0, backlog: 0 };
      const sup = simResult.timeSeries.supplier?.[t] || { demand: 0, order: 0, inventory: 0, pipeline: 0, backlog: 0 };

      csvLines.push([
        t,
        ret.demand, ret.order, ret.inventory, ret.pipeline, ret.backlog,
        who.demand, who.order, who.inventory, who.pipeline, who.backlog,
        dis.demand, dis.order, dis.inventory, dis.pipeline, dis.backlog,
        man.demand, man.order, man.inventory, man.pipeline, man.backlog,
        sup.demand, sup.order, sup.inventory, sup.pipeline, sup.backlog,
      ].map(escapeCsv).join(","));
    }

    const fullCsvContent = "\uFEFF" + csvLines.join("\r\n");
    const blob = new Blob([fullCsvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `bullwhip_simulation_full_dataset_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // 过滤后的表格数据
  const filteredMetrics = useMemo(() => {
    if (tableFilter === "high-risk") {
      return simResult.metrics.filter((m) => m.bwe >= 2.0 || m.stockoutCount > 1 || m.serviceLevel < 92);
    }
    return simResult.metrics;
  }, [simResult.metrics, tableFilter]);

  return (
    <div id="data-analysis-report-container" className="space-y-6">
      {/* ========================================================================= */}
      {/* 模块主引言与审计顶栏 */}
      {/* ========================================================================= */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
                模块 08 · 多维量化审计
              </span>
              <span className="text-xs text-stone-500 font-mono">
                Multi-Echelon Quantitative Audit & Executive Governance Suite
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <span>数据分析与报告：多维度量化评估与一键审计导出</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono font-medium">
                6大核心审计子模块
              </span>
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
              涵盖<strong className="text-stone-800">宏观健康度评分</strong>、<strong className="text-stone-800">全网五级节点台账</strong>、<strong className="text-stone-800">财务损耗穿透</strong>、<strong className="text-stone-800">四大诱因量化矩阵</strong>、<strong className="text-stone-800">协同对标基线</strong>及<strong className="text-stone-800">敏捷改善路线图</strong>，支持 CSV/Markdown/PDF 多格式一键审计导出。
            </p>
          </div>

          {/* 审计操作工具条 */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="export-full-simulation-csv-btn"
              onClick={handleDownloadFullSimulationCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 shadow-2xs transition-all cursor-pointer"
              title="导出供应链模拟全套运行参数及全部结果数据为标准 CSV 文件（含全部参数、各节点指标与30期动态时序），支持外部离线科研与工程分析"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>{csvDownloaded ? "全量 CSV 数据已导出" : "导出全量仿真 CSV (参数+全结果)"}</span>
            </button>

            <button
              id="copy-text-report-btn"
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 shadow-2xs transition-all cursor-pointer"
              title="一键复制完整文本审计报告至剪贴板"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-teal-600" /> : <Download className="w-3.5 h-3.5" />}
              <span>{copied ? "已复制到剪贴板" : "复制审计报告"}</span>
            </button>

            <button
              id="print-audit-report-btn"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-stone-100 hover:bg-stone-800 shadow-2xs transition-all cursor-pointer"
              title="调用打印机或另存为高保真 PDF 报表"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印 / 导出 PDF</span>
            </button>
          </div>
        </div>

        {/* 审计元数据标签条 */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 font-mono pt-3">
          <div className="flex items-center gap-3 flex-wrap">
            <span>报告编号: <strong className="text-stone-800">REP-BWE-2026</strong></span>
            <span>·</span>
            <span>生成时间: {reportGeneratedTime}</span>
            <span>·</span>
            <span>仿真步长: T=30 期切片</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-stone-700 font-sans font-medium">MIT/Stanford 标准量化模型校准中</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 子模块 1：宏观运营与全景健康度雷达/KPI看板 */}
      {/* ========================================================================= */}
      <div id="submodule-1-kpi-scorecard" className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-stone-800" />
            <h3 className="text-sm font-bold text-stone-900">
              子模块 01 · 宏观运营与供应链综合健康度评分看板 (Executive Health Scorecard)
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-mono">Macro KPI & Radar Assessment</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* 综合健康得分圆盘卡 */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center text-center justify-center space-y-2">
            <div className="text-xs text-stone-500 font-medium">全网综合抗鞭健康指数</div>
            <div className="relative flex items-center justify-center my-1">
              <div className="w-24 h-24 rounded-full border-4 border-stone-200 flex flex-col items-center justify-center bg-white shadow-xs">
                <span className="text-3xl font-mono font-bold text-stone-900">{healthScore}</span>
                <span className="text-[10px] text-stone-400 font-mono">/ 100 分</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold font-mono shadow-2xs" style={{}} >
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${riskBadgeColor}`}>
                评级: {riskGrade} 级 · {riskLevel}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed px-2">
              综合权衡方差放大比、客户交付率、断货违约与库存积压损耗等多维实测数据加权得出。
            </p>
          </div>

          {/* 4 项核心宏观量化切片看板 */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 全链平均客户现货率 */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>全链加权现货交付率 (OTIF)</span>
                <Percent className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="text-2xl font-mono font-bold text-stone-900 mt-1.5">
                {avgServiceLevel}%
              </div>
              <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                {avgServiceLevel >= 95 ? (
                  <span className="text-teal-700 flex items-center font-medium">
                    <ArrowUpRight className="w-3 h-3" /> 交付韧性卓越
                  </span>
                ) : (
                  <span className="text-red-700 flex items-center font-medium">
                    <ArrowDownRight className="w-3 h-3" /> 存在缺货断流风险
                  </span>
                )}
                <span>(行业基线: 92%)</span>
              </div>
            </div>

            {/* 制造端实测方差放大比 */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>制造端实测方差放大比</span>
                <Zap className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-2xl font-mono font-bold text-amber-800 mt-1.5">
                {maxBwe}x
              </div>
              <div className="text-[11px] text-stone-500 mt-1 font-mono">
                理论最低物理下界: {theoreticalBwe.toFixed(2)}x
              </div>
            </div>

            {/* 全链单期持有与损耗总额 */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>全链单期综合损耗与持有额</span>
                <DollarSign className="w-3.5 h-3.5 text-stone-700" />
              </div>
              <div className="text-2xl font-mono font-bold text-stone-900 mt-1.5">
                ¥{financialMetrics.totalLossCost.toLocaleString()}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                含库存占用、断货罚金与产能过冲
              </div>
            </div>

            {/* 缺货累计次数与风险期 */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors shadow-2xs">
              <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
                <span>全链累计断货缺口频次</span>
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div className="text-2xl font-mono font-bold text-stone-900 mt-1.5">
                {totalStockoutCount} <span className="text-xs font-normal text-stone-500">期次</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                {totalStockoutCount > 3 ? "发生严重跨期欠货违约" : "供应链交付相对平稳"}
              </div>
            </div>
          </div>
        </div>

        {/* 5大维度量化健康度进度条 */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-stone-700 mb-2.5">
            供应链系统动力学 5 维运行健康度雷达解构：
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                name: "需求信号保真度",
                score: Math.max(10, Math.min(100, Math.round(100 - (maxBwe - 1) * 16))),
                desc: "抑制方差膨胀能力",
              },
              {
                name: "履约现货满足率",
                score: Math.round(avgServiceLevel),
                desc: "客户订单现货交付",
              },
              {
                name: "资金周转敏捷度",
                score: Math.max(20, Math.min(100, Math.round(100 - (totalHoldingCost / (params.demandMean * 25)) * 20))),
                desc: "沉没在库资本周转",
              },
              {
                name: "订货批量流动性",
                score: params.batchingSize === 1 ? 95 : params.batchingSize === 2 ? 65 : 40,
                desc: "消除脉冲批量阻滞",
              },
              {
                name: "机制协同成熟度",
                score: (params.enableVMI ? 35 : 0) + (params.enableCPFR ? 35 : 0) + (params.enablePOSSharing ? 30 : 0),
                desc: "VMI / CPFR / POS 协同",
              },
            ].map((dim, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800">{dim.name}</span>
                  <span className="font-mono font-bold text-stone-900">{dim.score}分</span>
                </div>
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      dim.score >= 80 ? "bg-teal-600" : dim.score >= 60 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <div className="text-[10px] text-stone-500">{dim.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 子模块 2：五级全网节点方差与物理管道审计清单 */}
      {/* ========================================================================= */}
      <div id="submodule-2-echelon-table" className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-stone-800" />
            <h3 className="text-sm font-bold text-stone-900">
              子模块 02 · 五级全网节点方差与在库管道审计台账 (Echelon Variance & Pipeline Audit)
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-stone-500">视图筛选:</span>
            <button
              onClick={() => setTableFilter("all")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                tableFilter === "all" ? "bg-stone-900 text-stone-100" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              全部 5 节点
            </button>
            <button
              onClick={() => setTableFilter("high-risk")}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                tableFilter === "high-risk" ? "bg-amber-700 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              仅高风险预警节点
            </button>

            <div className="h-4 w-px bg-stone-200 hidden sm:block" />

            <button
              id="export-submodule-csv-btn"
              onClick={handleDownloadFullSimulationCsv}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg font-semibold border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 shadow-2xs transition-all cursor-pointer"
              title="导出当前仿真全套参数配置及 5 级节点 30 期全量时序数据为标准 CSV 文件"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>导出全量 CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/90 text-stone-700 font-semibold border-b border-stone-200">
                <th className="py-3 px-4">供应链层级节点</th>
                <th className="py-3 px-3">输入需求方差 (Var D)</th>
                <th className="py-3 px-3">发出订单方差 (Var Q)</th>
                <th className="py-3 px-3">实测放大比 (BWE)</th>
                <th className="py-3 px-3">平均在库 (件)</th>
                <th className="py-3 px-3">单期持有成本</th>
                <th className="py-3 px-3">现货满足率 (OTIF)</th>
                <th className="py-3 px-3">缺货期数</th>
                <th className="py-3 px-4 text-right">综合运行评级</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMetrics.map((m) => {
                const isHighRisk = m.bwe >= 2.5 || m.stockoutCount > 1;
                return (
                  <tr key={m.key} className={`hover:bg-stone-50/80 transition-colors ${isHighRisk ? "bg-amber-50/20" : ""}`}>
                    <td className="py-3 px-4 font-semibold text-stone-900 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                      <span>{m.name}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-600">{m.demandVariance.toFixed(1)}</td>
                    <td className="py-3 px-3 font-mono text-stone-900 font-bold">{m.orderVariance.toFixed(1)}</td>
                    <td className="py-3 px-3 font-mono">
                      <span className={`px-2 py-0.5 rounded font-bold inline-block ${
                        m.bwe > 3.0 ? "bg-red-100 text-red-800" : m.bwe > 1.8 ? "bg-amber-100 text-amber-800" : "bg-teal-100 text-teal-800"
                      }`}>
                        {m.bwe}x
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-700">{m.avgInventory} 件</td>
                    <td className="py-3 px-3 font-mono text-stone-800 font-semibold">¥{m.holdingCost.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono font-medium text-teal-800">{m.serviceLevel}%</td>
                    <td className="py-3 px-3 font-mono">
                      {m.stockoutCount > 0 ? (
                        <span className="text-red-600 font-semibold">{m.stockoutCount} 期缺货</span>
                      ) : (
                        <span className="text-stone-400">0 缺货</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isHighRisk ? (
                        <span className="inline-flex items-center gap-1 text-red-700 font-medium text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> 波动过冲
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-teal-700 font-medium text-[11px]">
                          <CheckCircle className="w-3 h-3" /> 运行受控
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 外部离线分析支持导引说明条 */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex items-start sm:items-center gap-2.5">
            <Database className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
            <span className="leading-relaxed">
              <strong>外部科研与工程离线分析支持：</strong>
              导出的全量 CSV 数据集涵盖当前 11 项仿真运行参数配置（提前期 L、平滑期 p、批量 Q、配额 α 等）、Chen et al. 理论方差放大下界、5 级节点绩效审计汇总指标及 30 期动态时序数据（含长表与横向宽表矩阵），已嵌入 UTF-8 BOM，支持无缝导入 Microsoft Excel、Python Pandas (<code className="font-mono text-stone-800 bg-stone-200/70 px-1 py-0.5 rounded">pd.read_csv</code>)、R 语言、SPSS 及 MATLAB。
            </span>
          </div>
          <button
            onClick={handleDownloadFullSimulationCsv}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-emerald-800 font-semibold shadow-2xs transition-colors cursor-pointer text-xs"
            title="一键导出全套参数与全时程数据 CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>立即导出 CSV</span>
          </button>
        </div>

        <p className="text-[11px] text-stone-500 leading-relaxed font-mono">
          * 判定准则：BWE = Var(发出订单) / Var(输入需求)。根据 Forrester 系统动力学与李效良定理，越靠近上游制造端与原料端，波动方差呈非线性级联膨胀。
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 子模块 3：成本解构与财务经济学损耗归因分析 */}
      {/* ========================================================================= */}
      <div id="submodule-3-financial-breakdown" className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-stone-800" />
            <h3 className="text-sm font-bold text-stone-900">
              子模块 03 · 成本解构与财务经济学损耗穿透归因 (Financial Cost Breakdown & Loss Attribution)
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-mono">Cost Structure & ROI Analytics</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 左侧：4 大财务损耗项卡片 */}
          <div className="lg:col-span-2 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 资金在库占用成本 */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>资金沉淀与在库持有成本</span>
                  <span className="font-mono text-stone-400">Capital Cost</span>
                </div>
                <div className="text-lg font-mono font-bold text-stone-900 mt-1">
                  ¥{financialMetrics.holdingCost.toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  单期占用全链营运资金与仓储租金（按 2.5元/件/期 测算）。
                </p>
              </div>

              {/* 缺货惩罚与违约金 */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>缺货违约与客户流失机会成本</span>
                  <span className="font-mono text-stone-400">Stockout Penalty</span>
                </div>
                <div className="text-lg font-mono font-bold text-red-800 mt-1">
                  ¥{financialMetrics.stockoutPenaltyCost.toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  终端缺货导致的商誉减损、退货违约及渠道转单潜在损失。
                </p>
              </div>

              {/* 紧急调配与加急生产溢价 */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>产能过冲与加急物流运费溢价</span>
                  <span className="font-mono text-stone-400">Expediting Surge</span>
                </div>
                <div className="text-lg font-mono font-bold text-amber-800 mt-1">
                  ¥{financialMetrics.surgeCapacityCost.toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  波动尖峰造成的工厂临时倒班加班费与航空/专车加急运费。
                </p>
              </div>

              {/* 呆滞折价损耗 */}
              <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/70">
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>呆滞跌价与物理损耗成本</span>
                  <span className="font-mono text-stone-400">Obsolescence</span>
                </div>
                <div className="text-lg font-mono font-bold text-stone-800 mt-1">
                  ¥{financialMetrics.obsolescenceCost.toLocaleString()}
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  产品生命周期缩短造成的临期折价处理与损耗计提。
                </p>
              </div>
            </div>

            {/* 成本结构堆叠进度条 */}
            <div className="p-3.5 rounded-xl bg-white border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-800">全网综合损耗资金构成透视图</span>
                <span className="font-mono text-stone-500">总计: ¥{financialMetrics.totalLossCost.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-stone-100 rounded-full flex overflow-hidden">
                <div 
                  className="bg-stone-800 h-full" 
                  style={{ width: `${(financialMetrics.holdingCost / financialMetrics.totalLossCost) * 100}%` }}
                  title="在库持有成本"
                />
                <div 
                  className="bg-red-600 h-full" 
                  style={{ width: `${(financialMetrics.stockoutPenaltyCost / financialMetrics.totalLossCost) * 100}%` }}
                  title="缺货罚金"
                />
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${(financialMetrics.surgeCapacityCost / financialMetrics.totalLossCost) * 100}%` }}
                  title="产能加急溢价"
                />
                <div 
                  className="bg-stone-400 h-full" 
                  style={{ width: `${(financialMetrics.obsolescenceCost / financialMetrics.totalLossCost) * 100}%` }}
                  title="呆滞跌价"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-stone-500 pt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-800" />在库持有</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600" />缺货罚金</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />加急产能溢价</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-400" />呆滞跌价</span>
              </div>
            </div>
          </div>

          {/* 右侧：协同治理降本收益测算 (ROI) */}
          <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-950">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <span>协同治理降本 ROI 预测收益</span>
              </div>
              <div className="text-3xl font-mono font-bold text-teal-950 mt-2">
                ¥{financialMetrics.potentialSavings.toLocaleString()}
              </div>
              <div className="text-xs text-teal-800 mt-1 font-medium">
                预计单期综合损失可削减约 42.0%
              </div>
              <p className="text-[11px] text-teal-900/80 mt-2 leading-relaxed">
                通过消除各层级的人为双倍下单、拉通 POS 实时流水并将订货批量降至最低，全网库存水线可大幅压降，同时免除加急生产与断货违约罚金。
              </p>
            </div>

            <div className="pt-3 border-t border-teal-200/60 space-y-1.5 text-xs text-teal-950 font-medium">
              <div className="flex justify-between">
                <span>年化营运资金释放 (52周):</span>
                <strong className="font-mono">¥{(financialMetrics.potentialSavings * 52).toLocaleString()}</strong>
              </div>
              <div className="flex justify-between">
                <span>库存周转天数 (ITO) 改善:</span>
                <strong className="font-mono">约 -38% 周期</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 子模块 4：四大诱因敏感性深度根因诊断矩阵 */}
      {/* ========================================================================= */}
      <div id="submodule-4-root-causes" className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-stone-800" />
            <h3 className="text-sm font-bold text-stone-900">
              子模块 04 · 李效良四大成因深度量化诊断矩阵 (Hau Lee's 4 Causes Root-Cause Matrix)
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-mono">Stanford SCG Causality Audit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fourCausesAudit.map((cause) => (
            <div key={cause.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-all space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{cause.title}</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">{cause.theory}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${cause.severityColor}`}>
                  {cause.severity}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-stone-200/80 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-stone-600">
                  <span>当前沙盒诱发切片参数:</span>
                  <span className="font-mono font-semibold text-stone-800">{cause.currentParam}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>估计方差放大贡献比:</span>
                  <span className="font-mono font-bold text-amber-700">~{cause.share}% 权重</span>
                </div>
              </div>

              <div className="text-[11px] text-stone-600 flex items-start gap-1">
                <span className="font-semibold text-teal-800 shrink-0">对冲对策:</span>
                <span>{cause.solution}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 子模块 5：治理协同策略前后成效对比与敏感度测算 */}
      {/* ========================================================================= */}
      <div id="submodule-5-benchmark-comparison" className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-stone-800" />
            <h3 className="text-sm font-bold text-stone-900">
              子模块 05 · 基线孤岛运营 vs 协同治理成效深度对标 (Baseline vs. Collaborative Benchmark)
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-mono">Comparative Scenario Analysis</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100/90 text-stone-700 font-semibold border-b border-stone-200">
                <th className="py-3 px-4">对标关键绩效维度 (KPI Dimension)</th>
                <th className="py-3 px-4 text-stone-500">传统孤岛运营基线 (Baseline)</th>
                <th className="py-3 px-4 text-stone-900 bg-stone-50">当前实验切片状态 (Current)</th>
                <th className="py-3 px-4 text-teal-800 bg-teal-50/50">全面协同治理目标 (Target)</th>
                <th className="py-3 px-4 text-right">改善幅度评估</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr className="hover:bg-stone-50/50">
                <td className="py-3 px-4 font-semibold text-stone-900">制造端峰值方差放大比 (Max BWE)</td>
                <td className="py-3 px-4 font-mono text-stone-500">{benchmarkComparison.baseline.maxBwe}x</td>
                <td className="py-3 px-4 font-mono font-bold text-amber-800 bg-stone-50/50">{benchmarkComparison.current.maxBwe}x</td>
                <td className="py-3 px-4 font-mono font-bold text-teal-700 bg-teal-50/30">{benchmarkComparison.target.maxBwe}x</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-teal-700">
                  {benchmarkComparison.current.maxBwe < benchmarkComparison.baseline.maxBwe 
                    ? `-${(((benchmarkComparison.baseline.maxBwe - benchmarkComparison.current.maxBwe) / benchmarkComparison.baseline.maxBwe) * 100).toFixed(0)}% 钝化`
                    : "+波动放大"}
                </td>
              </tr>
              <tr className="hover:bg-stone-50/50">
                <td className="py-3 px-4 font-semibold text-stone-900">全链加权现货交付率 (OTIF)</td>
                <td className="py-3 px-4 font-mono text-stone-500">{benchmarkComparison.baseline.avgServiceLevel}%</td>
                <td className="py-3 px-4 font-mono font-bold text-stone-900 bg-stone-50/50">{benchmarkComparison.current.avgServiceLevel}%</td>
                <td className="py-3 px-4 font-mono font-bold text-teal-700 bg-teal-50/30">{benchmarkComparison.target.avgServiceLevel}%</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-teal-700">
                  +{Math.max(0, benchmarkComparison.current.avgServiceLevel - benchmarkComparison.baseline.avgServiceLevel).toFixed(1)}% 提升
                </td>
              </tr>
              <tr className="hover:bg-stone-50/50">
                <td className="py-3 px-4 font-semibold text-stone-900">全链单期综合损失总额 (Total Loss)</td>
                <td className="py-3 px-4 font-mono text-stone-500">¥{benchmarkComparison.baseline.totalCost.toLocaleString()}</td>
                <td className="py-3 px-4 font-mono font-bold text-stone-900 bg-stone-50/50">¥{benchmarkComparison.current.totalCost.toLocaleString()}</td>
                <td className="py-3 px-4 font-mono font-bold text-teal-700 bg-teal-50/30">¥{benchmarkComparison.target.totalCost.toLocaleString()}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-teal-700">
                  -¥{Math.max(0, benchmarkComparison.baseline.totalCost - benchmarkComparison.current.totalCost).toLocaleString()}
                </td>
              </tr>
              <tr className="hover:bg-stone-50/50">
                <td className="py-3 px-4 font-semibold text-stone-900">全链安全库存储备规模 (Safety Stock)</td>
                <td className="py-3 px-4 font-mono text-stone-500">~{benchmarkComparison.baseline.safetyStockUnits} 件</td>
                <td className="py-3 px-4 font-mono font-bold text-stone-900 bg-stone-50/50">~{benchmarkComparison.current.safetyStockUnits} 件</td>
                <td className="py-3 px-4 font-mono font-bold text-teal-700 bg-teal-50/30">~{benchmarkComparison.target.safetyStockUnits} 件</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-teal-700">
                  约 -{Math.round(Math.max(0, (1 - benchmarkComparison.current.safetyStockUnits / benchmarkComparison.baseline.safetyStockUnits) * 100))}% 资金松绑
                </td>
              </tr>
              <tr className="hover:bg-stone-50/50">
                <td className="py-3 px-4 font-semibold text-stone-900">端到端订单履行周期 (Order Cycle)</td>
                <td className="py-3 px-4 font-mono text-stone-500">{benchmarkComparison.baseline.orderCycleDays} 天</td>
                <td className="py-3 px-4 font-mono font-bold text-stone-900 bg-stone-50/50">{benchmarkComparison.current.orderCycleDays} 天</td>
                <td className="py-3 px-4 font-mono font-bold text-teal-700 bg-teal-50/30">{benchmarkComparison.target.orderCycleDays} 天</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-teal-700">
                  压缩至 {benchmarkComparison.current.orderCycleDays} 天
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 子模块 6：全网合规审计核查表与阶梯式改善路线图 */}
      {/* ========================================================================= */}
      <div id="submodule-6-roadmap-compliance" className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-stone-800" />
            <h3 className="text-sm font-bold text-stone-900">
              子模块 06 · 全网合规审计核查清单与阶梯改善路线图 (Compliance Checklist & Roadmap)
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-mono">Governance Implementation Matrix</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* 左侧：可交互合规核查清单 (Checklist) */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-teal-700" />
                <span>供应链抗鞭合规审计核查项 (点击复核确认)</span>
              </h4>
              <span className="text-[11px] font-mono text-stone-500">
                已达标: {Object.values(checkedItems).filter(Boolean).length} / 6
              </span>
            </div>

            <div className="space-y-2">
              {[
                {
                  key: "pos_integration",
                  label: "穿透终端 POS 真实销售流水作为全网唯一计划源",
                  detail: "杜绝各节点以失真的下游订货单作为预测输入",
                },
                {
                  key: "vmi_execution",
                  label: "在核心分销与制造环节推行 VMI (供应商管理库存)",
                  detail: "剥夺下游虚假补单决策权，由供应商依据实时在库自动补货",
                },
                {
                  key: "cpfr_protocol",
                  label: "签署 CPFR 协同预测与补货协议与短缺配额公约",
                  detail: "依据历史真实提货份额分配产能，彻底瓦解博弈加倍动机",
                },
                {
                  key: "leadtime_leanness",
                  label: "端到端精益压缩生产与运输提前期 (L ≤ 2期)",
                  detail: "提前期呈二次方放大波动，压缩时滞是根治牛鞭的物理基石",
                },
                {
                  key: "batching_rational",
                  label: "降低起订量 MOQ 门槛，推广高频小批量 Milk-Run 拼箱",
                  detail: "消除大批量脉冲集中入库造成的剧烈震荡",
                },
                {
                  key: "rationing_transparency",
                  label: "建立全链透明在途管道可视化监控数字看板",
                  detail: "杜绝因看不清在途物资造成的恐慌性过度补仓",
                },
              ].map((item) => {
                const checked = checkedItems[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleCheckItem(item.key)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                      checked
                        ? "bg-white border-teal-300 text-stone-900 shadow-2xs"
                        : "bg-stone-100/60 border-stone-200 text-stone-500 hover:border-stone-300"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-teal-700">
                      {checked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-stone-400" />}
                    </div>
                    <div className="text-xs">
                      <div className={`font-semibold ${checked ? "text-stone-900" : "text-stone-600"}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{item.detail}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右侧：三阶段敏捷改善落地路线图 (Action Roadmap) */}
          <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
            <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-700" />
              <span>三阶段敏捷改善落地路线图 (3-Stage Action Roadmap)</span>
            </h4>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-stone-200 before:z-0">
              {/* 阶段 1 */}
              <div className="relative z-10 pl-7 space-y-1">
                <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[9px] font-bold">
                  1
                </div>
                <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                  <span>阶段一：0 ~ 30 天 · 快速止血与控制订货上限</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px]">应急期</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  冻结跨节点投机性双倍订货，依据过去 6 期平均销量设立订货硬顶限额；取消促销期大客户前瞻性预买优惠。
                </p>
              </div>

              {/* 阶段 2 */}
              <div className="relative z-10 pl-7 space-y-1">
                <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[9px] font-bold">
                  2
                </div>
                <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                  <span>阶段二：1 ~ 3 个月 · 机制重构与 VMI/CPFR 试点</span>
                  <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px]">协同期</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  在头部零售商与制造基地建立 VMI 自动补货机制，实施循环取货（Milk-run）降低起订批量，共享滚动 13 周销售计划。
                </p>
              </div>

              {/* 阶段 3 */}
              <div className="relative z-10 pl-7 space-y-1">
                <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-stone-900 text-white flex items-center justify-center text-[9px] font-bold">
                  3
                </div>
                <div className="text-xs font-bold text-stone-900 flex items-center gap-2">
                  <span>阶段三：3 ~ 6 个月 · 数字孪生与 POS 穿透全链闭环</span>
                  <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-800 text-[10px]">数字化</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  接入终端收银机 POS 实时数据中台，全网打通在途物流轨迹与动态安全库存（DDMRP），形成自适应抗扰闭环。
                </p>
              </div>
            </div>

            {/* RACI 治理责任矩阵简表 */}
            <div className="pt-2 border-t border-stone-100">
              <div className="text-[11px] font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-stone-500" />
                <span>跨部门治理 RACI 职责矩阵：</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-mono">
                <div className="p-1.5 rounded bg-stone-50 border border-stone-200">
                  <div className="font-bold text-stone-800">零售渠道</div>
                  <div className="text-stone-500 mt-0.5">POS数据开箱 (A)</div>
                </div>
                <div className="p-1.5 rounded bg-stone-50 border border-stone-200">
                  <div className="font-bold text-stone-800">供应链计划</div>
                  <div className="text-stone-500 mt-0.5">CPFR联合预测 (R)</div>
                </div>
                <div className="p-1.5 rounded bg-stone-50 border border-stone-200">
                  <div className="font-bold text-stone-800">采购商务</div>
                  <div className="text-stone-500 mt-0.5">MOQ批量松绑 (C)</div>
                </div>
                <div className="p-1.5 rounded bg-stone-50 border border-stone-200">
                  <div className="font-bold text-stone-800">智能制造</div>
                  <div className="text-stone-500 mt-0.5">柔性排产换线 (I)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
