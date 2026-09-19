import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API health endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Supply Chain Expert Chat endpoint
app.post("/api/ai/chat", async (req: Request, res: Response) => {
  try {
    const { message, context } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "缺少有效的问题内容" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });

        const systemPrompt = `你是一位世界顶级的供应链运营与管理工程专家兼牛鞭效应（Bullwhip Effect）实验室科研导师。
你的学术背景融合了 MIT 斯隆管理学院系统动力学、斯坦福大学李效良教授（Hau L. Lee）的经典理论以及现代工业界（如华为集成供应链 ISC、沃尔玛敏捷物流、丰田 JIT/精益生产）的实战经验。

当前实验室运行环境与仿真切片上下文：
${context ? JSON.stringify(context, null, 2) : "当前为全局探索模式"}

请基于严谨的运筹学、理论代数（方差放大公式 BWE >= 1 + 2L/p + 2L^2/p^2）、系统动力学反馈环（因果回路与存量流量）及实战对策，给出专业、透彻、淡雅客观且具备实操价值的解答。
要求：
1. 使用标准中文，学术术语准确规范（如提前期 Lead Time、移动平均平滑阶数、(s,S)批量订货策略、短缺配额博弈、VMI、CPFR、POS 实时共享）。
2. 结构清晰，善用层级切片与要点归纳，针对用户当前的仿真参数或理论疑问给出具体推导或参数调优方案。
3. 语言淡雅大方、专业权威，避免空洞寒暄。`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        const text = response.text || "未能生成有效分析，请重试。";
        res.json({ reply: text, source: "gemini" });
        return;
      } catch (geminiError: any) {
        console.error("Gemini API invocation error:", geminiError?.message || geminiError);
        // Fall back to rule-based supply chain expert engine
      }
    }

    // Heuristic Supply Chain Expert Engine fallback
    const heuristicReply = generateHeuristicExpertReply(message, context);
    res.json({ reply: heuristicReply, source: "expert-engine" });
  } catch (error: any) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: "服务端智能分析暂不可用", details: error?.message });
  }
});

