/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AiModelId = "gemini 3 flash" | "deepseek-v4-pro";

export interface AiConfig {
  selectedModel: AiModelId;
  geminiKey: string;
  deepseekKey: string;
  deepseekBaseUrl: string;
  customGeminiModel?: string;
  customDeepseekModel?: string;
}

export const STORAGE_KEY = "bullwhip_ai_model_config";

export const DEFAULT_AI_CONFIG: AiConfig = {
  selectedModel: "gemini 3 flash",
  geminiKey: "",
  deepseekKey: "",
  deepseekBaseUrl: "https://api.deepseek.com",
  customGeminiModel: "gemini-2.5-flash",
  customDeepseekModel: "deepseek-chat",
};

export function loadAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_AI_CONFIG,
        ...parsed,
      };
    }
  } catch (e) {
    console.warn("Failed to load AI config from localStorage:", e);
  }
  return { ...DEFAULT_AI_CONFIG };
}

export function saveAiConfig(config: AiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error("Failed to save AI config to localStorage:", e);
  }
}

export function getActiveApiKey(config: AiConfig): string {
  if (config.selectedModel === "gemini 3 flash") {
    return config.geminiKey.trim();
  }
  return config.deepseekKey.trim();
}

export function hasActiveApiKey(config: AiConfig): boolean {
  return getActiveApiKey(config).length > 0;
}

export interface SupplyChainContext {
  leadTime: number;
  smoothingP: number;
  theoreticalBWE: number;
  shockType?: string;
  shockMagnitude?: number;
  enableVMI?: boolean;
  enableCPFR?: boolean;
  enablePOSSharing?: boolean;
  demandMean?: number;
  batchingSize?: number;
  rationingRatio?: number;
}

export interface AiCallParams {
  message: string;
  context: SupplyChainContext;
  config: AiConfig;
}

export interface AiCallResponse {
  reply: string;
  model: string;
  latencyMs: number;
}

function buildSystemPrompt(context: SupplyChainContext): string {
  return `你是一位世界顶级的供应链运筹工程专家与牛鞭效应（Bullwhip Effect）实验室科研导师。
你的理论体系深植于 MIT 斯隆管理学院系统动力学、斯坦福大学李效良教授（Hau L. Lee）的四大成因学说以及华为 ISC（集成供应链）、沃尔玛零售敏捷协同、丰田精益准时制（JIT）的实战落地。

【当前实验室沙盒运行参数与实时切片上下文】：
- 订货提前期 L: ${context.leadTime} 期
- 预测平滑期数 p: ${context.smoothingP} 阶
- 理论最低方差放大倍数 BWE: ${context.theoreticalBWE.toFixed(2)}x (计算依据: BWE >= 1 + 2L/p + 2L^2/p^2)
- 协同治理策略: VMI供应商管理库存 (${context.enableVMI ? "已开启" : "未开启"}) | CPFR协同预测与补货 (${context.enableCPFR ? "已开启" : "未开启"}) | POS实时销售数据共享 (${context.enablePOSSharing ? "已开启" : "未开启"})
- 需求基准: 均值 ${context.demandMean ?? 100}，冲击类型: ${context.shockType ?? "脉冲"} (幅度 ${context.shockMagnitude ?? 30}%)
- 批量订货因子 Q: ${context.batchingSize ?? 1}，配额博弈因子 α: ${context.rationingRatio ?? 1.0}

【回答要求】：
1. 语言专业、精炼、客观，术语规范（如提前期 Lead Time、移动平均、(s,S)策略、短缺配额博弈、虚拟库存分配等）。
2. 请结合当前实验环境中的切片数据展开针对性分析，善于利用数学推导或系统动力学因果反馈环（存量-流量、时滞放大）给出深入剖析。
3. 对于所有的数学符号、变量、参数（如 $L$、$p$、$Q$、$\sigma$、$\mu$）以及数学公式（如 $BWE \ge 1 + \frac{2L}{p} + \frac{2L^2}{p^2}$、$\mathrm{Var}(O)$ 等），必须统一使用标准 LaTeX 格式（行内单美元符号 $...$，独立块级公式双美元符号 $$...$$），前端将自动采用 KaTeX 进行数学公式排版渲染。
4. 给出具备可操作性的供应链优化或科研验证方案，结构清晰明了。`;
}

/**
 * Direct browser call to Google Generative Language API for Gemini 3 Flash
 */
