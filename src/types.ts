/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LabTier = "algebra-sim" | "interaction-playback" | "practice-decision";

export type ModuleId =
  | "theoretical-algebra" // 1. 理论代数与建模
  | "cascade-sandbox"     // 2. 2D级联沙盒
  | "order-amplification" // 3. 订单放大演播
  | "damping-control"     // 4. 衰减控制演播
  | "case-studies"        // 5. 四大案例剖析
  | "system-dynamics"     // 6. 系统动力学仿真
  | "ai-dialogue"         // 7. AI智能对话窗口
  | "data-report"         // 8. 数据分析与报告
  | "knowledge-graph";    // 9. 知识导引与图谱

export interface ModuleInfo {
  id: ModuleId;
  number: number;
  name: string;
  tier: LabTier;
  tierName: string;
  subtitle: string;
  badge: string;
}

export type EchelonKey = "retailer" | "wholesaler" | "distributor" | "manufacturer" | "supplier";

export interface EchelonConfig {
  key: EchelonKey;
  name: string;
  shortName: string;
  role: string;
  color: string;
  bgLight: string;
  borderLight: string;
}

export interface SimulationParameters {
  leadTime: number;         // 提前期 L (1 - 8)
  smoothingP: number;       // 预测平滑参数 p (2 - 12)
  demandMean: number;       // 基础需求均值 (100)
  demandVolatility: number; // 随机波动率 % (5% - 50%)
  shockType: "pulse" | "step" | "sine" | "random";
  shockMagnitude: number;   // 冲击幅度 %
  batchingSize: number;     // 订货批量 Q (1 = 无批量, 50, 100...)
  rationingRatio: number;   // 配额供应比率 α (0.5 - 1.0)
  enableVMI: boolean;       // 开启 VMI
  enableCPFR: boolean;      // 开启 CPFR
  enablePOSSharing: boolean;// 开启 POS 实时共享
}

export interface EchelonTimeData {
  time: number;
  demand: number;
  order: number;
  inventory: number;
  backlog: number;
  pipeline: number;
}

export interface EchelonMetrics {
  key: EchelonKey;
  name: string;
  demandVariance: number;
  orderVariance: number;
  bwe: number; // Order Var / Demand Var
  avgInventory: number;
  holdingCost: number;
  serviceLevel: number; // 0-100%
  stockoutCount: number;
}

export interface CaseStudyItem {
  id: string;
  title: string;
  company: string;
  year: string;
  industry: string;
  summary: string;
  symptom: string;
  rootCause: string;
  mechanism: string[];
  solution: string;
  impactMetrics: {
    label: string;
    before: string;
    after: string;
    unit: string;
  }[];
  quotes: string;
  tags: string[];
}

export interface SystemDynamicsState {
  time: number;
  customerDemand: number;
  retailerInventory: number;
  retailerPipeline: number;
  retailerOrder: number;
  wholesalerInventory: number;
  wholesalerPipeline: number;
  wholesalerOrder: number;
  distributorInventory: number;
  distributorPipeline: number;
  distributorOrder: number;
  manufacturerInventory: number;
  manufacturerWip: number;
  manufacturerProduction: number;
}

export interface KnowledgeNode {
  id: string;
  category: "cause" | "remedy" | "foundation" | "metric";
  title: string;
  subtitle: string;
  description: string;
  mathFormula?: string;
  keyAction: string;
  relatedIds: string[];
}
