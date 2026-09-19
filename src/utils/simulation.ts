/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EchelonKey, SimulationParameters, EchelonTimeData, EchelonMetrics, SystemDynamicsState } from "../types";

/**
 * 理论方差放大系数 (BWE) 计算
 * BWE >= 1 + 2L/p + 2L^2/p^2
 */
export function calculateTheoreticalBWE(leadTime: number, smoothingP: number): number {
  if (smoothingP <= 0) return 1;
  const term1 = 1;
  const term2 = (2 * leadTime) / smoothingP;
  const term3 = (2 * Math.pow(leadTime, 2)) / Math.pow(smoothingP, 2);
  return Number((term1 + term2 + term3).toFixed(3));
}

/**
 * 计算偏导数：对提前期 L 的敏感度 d(BWE)/dL = 2/p + 4L/p^2
 */
export function calculateDerivativeL(leadTime: number, smoothingP: number): number {
  return Number((2 / smoothingP + (4 * leadTime) / Math.pow(smoothingP, 2)).toFixed(3));
}

/**
 * 计算偏导数：对平滑参数 p 的敏感度 d(BWE)/dp = -2L/p^2 - 4L^2/p^3
 */
export function calculateDerivativeP(leadTime: number, smoothingP: number): number {
  return Number((-(2 * leadTime) / Math.pow(smoothingP, 2) - (4 * Math.pow(leadTime, 2)) / Math.pow(smoothingP, 3)).toFixed(3));
}

/**
 * 方差与均值统计工具
 */
export function calculateStats(values: number[]): { mean: number; variance: number; stdDev: number } {
  if (values.length === 0) return { mean: 0, variance: 0, stdDev: 0 };
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length > 1 ? values.length - 1 : 1);
  return {
    mean: Number(mean.toFixed(2)),
    variance: Number(variance.toFixed(2)),
    stdDev: Number(Math.sqrt(variance).toFixed(2)),
  };
}

/**
 * 生成终端需求序列 (T = 30 期)
 */
export function generateTerminalDemand(params: SimulationParameters, totalSteps = 30): number[] {
  const demands: number[] = [];
  const base = params.demandMean;
  const vol = params.demandVolatility / 100;

  for (let t = 0; t < totalSteps; t++) {
    let d = base;

    // 基础微扰
    const noise = (Math.sin(t * 1.3) * 0.5 + (Math.cos(t * 2.7) * 0.5)) * base * vol;
    d += noise;

    // 冲击注入
    if (params.shockType === "pulse") {
      // 脉冲冲击：在 t = 6 注入尖峰脉冲
      if (t === 6) {
        d += base * (params.shockMagnitude / 100);
      }
    } else if (params.shockType === "step") {
      // 阶跃跃迁：从 t >= 6 开始需求跃升并维持
      if (t >= 6) {
        d += base * (params.shockMagnitude / 100);
      }
    } else if (params.shockType === "sine") {
      // 正弦周期波动
      d += Math.sin((t / 3) * Math.PI) * base * (params.shockMagnitude / 100);
    } else if (params.shockType === "random") {
      // 复合随机布朗扰动
      const pseudoRandom = (Math.sin(t * 43.12) + Math.cos(t * 17.89)) / 2;
      d += pseudoRandom * base * (params.shockMagnitude / 100);
    }

    demands.push(Math.max(10, Math.round(d)));
  }

  return demands;
}

/**
 * 级联多级供应链仿真 (5级序列)
 */
