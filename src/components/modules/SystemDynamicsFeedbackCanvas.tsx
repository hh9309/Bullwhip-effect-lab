/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Clock, 
  Activity, 
  ArrowRight,
  ShieldAlert,
  Gauge,
  Info,
  Sliders,
  TrendingDown,
  TrendingUp,
  Package,
  Layers
} from "lucide-react";

interface SystemDynamicsFeedbackCanvasProps {
  productionDelay: number;
  orderInfoDelay: number;
  safetyStockMultiplier: number;
  stepShockMagnitude: number;
  onUpdateParams?: (params: {
    productionDelay?: number;
    orderInfoDelay?: number;
    safetyStockMultiplier?: number;
    stepShockMagnitude?: number;
  }) => void;
}

interface Particle {
  id: number;
  pathId: "order_to_backlog" | "backlog_to_production" | "production_delay_pipe" | "delivery_to_inventory" | "inventory_to_demand" | "panic_feedback";
  t: number; // 0.0 to 1.0 along the path
  speed: number;
  size: number;
  color: string;
  alpha: number;
  pulse?: number;
}

export const SystemDynamicsFeedbackCanvas: React.FC<SystemDynamicsFeedbackCanvasProps> = ({
  productionDelay,
  orderInfoDelay,
  safetyStockMultiplier,
  stepShockMagnitude,
  onUpdateParams,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 内部交互状态
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [impulseActive, setImpulseActive] = useState<boolean>(false);
  const [impulseCountdown, setImpulseCountdown] = useState<number>(0);

  // 动态反馈环仿真瞬时状态
  const [simState, setSimState] = useState<{
    inventory: number;
    targetInventory: number;
    orderBacklog: number;
    inTransitPipe: number;
    customerDemand: number;
    deliveryVelocity: number;
    phaseLagStatus: "stable" | "mild_lag" | "severe_lag" | "whiplash_overshoot";
  }>({
    inventory: 200,
    targetInventory: 200,
    orderBacklog: 25,
    inTransitPipe: 80,
    customerDemand: 20,
    deliveryVelocity: 1 / productionDelay,
    phaseLagStatus: "stable",
  });

  // 粒子系统存储
  const particlesRef = useRef<Particle[]>([]);
  const nextParticleId = useRef<number>(1);
  const stateRef = useRef(simState);
  stateRef.current = simState;

  // 内部仿真时间累积器 (用于驱动存量-流量 ODE 连续微分)
  const odeAccumulatorRef = useRef<number>(0);
  const internalParamsRef = useRef({
    productionDelay,
    orderInfoDelay,
    safetyStockMultiplier,
    stepShockMagnitude,
  });

  useEffect(() => {
    internalParamsRef.current = {
      productionDelay,
      orderInfoDelay,
      safetyStockMultiplier,
      stepShockMagnitude,
    };
  }, [productionDelay, orderInfoDelay, safetyStockMultiplier, stepShockMagnitude]);

  // 计算当前物理流速与滞后特征
  const metrics = useMemo(() => {
    // 物理交货流速反比于生产时延 (1 / L_prod)
    const rawDeliveryVel = Math.max(0.12, 1.0 / productionDelay);
    // 信息传递流速反比于信息时延 (1 / L_info)
    const rawInfoVel = Math.max(0.2, 1.0 / orderInfoDelay);
    // 总时滞周数
    const totalLag = productionDelay + orderInfoDelay;
    
    // 滞后相角评估 (以典型 20 周振荡周期计算相角差 deg)
    const phaseAngleDeg = Math.min(180, Math.round((totalLag / 16) * 180));

    let riskLevel = "受控 (同步响应)";
    let riskBadgeColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (totalLag >= 9) {
      riskLevel = "极端时滞盲区 (破坏性牛鞭过冲)";
      riskBadgeColor = "text-rose-700 bg-rose-50 border-rose-200";
    } else if (totalLag >= 5) {
      riskLevel = "显著滞后 (存量赤字与恐慌放大)";
      riskBadgeColor = "text-amber-700 bg-amber-50 border-amber-200";
    }

    return {
      rawDeliveryVel: Number(rawDeliveryVel.toFixed(2)),
      rawInfoVel: Number(rawInfoVel.toFixed(2)),
      totalLag,
      phaseAngleDeg,
      riskLevel,
      riskBadgeColor,
    };
  }, [productionDelay, orderInfoDelay]);

  // 触发瞬时脉冲需求突增 (+50%)
  const triggerImpulseShock = () => {
    setImpulseActive(true);
    setImpulseCountdown(8); // 持续 8 秒衰减

    // 在粒子系统中注入高密度扰动粒子
    for (let i = 0; i < 28; i++) {
      particlesRef.current.push({
        id: nextParticleId.current++,
        pathId: "inventory_to_demand",
        t: Math.random() * 0.4,
        speed: (0.015 + Math.random() * 0.01) * speedMultiplier,
        size: 3.5 + Math.random() * 2,
        color: "#f43f5e",
        alpha: 0.9,
        pulse: 1,
      });
    }
  };

  // 重置回基线稳态
  const handleResetToBaseline = () => {
    setImpulseActive(false);
    setImpulseCountdown(0);
    const baseDemand = 20;
    const baseTarget = Math.round(baseDemand * safetyStockMultiplier * 10);
    setSimState({
      inventory: baseTarget,
      targetInventory: baseTarget,
      orderBacklog: baseDemand,
      inTransitPipe: baseDemand * productionDelay,
      customerDemand: baseDemand,
      deliveryVelocity: 1 / productionDelay,
      phaseLagStatus: "stable",
    });
    particlesRef.current = [];
  };

  // 快捷预设配置应用
  const applyPreset = (preset: "jit" | "standard" | "whiplash") => {
    if (!onUpdateParams) return;
    if (preset === "jit") {
      onUpdateParams({
        productionDelay: 1,
        orderInfoDelay: 1,
        safetyStockMultiplier: 1.0,
      });
    } else if (preset === "standard") {
      onUpdateParams({
        productionDelay: 4,
        orderInfoDelay: 2,
        safetyStockMultiplier: 1.2,
      });
    } else if (preset === "whiplash") {
      onUpdateParams({
        productionDelay: 7,
        orderInfoDelay: 4,
        safetyStockMultiplier: 2.0,
      });
    }
  };

  // 粒子生成器
  const spawnParticles = useCallback((dt: number, speedMult: number) => {
    const pList = particlesRef.current;
    if (pList.length > 220) return; // 粒子上限保护

    const { productionDelay: pDelay, orderInfoDelay: iDelay } = internalParamsRef.current;
    const currentState = stateRef.current;

    // 1. 需求拉动流：库存 -> 客户消费
    if (Math.random() < 0.28 * speedMult) {
      pList.push({
        id: nextParticleId.current++,
        pathId: "inventory_to_demand",
        t: 0,
        speed: 0.008 * speedMult,
        size: 3,
        color: "#78716c", // 石灰色
        alpha: 0.85,
      });
    }

    // 2. 补货需求流：订单产生 -> 积压池
    if (Math.random() < 0.32 * speedMult) {
      const isHighBacklog = currentState.orderBacklog > 40;
      pList.push({
        id: nextParticleId.current++,
        pathId: "order_to_backlog",
        t: 0,
        speed: Math.max(0.006, (0.012 / iDelay)) * speedMult,
        size: isHighBacklog ? 3.8 : 3,
        color: isHighBacklog ? "#f59e0b" : "#3b82f6", // 琥珀色或蓝色
        alpha: 0.9,
      });
    }

    // 3. 释放排产流：订单积压池 -> 生产节点
    if (Math.random() < 0.25 * speedMult) {
      pList.push({
        id: nextParticleId.current++,
        pathId: "backlog_to_production",
        t: 0,
        speed: 0.009 * speedMult,
        size: 3,
        color: "#0284c7",
        alpha: 0.85,
      });
    }

    // 4. 交货时延流通管道：生产 -> 物理运输 -> 在库补充
    // 关键核心：流速反比于生产时延 productionDelay！
    if (Math.random() < 0.35 * speedMult) {
      // 时延越大，粒子速度越缓慢，导致管道内部积攒密集的在途粒子
      const delaySpeed = (0.007 / Math.max(1, pDelay)) * speedMult;
      pList.push({
        id: nextParticleId.current++,
        pathId: "production_delay_pipe",
        t: 0,
        speed: Math.max(0.0015, delaySpeed),
        size: 3.2,
        color: "#059669", // 祖母绿色
        alpha: 0.9,
      });
    }

    // 5. 恐慌正反馈流 (若库存严重亏空)
    if (currentState.inventory < currentState.targetInventory * 0.6 && Math.random() < 0.22 * speedMult) {
      pList.push({
        id: nextParticleId.current++,
        pathId: "panic_feedback",
        t: 0,
        speed: 0.014 * speedMult,
        size: 4,
        color: "#e11d48", // 玫瑰红告警
        alpha: 0.95,
        pulse: 1,
      });
    }
  }, []);

  // 主 Canvas 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min(50, now - lastTime) / 1000;
      lastTime = now;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // 自适应画布分辨率
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. 清屏与淡雅背景
      ctx.fillStyle = "#fafaf9"; // stone-50
      ctx.fillRect(0, 0, width, height);

      // 背景细腻微网格点阵
      ctx.fillStyle = "#e7e5e4";
      const gridStep = 24;
      for (let x = gridStep; x < width; x += gridStep) {
        for (let y = gridStep; y < height; y += gridStep) {
          ctx.fillRect(x - 0.75, y - 0.75, 1.5, 1.5);
        }
      }

      // 2. 节点坐标与几何尺寸计算 (自适应屏幕宽高)
      const centerX = width * 0.5;
      const centerY = height * 0.5;

      // 节点 1: 【订单积压与需求处理池】 (Top Left)
      const backlogNode = {
        x: width * 0.22,
        y: height * 0.26,
        w: 160,
        h: 90,
        title: "待履约订单积压池 (Backlog)",
        subtitle: "Order Backlog & Rate",
      };

      // 节点 2: 【制造排产与排期缓冲】 (Top Right)
      const prodNode = {
        x: width * 0.76,
        y: height * 0.26,
        w: 160,
        h: 90,
        title: "制造排产与在制池 (WIP)",
        subtitle: "Production Scheduling",
      };

      // 节点 3: 【交货物理时延管道】 (Right Bottom)
      const delayPipeNode = {
        x: width * 0.76,
        y: height * 0.72,
        w: 170,
        h: 105,
        title: "交货在途时延管道 (Lead Time)",
        subtitle: `Physical Delay: L=${internalParamsRef.current.productionDelay}周`,
      };

      // 节点 4: 【在库物理库存水槽】 (Bottom Left)
      const inventoryNode = {
        x: width * 0.22,
        y: height * 0.72,
        w: 170,
        h: 105,
        title: "在库物理库存水槽 (Inventory)",
        subtitle: "On-Hand Stock Level",
      };

      // 辅助路径计算 (Bezier 导轨)
      // Path 1: inventory -> 外部客户需求消费 (底部向左流出)
      const pInvToDemand = {
        start: { x: inventoryNode.x - inventoryNode.w * 0.5, y: inventoryNode.y },
        cp1: { x: inventoryNode.x - inventoryNode.w * 0.5 - 30, y: inventoryNode.y },
        cp2: { x: 35, y: inventoryNode.y + 20 },
        end: { x: 20, y: inventoryNode.y + 20 },
      };

      // Path 2: 订单决策生成 -> 积压池 (从库存缺口向上流动)
      const pOrderToBacklog = {
        start: { x: inventoryNode.x, y: inventoryNode.y - inventoryNode.h * 0.5 },
        cp1: { x: inventoryNode.x - 30, y: (inventoryNode.y + backlogNode.y) * 0.5 },
        cp2: { x: backlogNode.x - 30, y: (inventoryNode.y + backlogNode.y) * 0.5 },
        end: { x: backlogNode.x, y: backlogNode.y + backlogNode.h * 0.5 },
      };

      // Path 3: 积压释放 -> 生产排产 (横向自左向右)
      const pBacklogToProd = {
        start: { x: backlogNode.x + backlogNode.w * 0.5, y: backlogNode.y },
        cp1: { x: (backlogNode.x + prodNode.x) * 0.5, y: backlogNode.y - 25 },
        cp2: { x: (backlogNode.x + prodNode.x) * 0.5, y: prodNode.y - 25 },
        end: { x: prodNode.x - prodNode.w * 0.5, y: prodNode.y },
      };

      // Path 4: 生产入管 -> 在途交货时延管道 (垂直向下注入)
      const pProdToPipe = {
        start: { x: prodNode.x, y: prodNode.y + prodNode.h * 0.5 },
        cp1: { x: prodNode.x + 25, y: (prodNode.y + delayPipeNode.y) * 0.5 },
        cp2: { x: delayPipeNode.x + 25, y: (prodNode.y + delayPipeNode.y) * 0.5 },
        end: { x: delayPipeNode.x, y: delayPipeNode.y - delayPipeNode.h * 0.5 },
      };

      // Path 5: 交货出管 -> 到货注入库存水槽 (关键负反馈入库流：从右下横贯流向左下)
      const pDeliveryToInv = {
        start: { x: delayPipeNode.x - delayPipeNode.w * 0.5, y: delayPipeNode.y },
        cp1: { x: (delayPipeNode.x + inventoryNode.x) * 0.5, y: delayPipeNode.y + 35 },
        cp2: { x: (delayPipeNode.x + inventoryNode.x) * 0.5, y: inventoryNode.y + 35 },
        end: { x: inventoryNode.x + inventoryNode.w * 0.5, y: inventoryNode.y },
      };

      // Path 6: 正反馈恐慌倍增回路 (从时延管道直贯积压池的恐慌跨环)
      const pPanicFeedback = {
        start: { x: inventoryNode.x + 30, y: inventoryNode.y - inventoryNode.h * 0.5 },
        cp1: { x: centerX, y: centerY + 10 },
        cp2: { x: centerX, y: centerY - 40 },
        end: { x: backlogNode.x + 40, y: backlogNode.y + backlogNode.h * 0.5 },
      };

      // Bezier 点位采样计算函数
      const sampleBezier = (curve: { start: {x:number; y:number}; cp1: {x:number; y:number}; cp2: {x:number; y:number}; end: {x:number; y:number} }, t: number) => {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;

        return {
          x: uuu * curve.start.x + 3 * uu * t * curve.cp1.x + 3 * u * tt * curve.cp2.x + ttt * curve.end.x,
          y: uuu * curve.start.y + 3 * uu * t * curve.cp1.y + 3 * u * tt * curve.cp2.y + ttt * curve.end.y,
        };
      };

      // 3. 绘制底层环路轨道 (Guide Tracks & Conduits)
      const drawConduit = (
        curve: { start: {x:number; y:number}; cp1: {x:number; y:number}; cp2: {x:number; y:number}; end: {x:number; y:number} },
        strokeColor: string,
        lineWidth: number,
        dash: number[] = [],
        arrowText?: string
      ) => {
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(dash);
        ctx.beginPath();
        ctx.moveTo(curve.start.x, curve.start.y);
        ctx.bezierCurveTo(curve.cp1.x, curve.cp1.y, curve.cp2.x, curve.cp2.y, curve.end.x, curve.end.y);
        ctx.stroke();

        if (arrowText) {
          const midPoint = sampleBezier(curve, 0.5);
          ctx.fillStyle = "#78716c";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(arrowText, midPoint.x, midPoint.y - 8);
        }
        ctx.restore();
      };

      // 绘制负反馈主环路平衡轨道 (Balancing Loop B1)
      drawConduit(pOrderToBacklog, "rgba(59, 130, 246, 0.35)", 5, [6, 4], "订单指令流 (+)");
      drawConduit(pBacklogToProd, "rgba(2, 132, 199, 0.35)", 5, [6, 4], "生产排程流 (+)");
      drawConduit(pProdToPipe, "rgba(13, 148, 136, 0.45)", 6, [], "进入在途排产 (+)");
      drawConduit(pDeliveryToInv, "rgba(16, 185, 129, 0.5)", 8, [], "物理到货履约流 (+)");
      drawConduit(pInvToDemand, "rgba(120, 113, 108, 0.35)", 4, [4, 4], "终端销售需求 (-)");

      // 绘制正反馈恐慌强化环轨道 (Reinforcing Loop R1)
      const isShortagePanic = stateRef.current.inventory < stateRef.current.targetInventory * 0.7;
      drawConduit(
        pPanicFeedback,
        isShortagePanic ? "rgba(244, 63, 94, 0.55)" : "rgba(244, 63, 94, 0.15)",
        isShortagePanic ? 3.5 : 2,
        [4, 4],
        isShortagePanic ? "恐慌加码超订环路 (R1)" : undefined
      );

      // 4. 中心动力学回路枢纽徽标 (Central CLD Badge)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#e7e5e4";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 回路旋转箭头
      ctx.strokeStyle = isShortagePanic ? "#f43f5e" : "#0d9488";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 36, Math.PI * 0.2, Math.PI * 1.6);
      ctx.stroke();

      ctx.fillStyle = isShortagePanic ? "#f43f5e" : "#0d9488";
      ctx.font = "bold 13px 'Plus Jakarta Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(isShortagePanic ? "R1 恐慌环" : "B1 平衡环", 0, -6);
      ctx.font = "10px monospace";
      ctx.fillStyle = "#78716c";
      ctx.fillText(isShortagePanic ? "强化过冲" : "负反馈调节", 0, 12);
      ctx.restore();

      // 5. 存量与节点绘制 (Stocks & Buffers)
      const drawNodeBox = (
        n: { x: number; y: number; w: number; h: number; title: string; subtitle: string },
        fillColor: string,
        strokeColor: string,
        badgeText: string,
        badgeColor: string
      ) => {
        ctx.save();
        const rx = n.x - n.w * 0.5;
        const ry = n.y - n.h * 0.5;

        // 阴影
        ctx.shadowColor = "rgba(0, 0, 0, 0.04)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;

        // 卡片圆角矩形
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(rx, ry, n.w, n.h, 12);
        ctx.fill();
        ctx.stroke();

        ctx.shadowColor = "transparent";

        // 顶部小徽章
        ctx.fillStyle = badgeColor;
        ctx.font = "bold 10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(badgeText, rx + n.w - 12, ry + 18);

        // 主标题
        ctx.fillStyle = "#1c1917";
        ctx.font = "bold 12px 'Plus Jakarta Sans', sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(n.title, rx + 12, ry + 22);

        // 副标题说明
        ctx.fillStyle = "#78716c";
        ctx.font = "10px monospace";
        ctx.fillText(n.subtitle, rx + 12, ry + 38);

        ctx.restore();
      };

      // 绘制节点 1: 订单积压池 (Backlog Tank)
      drawNodeBox(
        backlogNode,
        "#ffffff",
        stateRef.current.orderBacklog > 35 ? "#f59e0b" : "#e7e5e4",
        `${Math.round(stateRef.current.orderBacklog)} 件`,
        stateRef.current.orderBacklog > 35 ? "#d97706" : "#2563eb"
      );
      // 积压槽内仪表微条
      const blRatio = Math.min(1, stateRef.current.orderBacklog / 80);
      ctx.fillStyle = "#fef3c7";
      ctx.fillRect(backlogNode.x - backlogNode.w * 0.5 + 12, backlogNode.y + 12, backlogNode.w - 24, 10);
      ctx.fillStyle = stateRef.current.orderBacklog > 35 ? "#f59e0b" : "#3b82f6";
      ctx.fillRect(backlogNode.x - backlogNode.w * 0.5 + 12, backlogNode.y + 12, (backlogNode.w - 24) * blRatio, 10);
      ctx.fillStyle = "#78716c";
      ctx.font = "9px monospace";
      ctx.fillText(`待排产负荷: ${(blRatio * 100).toFixed(0)}%`, backlogNode.x - backlogNode.w * 0.5 + 12, backlogNode.y + 34);

      // 绘制节点 2: 制造排产在制池 (WIP)
      drawNodeBox(
        prodNode,
        "#ffffff",
        "#e7e5e4",
        `排产: ${Math.round(stateRef.current.customerDemand * 1.2)}/周`,
        "#0284c7"
      );
      ctx.fillStyle = "#f0fdf4";
      ctx.fillRect(prodNode.x - prodNode.w * 0.5 + 12, prodNode.y + 12, prodNode.w - 24, 10);
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(prodNode.x - prodNode.w * 0.5 + 12, prodNode.y + 12, (prodNode.w - 24) * 0.65, 10);
      ctx.fillStyle = "#78716c";
      ctx.font = "9px monospace";
      ctx.fillText("产能利用率: 82%", prodNode.x - prodNode.w * 0.5 + 12, prodNode.y + 34);

      // 绘制节点 3: 【交货时延管道 (Delivery Delay Pipe)】 —— 重点突显时滞机制！
      const pDelay = internalParamsRef.current.productionDelay;
      const delayBoxColor = pDelay >= 6 ? "#fff1f2" : pDelay >= 4 ? "#fffbeb" : "#f0fdf4";
      const delayBorderColor = pDelay >= 6 ? "#f43f5e" : pDelay >= 4 ? "#f59e0b" : "#10b981";

      drawNodeBox(
        delayPipeNode,
        delayBoxColor,
        delayBorderColor,
        `滞后 L=${pDelay}周`,
        delayBorderColor
      );

      // 时延管道流速动态进度仪表
      ctx.fillStyle = "#78716c";
      ctx.font = "10px monospace";
      const deliveryVelText = `实测管道流速: ${(1 / pDelay).toFixed(2)} 周⁻¹`;
      ctx.fillText(deliveryVelText, delayPipeNode.x - delayPipeNode.w * 0.5 + 12, delayPipeNode.y + 8);

      // 管道内输送带刻度 (呈现物理延迟传输带阻力)
      const beltX = delayPipeNode.x - delayPipeNode.w * 0.5 + 12;
      const beltY = delayPipeNode.y + 16;
      const beltW = delayPipeNode.w - 24;
      ctx.fillStyle = "#e5e5e5";
      ctx.fillRect(beltX, beltY, beltW, 14);

      // 输送带流动格子
      const cellCount = Math.max(3, pDelay * 2);
      const cellW = beltW / cellCount;
      for (let c = 0; c < cellCount; c++) {
        ctx.fillStyle = c % 2 === 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.4)";
        ctx.fillRect(beltX + c * cellW, beltY, cellW - 1, 14);
      }
      ctx.fillStyle = pDelay >= 6 ? "#e11d48" : "#059669";
      ctx.font = "bold 9px monospace";
      ctx.fillText(
        pDelay >= 6 ? "⚠️ 阻力极大: 货物高度积压滞留" : "✅ 准时制响应: 物料流动通畅",
        beltX,
        delayPipeNode.y + 44
      );

      // 绘制节点 4: 【在库物理库存水槽 (Inventory Tank)】 —— 重点突显水位波浪动态！
      const currentInv = stateRef.current.inventory;
      const targetInv = stateRef.current.targetInventory;
      const invRatio = Math.max(0, Math.min(1.4, currentInv / (targetInv || 200)));
      const isStockout = currentInv < 30;
      const isOverflow = currentInv > targetInv * 1.25;

      const invBoxBg = isStockout ? "#fef2f2" : isOverflow ? "#fff7ed" : "#ffffff";
      const invBorder = isStockout ? "#ef4444" : isOverflow ? "#f97316" : "#e7e5e4";

      drawNodeBox(
        inventoryNode,
        invBoxBg,
        invBorder,
        `${Math.round(currentInv)} 件在库`,
        isStockout ? "#ef4444" : isOverflow ? "#ea580c" : "#059669"
      );

      // 水槽水位几何绘制
      const tankX = inventoryNode.x - inventoryNode.w * 0.5 + 12;
      const tankY = inventoryNode.y + 12;
      const tankW = inventoryNode.w - 24;
      const tankH = 24;

      // 水槽底色
      ctx.fillStyle = "#f5f5f4";
      ctx.fillRect(tankX, tankY, tankW, tankH);

      // 安全库存虚线标识 S*
      const safeLineX = tankX + tankW * 0.7;
      ctx.strokeStyle = "#a8a29e";
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(safeLineX, tankY - 2);
      ctx.lineTo(safeLineX, tankY + tankH + 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 水槽动态液体 (加微小正弦微波)
      const liquidW = Math.min(tankW, tankW * (invRatio * 0.7));
      ctx.fillStyle = isStockout 
        ? "rgba(239, 68, 68, 0.7)" 
        : isOverflow 
        ? "rgba(249, 115, 22, 0.75)" 
        : "rgba(16, 185, 129, 0.65)";
      ctx.fillRect(tankX, tankY, liquidW, tankH);

      ctx.fillStyle = "#78716c";
      ctx.font = "9px monospace";
      ctx.fillText(
        isStockout ? "⚠️ 缺货断流警告！" : isOverflow ? "💥 滞后海啸爆仓！" : `目标安全线 S*=${targetInv}件`,
        tankX,
        tankY + tankH + 12
      );

      // 6. 动态粒子引擎更新与渲染 (Particle Flow Simulation Engine)
      if (isPlaying) {
        spawnParticles(dt, speedMultiplier);
      }

      const pList = particlesRef.current;
      for (let i = pList.length - 1; i >= 0; i--) {
        const p = pList[i];

        if (isPlaying) {
          p.t += p.speed;
        }

        // 粒子到达终点后的存量相互作用与销毁
        if (p.t >= 1.0) {
          // 到达对应节点，触发存量水槽的微幅增减
          if (p.pathId === "delivery_to_inventory") {
            // 到货入库增加库存
            stateRef.current.inventory += 1.2;
            stateRef.current.inTransitPipe = Math.max(0, stateRef.current.inTransitPipe - 1.2);
          } else if (p.pathId === "inventory_to_demand") {
            // 客户消费扣减在库
            stateRef.current.inventory = Math.max(0, stateRef.current.inventory - 1.0);
          } else if (p.pathId === "order_to_backlog") {
            // 订单沉淀为积压池
            stateRef.current.orderBacklog += 0.8;
          } else if (p.pathId === "backlog_to_production") {
            // 积压进入在途管道
            stateRef.current.orderBacklog = Math.max(5, stateRef.current.orderBacklog - 0.7);
            stateRef.current.inTransitPipe += 0.7;
          }
          pList.splice(i, 1);
          continue;
        }

        // 根据路径获取当前粒子坐标
        let curve = pInvToDemand;
        if (p.pathId === "order_to_backlog") curve = pOrderToBacklog;
        else if (p.pathId === "backlog_to_production") curve = pBacklogToProd;
        else if (p.pathId === "production_delay_pipe") curve = pProdToPipe;
        else if (p.pathId === "delivery_to_inventory") curve = pDeliveryToInv;
        else if (p.pathId === "panic_feedback") curve = pPanicFeedback;

        const pos = sampleBezier(curve, p.t);

        // 绘制发光发亮粒子
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;

        // 辉光
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.pulse ? 8 : 4;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // 拖尾光轨 (微小上一帧残影)
        const prevPos = sampleBezier(curve, Math.max(0, p.t - 0.04));
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.6;
        ctx.globalAlpha = p.alpha * 0.4;
        ctx.beginPath();
        ctx.moveTo(prevPos.x, prevPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();

        ctx.restore();
      }

      // 7. 连续微分状态动态自平衡 (Differential Update)
      if (isPlaying) {
        odeAccumulatorRef.current += dt;
        if (odeAccumulatorRef.current > 0.08) {
          odeAccumulatorRef.current = 0;

          const pD = internalParamsRef.current.productionDelay;
          const sMult = internalParamsRef.current.safetyStockMultiplier;

          // 若有冲击进行衰减
          if (impulseCountdown > 0) {
            setImpulseCountdown((prev) => Math.max(0, prev - 0.08));
          }

          setSimState((prev) => {
            const currentDemand = impulseCountdown > 0 ? 20 * (1 + internalParamsRef.current.stepShockMagnitude / 100) : 20;
            const targetStock = currentDemand * (sMult * 10);

            // 物理交货流速：反比于生产时延
            const deliveryFlow = Math.max(2, prev.inTransitPipe / pD);
            // 客户消费流速
            const consumptionFlow = currentDemand;
            // 下单流速：弥补缺口
            const gap = targetStock - prev.inventory;
            const orderRate = Math.max(0, currentDemand + gap * 0.15);

            // 存量微分
            const nextInv = Math.max(0, Math.min(targetStock * 2.2, prev.inventory + (deliveryFlow - consumptionFlow) * 0.1));
            const nextBacklog = Math.max(5, prev.orderBacklog + (orderRate - deliveryFlow) * 0.08);
            const nextPipe = Math.max(10, prev.inTransitPipe + (orderRate - deliveryFlow) * 0.1);

            let status: "stable" | "mild_lag" | "severe_lag" | "whiplash_overshoot" = "stable";
            if (nextInv > targetStock * 1.3) {
              status = "whiplash_overshoot";
            } else if (pD >= 6 || nextInv < targetStock * 0.5) {
              status = "severe_lag";
            } else if (pD >= 3) {
              status = "mild_lag";
            }

            return {
              inventory: Number(nextInv.toFixed(1)),
              targetInventory: Math.round(targetStock),
              orderBacklog: Number(nextBacklog.toFixed(1)),
              inTransitPipe: Number(nextPipe.toFixed(1)),
              customerDemand: Math.round(currentDemand),
              deliveryVelocity: Number((1 / pD).toFixed(2)),
              phaseLagStatus: status,
            };
          });
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speedMultiplier, impulseCountdown, spawnParticles]);

  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs space-y-5">
      {/* 顶部标题与状态总览 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-stone-900 text-stone-100 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" />
              反馈回路与时延仿真
            </span>
            <span className="text-xs text-stone-500 font-mono">
              System Dynamics Feedback Loop Canvas · Phase Lag & Flow Velocity
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
            <span>反馈环路动态粒子流：库存·订单积压·交货时延演播</span>
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
            实时模拟系统动力学三大核心存量/流量状态。粒子沿因果回路高速/低速流转，直观呈现<strong className="text-stone-800">生产物理时延 L</strong> 如何导致到货流速骤降、管道物料严重拥堵，以及随之诱发的<strong className="text-stone-800">时滞盲区与恐慌性超调牛鞭</strong>。
          </p>
        </div>

        {/* 交互播控工具条 */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="canvas-play-pause-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800 shadow-2xs transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? "暂停流动" : "继续流动"}</span>
          </button>

          {/* 流速倍率 */}
          <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden text-xs bg-white">
            {[0.5, 1.0, 2.0].map((sp) => (
              <button
                key={sp}
                onClick={() => setSpeedMultiplier(sp)}
                className={`px-2 py-1.5 font-mono text-xs transition-colors cursor-pointer ${
                  speedMultiplier === sp
                    ? "bg-stone-200 text-stone-900 font-bold"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>

          {/* 注入即时冲击 */}
          <button
            id="canvas-impulse-shock-btn"
            onClick={triggerImpulseShock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-all cursor-pointer"
            title="模拟突发市场爆单需求冲击 (+50%)，观察反馈回路中的滞后传导与积压堆叠"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>注入扰动冲击 (+50%)</span>
          </button>

          {/* 重置稳态 */}
          <button
            id="canvas-reset-btn"
            onClick={handleResetToBaseline}
            className="p-1.5 text-xs rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 cursor-pointer"
            title="重置反馈环路为稳态基准"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 快捷动力学场景模式预设切换 */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-700 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5 text-stone-500" />
            典型动力学时滞场景对比:
          </span>
          <span className="text-stone-500 hidden sm:inline">一键加载不同时延与阻尼条件</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => applyPreset("jit")}
            className="px-2.5 py-1 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-medium transition-colors cursor-pointer"
          >
            ⚡ 精益准时制 (L=1周·近零滞后)
          </button>
          <button
            onClick={() => applyPreset("standard")}
            className="px-2.5 py-1 rounded-lg border border-stone-300 bg-white text-stone-700 hover:bg-stone-100 font-medium transition-colors cursor-pointer"
          >
            🚢 典型跨国海运 (L=4周·中度振荡)
          </button>
          <button
            onClick={() => applyPreset("whiplash")}
            className="px-2.5 py-1 rounded-lg border border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100 font-medium transition-colors cursor-pointer"
          >
            ⚠️ 极端海啸时滞 (L=7周·恐慌过冲)
          </button>
        </div>
      </div>

      {/* Canvas 动态粒子流核心画布容器 */}
      <div 
        ref={containerRef}
        className="relative w-full h-[380px] sm:h-[440px] rounded-xl border border-stone-200 overflow-hidden bg-stone-50"
      >
        <canvas
          id="system-dynamics-particle-canvas"
          ref={canvasRef}
          className="w-full h-full block"
        />

        {/* 画布左上角实时浮层：动力学回路状态 */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-stone-800 font-semibold">环路流速状态:</span>
            <span className="font-mono text-stone-600">
              交付流速 v={metrics.rawDeliveryVel} / 周
            </span>
          </div>

          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-stone-200 px-3 py-1.5 rounded-lg shadow-2xs text-xs font-medium">
            <Clock className="w-3.5 h-3.5 text-stone-500" />
            <span className="text-stone-800 font-semibold">总时延相角:</span>
            <span className="font-mono text-stone-600">
              {metrics.totalLag} 周滞后 ({metrics.phaseAngleDeg}°)
            </span>
          </div>
        </div>

        {/* 画布右上角：滞后状态警报 */}
        <div className="absolute top-3 right-3 pointer-events-none">
          <div className={`px-3 py-1.5 rounded-lg border shadow-2xs text-xs font-bold flex items-center gap-1.5 ${metrics.riskBadgeColor}`}>
            <Activity className="w-3.5 h-3.5" />
            <span>{metrics.riskLevel}</span>
          </div>
        </div>

        {/* 画布底部图例指南 */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-white/85 backdrop-blur-xs border border-stone-200 text-[11px] text-stone-600 pointer-events-none">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>补货订单流 (信息流动)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>交货在途流 (物理流通时延)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>恐慌超订流 (缺货触发 R1)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
              <span>终端实际消耗流</span>
            </span>
          </div>

          <span className="font-mono text-stone-500">
            粒子密度与流通速度 ∝ 1 / 时延 L
          </span>
        </div>
      </div>

      {/* 4 维量化动力学指标看板 HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {/* 指标 1: 交货流速 */}
        <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-700 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-stone-500" />
              物理交货流速 (v_delivery)
            </span>
            <span className="font-mono font-bold text-stone-800">{metrics.rawDeliveryVel} 周⁻¹</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-mono font-bold text-stone-900">
              {productionDelay <= 2 ? "快速畅流" : productionDelay <= 5 ? "中速流通" : "严重拥堵阻塞"}
            </span>
            <span className="text-[10px] text-stone-400 font-mono">1 / L_prod</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 leading-normal">
            生产交付时延 L={productionDelay} 周，越慢越容易在交货管道内引发物料严重堆叠。
          </p>
        </div>

        {/* 指标 2: 待履约订单积压 */}
        <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-700 flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-stone-500" />
              订单积压池 (Backlog)
            </span>
            <span className="font-mono font-bold text-amber-700">{Math.round(simState.orderBacklog)} 件</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-mono font-bold text-stone-900">
              {(simState.orderBacklog / simState.customerDemand).toFixed(1)}x
            </span>
            <span className="text-[10px] text-stone-400 font-mono">相对于当期需求</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 leading-normal">
            当上游未能即时交货时，未满足订单在积压池中迅速堆叠，诱发下游重复下单。
          </p>
        </div>

        {/* 指标 3: 在库与安全库存水位 */}
        <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-700 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-stone-500" />
              在库库存水位 (Inventory)
            </span>
            <span className="font-mono font-bold text-emerald-700">{Math.round(simState.inventory)} 件</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-mono font-bold text-stone-900">
              {((simState.inventory / (simState.targetInventory || 1)) * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-stone-400 font-mono">对标目标库存 S*</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 leading-normal">
            {simState.inventory < 30 ? "⚠️ 发生严重缺货断流！" : simState.inventory > simState.targetInventory * 1.3 ? "💥 遭遇严重滞后性库存海啸！" : "✅ 处于安全库存受控缓冲范围"}
          </p>
        </div>

        {/* 指标 4: 时滞相位差 */}
        <div className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold text-stone-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              动力学滞后相角 (Phase Lag)
            </span>
            <span className="font-mono font-bold text-stone-800">{metrics.phaseAngleDeg}°</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-mono font-bold text-stone-900">
              Δt = {metrics.totalLag} 周
            </span>
            <span className="text-[10px] text-stone-400 font-mono">L_prod + L_info</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1 leading-normal">
            当相角接近 180° 时，负反馈调节回路发生“相位反转”，原本用于平衡的补货反而成为加剧振荡的推手。
          </p>
        </div>
      </div>
    </div>
  );
};