function generateHeuristicExpertReply(query: string, ctx: any): string {
  const q = query.toLowerCase();
  const currentL = ctx?.leadTime ?? 3;
  const currentP = ctx?.smoothingP ?? 5;
  const currentBWE = (1 + (2 * currentL) / currentP + (2 * Math.pow(currentL, 2)) / Math.pow(currentP, 2)).toFixed(2);

  if (q.includes("方差") || q.includes("公式") || q.includes("bwe") || q.includes("推导") || q.includes("代数")) {
    return `### 📐 牛鞭效应代数推导与方差放大比率分析

在多级序列供应链中，假设各节点采用移动平均（Order-up-to-S）预测法，提前期为 $L$，平滑参数为 $p$：

$$BWE = \\frac{\\mathrm{Var}(O)}{\\mathrm{Var}(D)} \\ge 1 + \\frac{2L}{p} + \\frac{2L^2}{p^2}$$

**当前切片环境诊断：**
- 当前提前期 $L = ${currentL}$ 期，平滑期数 $p = ${currentP}$
- 理论最低方差放大倍数：**${currentBWE}x**（即源头订货方差是终端需求方差的 ${currentBWE} 倍）
- 观察二次项 $\\frac{2L^2}{p^2}$：当时滞 $L$ 翻倍时，方差放大效应呈**二次方（抛物线）爆发增长**，这是导致制造端订单剧烈震荡的数学根源。

**优化建议：**
1. **压缩提前期 $L$**：推行准时制（JIT）与近距离敏捷交付，若将 $L$ 从 ${currentL}$ 降至 1，BWE 将急剧收缩；
2. **适当增大平滑窗口 $p$**：过滤短期随机扰动，避免对单期脉冲过度反应；
3. **消除中间预测层**：采用下游 POS（销售点）直接穿透共享。`;
  }

  if (q.includes("短缺") || q.includes("博弈") || q.includes("配额") || q.includes("华为") || q.includes("芯片")) {
    return `### ⚡ 短缺博弈（Rationing & Shortage Gaming）机制剖析

短缺博弈是牛鞭效应最剧烈的非线性诱因之一。其微观心理与传导链条如下：

1. **配额分配逻辑**：当下游感知到上游供应受限（如产能利用率达 95% 或元器件禁运风险），上游往往按“订货比例”打折供货（供货率 $\\alpha < 1$）。
2. **虚假繁荣形成**：下游各级为了获得 $100$ 单位真实所需，主动将订单虚报至 $\\frac{100}{\\alpha} = 200$ 单位（双倍甚至三倍下单）。
3. **虚假订单上涌**：上游误判终端市场“极度旺盛”，盲目投资扩产扩建晶圆厂或产线。
4. **泡沫破裂反噬**：一旦产能释放或实际需求放缓，下游客户瞬间取消未履约订单（Phantom Orders），上游面临毁灭性存货堆积与现金流断裂。

**治理切片策略：**
- **依历史提货量而非当前订单分配配额**（沃尔玛与台积电关键产能分配常用逻辑）；
- **对大额订单收取不可撤销的违约金/定金**（预付款锁量）；
- **上下游协同预测机制（CPFR）锁定真实终端消耗**。`;
  }

  if (q.includes("批量") || q.includes("batching") || q.includes("起订量") || q.includes("moq")) {
    return `### 📦 批量订货（Order Batching）与离散冲击

在供应链运作中，由于固定订货成本（如整车发运 FTL、关单报关费、换模成本）和最低起订量（MOQ）的存在，下游企业倾向于使用 $(s, S)$ 周期性批量补货策略：

1. **信息阻断**：在库存未跌破再订货点 $s$ 前，上游观察到的外部需求为 **0**；
2. **离散巨浪**：一旦触发点 $s$，瞬间向上一级抛出庞大批量 $Q = S - s$，造成需求在时间轴上的严重断续与聚集；
3. **逐级倍增**：上一级接收到断续订单后，为满足自己的经济订货批量（EOQ），再次叠加更大批次，导致上游生产排程极不稳定。

**平抑路径：**
- 推行电子数据交换（EDI）与自动化极简报单；
- 实施混合组装与多 SKU 拼车物流（Milk-Run 循环取货），降低单次固定运输门槛；
- 阶梯定价倒逼小批量高频次补货。`;
  }

  if (q.includes("系统动力学") || q.includes("反馈") || q.includes("延迟") || q.includes("因果")) {
    return `### 🔄 系统动力学（System Dynamics）与长链条滞后震荡

牛鞭效应在本质上是**多阶信息时滞与物理物料延迟并存的负反馈调节系统**所固有的过度校正（Overshoot and Oscillation）：

- **存量（Stocks）**：在手库存（OnHand Inventory）、在途管道库存（InTransit Pipeline）、未交付积压订单（Backlog）；
- **流量（Flows）**：顾客需求率、发货率、订货率、在制生产完成率；
- **负反馈目标环**：企业试图消除 \`目标在库 - 实际在库\` 的偏差；但由于存在信息确认延迟（Order Lead Time）与物理生产延迟（Production Lead Time），补货到达时往往已事过境迁。

**系统动力学调优参数法则：**
- **缩短管道观测周期**：将 pipeline inventory 纳入补货公式控制闭环；
- **减弱阻尼过冲**：降低调整系数 $\\alpha$，防止过急弥补短期库存缺口；
- **提升柔性生产弹性**，以生产节拍（Takt Time）跟随真实拉动信号。`;
  }

  return `### 🔬 牛鞭效应实验室专家全景评估

您关注的问题直接触及现代供应链网络稳定性的核心矛盾。

**核心洞察与当前实验切片建议：**
1. **多重成因耦合**：牛鞭效应极少单一发生，通常是**需求预测更新**（数学放大）+ **批量订货**（离散突变）+ **短缺博弈**（博弈放大）+ **价格波动**（促销透支）四重机制交织共振的结果。
2. **参数敏感度**：
   - 提前期 $L$ 处于指数放大地位，压缩物流时效收益远高于盲目增加安全库存；
   - 预测平滑因子 $p$ 需与市场波动频次匹配；
3. **协同治理抓手**：
   - **VMI（供应商管理库存）**：消除接口层级预测，由供应商直接监控下游实物消耗；
   - **CPFR（协同规划预测与补货）**：统一“全链单一真实数据源”（Single Version of Truth）。

建议您切换至【2D级联沙盒】或【衰减控制演播】模块，实时拖拽时滞滑块或开启 VMI 对比切片观察波形收敛！`;
}

// Start Server with Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Bullwhip Lab] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