export function simulateMultiEchelon(
  params: SimulationParameters,
  totalSteps = 30
): {
  timeSeries: Record<EchelonKey, EchelonTimeData[]>;
  metrics: EchelonMetrics[];
} {
  const echelons: EchelonKey[] = ["retailer", "wholesaler", "distributor", "manufacturer", "supplier"];
  const terminalDemands = generateTerminalDemand(params, totalSteps);

  const timeSeries: Record<EchelonKey, EchelonTimeData[]> = {
    retailer: [],
    wholesaler: [],
    distributor: [],
    manufacturer: [],
    supplier: [],
  };

  // 各级初始在手库存与管道
  const inventory: Record<EchelonKey, number> = {
    retailer: params.demandMean * 2,
    wholesaler: params.demandMean * 2.5,
    distributor: params.demandMean * 3,
    manufacturer: params.demandMean * 4,
    supplier: params.demandMean * 5,
  };

  const backlog: Record<EchelonKey, number> = {
    retailer: 0,
    wholesaler: 0,
    distributor: 0,
    manufacturer: 0,
    supplier: 0,
  };

  // 各级近期订单历史（用于移动平均预测）
  const orderHistories: Record<EchelonKey, number[]> = {
    retailer: [params.demandMean],
    wholesaler: [params.demandMean],
    distributor: [params.demandMean],
    manufacturer: [params.demandMean],
    supplier: [params.demandMean],
  };

  // 在途管道队列 (长度对应各自提前期 L)
  const pipelineQueues: Record<EchelonKey, number[]> = {
    retailer: Array(Math.max(1, params.leadTime)).fill(params.demandMean),
    wholesaler: Array(Math.max(1, params.leadTime)).fill(params.demandMean),
    distributor: Array(Math.max(1, params.leadTime)).fill(params.demandMean),
    manufacturer: Array(Math.max(1, params.leadTime)).fill(params.demandMean),
    supplier: Array(Math.max(1, params.leadTime)).fill(params.demandMean),
  };

  // 逐期时间步演进
  for (let t = 0; t < totalSteps; t++) {
    let incomingDemandForNextTier = terminalDemands[t];

    for (let i = 0; i < echelons.length; i++) {
      const ech = echelons[i];
      const demand = incomingDemandForNextTier;

      // 1. 到达物料（从在途管道前端出队）
      const arrivedGoods = pipelineQueues[ech].shift() ?? params.demandMean;
      inventory[ech] += arrivedGoods;

      // 2. 满足需求与欠货履约
      const totalRequested = demand + backlog[ech];
      let fulfilled = 0;
      if (inventory[ech] >= totalRequested) {
        fulfilled = totalRequested;
        inventory[ech] -= totalRequested;
        backlog[ech] = 0;
      } else {
        fulfilled = inventory[ech];
        backlog[ech] = totalRequested - fulfilled;
        inventory[ech] = 0;
      }

      // 3. 预测与订货决策
      orderHistories[ech].push(demand);
      const history = orderHistories[ech].slice(-params.smoothingP);
      const forecastDemand = history.reduce((s, v) => s + v, 0) / history.length;

      // 衰减控制修正：POS 实时共享或 VMI 直接使用终端需求或平滑计划
      let effectiveForecast = forecastDemand;
      if (params.enablePOSSharing) {
        // POS 直接穿透：以终端平滑为准
        const termHistory = terminalDemands.slice(Math.max(0, t - params.smoothingP), t + 1);
        effectiveForecast = termHistory.reduce((s, v) => s + v, 0) / Math.max(1, termHistory.length);
      }

      // 目标库存 Base-Stock Order-up-to: S = (L + 1) * Forecast + SafetyStock
      const safetyStock = Math.round(1.65 * Math.sqrt(params.leadTime) * (params.demandMean * (params.demandVolatility / 100)));
      const targetStock = (params.leadTime + 1) * effectiveForecast + safetyStock;

      const currentPipeline = pipelineQueues[ech].reduce((sum, v) => sum + v, 0);
      let rawOrder = targetStock - (inventory[ech] + currentPipeline - backlog[ech]);
      rawOrder = Math.max(0, Math.round(rawOrder));

      // 批量订货效应 (Order Batching)
      if (params.batchingSize > 1 && !params.enableVMI) {
        if (rawOrder > 0) {
          rawOrder = Math.ceil(rawOrder / params.batchingSize) * params.batchingSize;
        }
      }

      // 短缺博弈效应 (Rationing Gaming)
      if (params.rationingRatio < 1.0 && !params.enableCPFR) {
        // 下游感知到配额受限，夸大订货
        rawOrder = Math.round(rawOrder / params.rationingRatio);
      }

      // VMI 平抑模式
      if (params.enableVMI) {
        // 供应商平滑调配，削减 70% 的尖峰过冲
        rawOrder = Math.round(forecastDemand + (targetStock - inventory[ech] - currentPipeline) * 0.25);
        rawOrder = Math.max(10, rawOrder);
      }

      // 4. 将发出的订单放入管道末尾（待交付）
      pipelineQueues[ech].push(rawOrder);

      // 记录当期状态
      timeSeries[ech].push({
        time: t,
        demand: Math.round(demand),
        order: Math.round(rawOrder),
        inventory: Math.round(inventory[ech]),
        backlog: Math.round(backlog[ech]),
        pipeline: Math.round(currentPipeline),
      });

      // 当前层级的订货量成为上一级（更高层）的输入需求
      incomingDemandForNextTier = rawOrder;
    }
  }

  // 计算各级指标 (Metrics)
  const metrics: EchelonMetrics[] = echelons.map((ech) => {
    const data = timeSeries[ech];
    const demands = data.map((d) => d.demand);
    const orders = data.map((d) => d.order);
    const inventories = data.map((d) => d.inventory);
    const backlogs = data.map((d) => d.backlog);

    const dStats = calculateStats(demands);
    const oStats = calculateStats(orders);

    const bwe = dStats.variance > 0 ? Number((oStats.variance / dStats.variance).toFixed(2)) : 1.0;
    const avgInventory = Number((inventories.reduce((s, v) => s + v, 0) / inventories.length).toFixed(1));
    const holdingCost = Math.round(avgInventory * 2.5); // 单位在库成本假设 2.5 元/期
    const stockoutCount = backlogs.filter((b) => b > 0).length;
    const serviceLevel = Number((((totalSteps - stockoutCount) / totalSteps) * 100).toFixed(1));

    const echConfig = {
      retailer: "零售商 (Retailer)",
      wholesaler: "批发商 (Wholesaler)",
      distributor: "分销商 (Distributor)",
      manufacturer: "制造商 (Manufacturer)",
      supplier: "原材料商 (Supplier)",
    };

    return {
      key: ech,
      name: echConfig[ech],
      demandVariance: dStats.variance,
      orderVariance: oStats.variance,
      bwe,
      avgInventory,
      holdingCost,
      serviceLevel,
      stockoutCount,
    };
  });

  return { timeSeries, metrics };
}