async function callGeminiBrowser(
  message: string,
  context: SupplyChainContext,
  config: AiConfig
): Promise<AiCallResponse> {
  const apiKey = config.geminiKey.trim();
  if (!apiKey) {
    throw new Error("请先手工输入并确认 Gemini API-Key 后方可发起调用！");
  }

  const systemPrompt = buildSystemPrompt(context);
  const startTime = Date.now();

  // Try candidate models in order of priority (Gemini 2.5 Flash / 2.0 Flash / 1.5 Flash)
  const candidateModels = [
    config.customGeminiModel || "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  let lastError: Error | null = null;

  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

      const payload = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\n====================\n【用户提问】：\n${message}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
        
        // If 404 (model not found on v1beta yet), try fallback model
        if (response.status === 404) {
          lastError = new Error(`模型 ${modelName} 暂不可用: ${errMsg}`);
          continue;
        }

        if (response.status === 400 && errMsg.toLowerCase().includes("key")) {
          throw new Error(`Gemini API-Key 校验失败：${errMsg}。请点击右上角齿轮重新核验 API-Key。`);
        }

        if (response.status === 429) {
          throw new Error("Gemini API 调用频次或配额超限（429 Too Many Requests），请稍候重试。");
        }

        throw new Error(`Gemini 接口请求失败 (${response.status})：${errMsg}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("Gemini 返回了空数据，可能是触发了内容安全过滤，请调整提问重新尝试。");
      }

      return {
        reply: text,
        model: `Gemini 3 Flash (${modelName})`,
        latencyMs: Date.now() - startTime,
      };
    } catch (e: any) {
      lastError = e;
      if (e.message && (e.message.includes("API-Key") || e.message.includes("429"))) {
        throw e;
      }
    }
  }

  throw lastError || new Error("Gemini 服务调用失败，请检查网络连接与 API-Key 是否正确。");
}

/**
 * Direct browser call to DeepSeek Chat Completions API for DeepSeek-V4-Pro
 */
async function callDeepseekBrowser(
  message: string,
  context: SupplyChainContext,
  config: AiConfig
): Promise<AiCallResponse> {
  const apiKey = config.deepseekKey.trim();
  if (!apiKey) {
    throw new Error("请先手工输入并确认 DeepSeek API-Key 后方可发起调用！");
  }

  const systemPrompt = buildSystemPrompt(context);
  const startTime = Date.now();

  let baseUrl = (config.deepseekBaseUrl || "https://api.deepseek.com").trim().replace(/\/+$/, "");
  // Normalize if path ends with /v1 or chat/completions
  let endpoint = baseUrl;
  if (!endpoint.endsWith("/chat/completions")) {
    if (endpoint.endsWith("/v1")) {
      endpoint = `${endpoint}/chat/completions`;
    } else {
      endpoint = `${endpoint}/chat/completions`;
    }
  }

  const model = config.customDeepseekModel || "deepseek-chat";

  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;

      if (response.status === 401) {
        throw new Error(`DeepSeek API-Key 无效或未授权 (401)：${errMsg}。请检查齿轮设置中的密钥。`);
      }

      if (response.status === 429) {
        throw new Error("DeepSeek 账户余额不足或请求频次超限 (429)，请检查平台余额。");
      }

      throw new Error(`DeepSeek 请求失败 (${response.status})：${errMsg}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error("DeepSeek 返回了空回复，请重试。");
    }

    return {
      reply: text,
      model: `DeepSeek-V4-Pro (${model})`,
      latencyMs: Date.now() - startTime,
    };
  } catch (err: any) {
    // Check if network / CORS error
    if (err.name === "TypeError" && err.message?.toLowerCase().includes("fetch")) {
      throw new Error(
        `浏览器直接访问 DeepSeek API 发生跨域或网络中断：${err.message}。\n\n提示：若部署在 GitHub Pages 静态站点遇到 CORS 限制，请在齿轮设置中将 API Base URL 配置为支持 CORS 的反向代理（如 Cloudflare Worker 代理或开放网关）。`
      );
    }
    throw err;
  }
}

/**
 * Universal caller that executes purely in the browser with fallback support
 */
export async function executeAiQuery(params: AiCallParams): Promise<AiCallResponse> {
  const { message, context, config } = params;

  if (config.selectedModel === "gemini 3 flash") {
    return await callGeminiBrowser(message, context, config);
  } else {
    return await callDeepseekBrowser(message, context, config);
  }
}