/**
 * 系统动力学 (SD) 因果回路与存量流量仿真
 */
export function simulateSystemDynamics(
  config: {
    safetyStockMultiplier: number;
    productionDelay: number;
    orderInfoDelay: number;
    steps: number;
    stepShockMagnitude: number;
  }
): SystemDynamicsState[] {
  const steps = config.steps || 36;
  const history: SystemDynamicsState[] = [];

  let retInv = 100;
  let retPipe = 50;
  let retOrder = 20;

  let whoInv = 150;
  let whoPipe = 80;
  let whoOrder = 20;

  let disInv = 200;
  let disPipe = 100;
  let disOrder = 20;

  let mfgInv = 250;
  let mfgWip = 150;
  let mfgProd = 20;

  for (let t = 0; t <= steps; t++) {
    // 终端需求脉冲/跃升：第 6 周从 20 跃升至 20 + 扰动
    let demand = 20;
    if (t >= 6) {
      demand += Math.round(20 * (config.stepShockMagnitude / 100));
    }

    // 零售端动态反馈
    const retTarget = demand * (config.safetyStockMultiplier * 2.5);
    const retAdjustment = (retTarget - (retInv + retPipe)) * 0.5;
    retOrder = Math.max(0, Math.round(demand + retAdjustment));

    // 批发端动态反馈 (受信息延迟影响)
    const whoTarget = retOrder * (config.safetyStockMultiplier * 3.0);
    const whoAdjustment = (whoTarget - (whoInv + whoPipe)) * 0.4;
    whoOrder = Math.max(0, Math.round(retOrder + whoAdjustment));

    // 分销端动态反馈
    const disTarget = whoOrder * (config.safetyStockMultiplier * 3.5);
    const disAdjustment = (disTarget - (disInv + disPipe)) * 0.35;
    disOrder = Math.max(0, Math.round(whoOrder + disAdjustment));

    // 制造端在制与生产排产
    const mfgTarget = disOrder * (config.safetyStockMultiplier * 4.0);
    const mfgAdjustment = (mfgTarget - (mfgInv + mfgWip)) * 0.3;
    mfgProd = Math.max(0, Math.round(disOrder + mfgAdjustment));

    // 存量更新
    retInv = Math.max(0, retInv + Math.round(retPipe / 3) - demand);
    retPipe = Math.max(0, retPipe + whoOrder / 2 - Math.round(retPipe / 3));

    whoInv = Math.max(0, whoInv + Math.round(whoPipe / 4) - retOrder);
    whoPipe = Math.max(0, whoPipe + disOrder / 2 - Math.round(whoPipe / 4));

    disInv = Math.max(0, disInv + Math.round(disPipe / 4) - whoOrder);
    disPipe = Math.max(0, disPipe + mfgProd / 2 - Math.round(disPipe / 4));

    mfgInv = Math.max(0, mfgInv + Math.round(mfgWip / config.productionDelay) - disOrder);
    mfgWip = Math.max(0, mfgWip + mfgProd - Math.round(mfgWip / config.productionDelay));

    history.push({
      time: t,
      customerDemand: demand,
      retailerInventory: Math.round(retInv),
      retailerPipeline: Math.round(retPipe),
      retailerOrder: Math.round(retOrder),
      wholesalerInventory: Math.round(whoInv),
      wholesalerPipeline: Math.round(whoPipe),
      wholesalerOrder: Math.round(whoOrder),
      distributorInventory: Math.round(disInv),
      distributorPipeline: Math.round(disPipe),
      distributorOrder: Math.round(disOrder),
      manufacturerInventory: Math.round(mfgInv),
      manufacturerWip: Math.round(mfgWip),
      manufacturerProduction: Math.round(mfgProd),
    });
  }

  return history;
}
