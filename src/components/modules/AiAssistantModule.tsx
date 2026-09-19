/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { SimulationParameters } from "../../types";
import { calculateTheoreticalBWE } from "../../utils/simulation";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RotateCcw, 
  Lightbulb, 
  ArrowRight,
  Settings,
  Key,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Wand2
} from "lucide-react";
import { 
  loadAiConfig, 
  saveAiConfig, 
  getActiveApiKey, 
  hasActiveApiKey, 
  executeAiQuery, 
  AiConfig 
} from "../../utils/aiService";
import { AiModelSettingsModal } from "./AiModelSettingsModal";
import { MarkdownKatex, InlineMathText } from "../common/KatexRenderer";
import { generateAiDiagnosticReport, DiagnosticReport } from "../../utils/aiDiagnosticEngine";
import { AiDiagnosticPanel } from "./AiDiagnosticPanel";

interface AiAssistantProps {
  params: SimulationParameters;
  onChangeParams?: React.Dispatch<React.SetStateAction<SimulationParameters>>;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  source?: string;
  isError?: boolean;
}

export const AiAssistantModule: React.FC<AiAssistantProps> = ({ params, onChangeParams }) => {
  const currentBwe = calculateTheoreticalBWE(params.leadTime, params.smoothingP);

  // 记录先前的实验参数，用于在参数发生较大变化时触发实时比对与主动对策生成
  const prevParamsRef = useRef<SimulationParameters>(params);
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport>(() =>
    generateAiDiagnosticReport(params, null)
  );

  useEffect(() => {
    const report = generateAiDiagnosticReport(params, prevParamsRef.current);
    setDiagnosticReport(report);
    prevParamsRef.current = { ...params };
  }, [params]);

  // AI 模型与 API-Key 本地状态配置
  const [aiConfig, setAiConfig] = useState<AiConfig>(() => loadAiConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsInitialError, setSettingsInitialError] = useState<string | null>(null);

  const hasKey = hasActiveApiKey(aiConfig);
  const activeKey = getActiveApiKey(aiConfig);

  const getWelcomeText = (modelName: string) => 
    `您好！我是**牛鞭效应实验室智能科研顾问**。\n\n当前已载入大模型引擎：**${modelName}**。\n\n我已经同步读取到您当前的实验切片环境：\n- **提前期 L**: ${params.leadTime} 期\n- **平滑参数 p**: ${params.smoothingP} 阶\n- **理论方差放大倍数 BWE**: **${currentBwe.toFixed(2)}x**\n- **治理策略状态**: VMI (${params.enableVMI ? "已开启" : "未开启"}) | CPFR (${params.enableCPFR ? "已开启" : "未开启"}) | POS共享 (${params.enablePOSSharing ? "已开启" : "未开启"})\n\n💡 **部署与调用说明**：本项目支持纯浏览器端调用，直连官方大模型 API。**所有大模型调用必须输入 API-Key 后方能调用**。点击标题右侧小齿轮 ⚙️ 随时配置 API-Key 与切换 Gemini / DeepSeek 模型。`;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: getWelcomeText(aiConfig.selectedModel),
      timestamp: "刚刚",
      source: aiConfig.selectedModel,
    },
  ]);

  const [inputText, setInputText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const primaryRec = diagnosticReport.recommendations[0];
  const quickPrompts = [
    `诊断当前参数(L=${params.leadTime}, p=${params.smoothingP}, Q=${params.batchingSize})下方差放大 BWE=${currentBwe.toFixed(2)}x 的主导诱因与优化方案`,
    primaryRec && primaryRec.anomalyType !== "balanced"
      ? primaryRec.suggestedPrompt
      : "如果我们将提前期 L 压缩至 1 期，对全链库存持有成本和订单波动有何决定性影响？",
    "从博弈论角度看，供应商应如何破解客户在产能受限时的虚假双倍下单？",
    "对比华为集成供应链（ISC）与宝洁帮宝适案例在消弭牛鞭效应上的技术与机制异同",
  ];

  const handleSendReportToChat = (report: DiagnosticReport) => {
    let content = `### 📋 实验室 AI 运筹学主动诊断与对策建议报告\n\n`;
    content += `**诊断生成时间**: ${report.timestamp} | **综合健康指数**: **${100 - report.overallRiskScore}/100** | **风险评级**: **${
      report.riskLevel === "high" ? "⚠️ 高危发散" : report.riskLevel === "medium" ? "⚡ 次级预警" : "✅ 协同健康稳态"
    }**\n\n`;
    content += `- **理论方差下界 BWE**: $BWE \\ge 1 + \\frac{2L}{p} + \\frac{2L^2}{p^2} = ${report.theoreticalBwe.toFixed(2)}x$\n`;
    content += `- **仿真端最大实测放大**: **${report.maxActualBwe.toFixed(2)}x**\n`;
    content += `- **全链最低现货履约率**: **${report.worstServiceLevel.toFixed(1)}%**\n\n`;
    
    if (report.detectedChanges.length > 0) {
      content += `**最近检测到的实验切片变动**:\n`;
      report.detectedChanges.forEach((c) => {
        content += `- 🔄 ${c}\n`;
      });
      content += `\n`;
    }

    content += `#### 💡 针对当前异常的运筹学优化策略：\n\n`;
    report.recommendations.forEach((rec, idx) => {
      content += `**${idx + 1}. 【${rec.title}】** (*${rec.theoryOrigin}*)\n`;
      content += `- **触发诱因**: ${rec.triggerCondition}\n`;
      content += `- **机理剖析**: ${rec.diagnosisText}\n`;
      content += `- **🎯 主动建议策略**: **${rec.actionAdvice}**\n`;
      content += `- **预期成效**: ${rec.expectedImpact}\n\n`;
    });

    content += `*提示：您可以直接采纳上方卡片对策一键同步参数，或就上述任何策略直接向我提问深入探讨！*`;

    setMessages((prev) => [
      ...prev,
      {
        id: "diag-" + Date.now(),
        sender: "ai",
        text: content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: "AI主动运筹诊断引擎",
      },
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || loading) return;

    // 核心约束：所有大模型调用必须输入 API-Key 后才能调用
    const currentKey = getActiveApiKey(aiConfig);
    if (!currentKey) {
      setSettingsInitialError(
        `当前尚未输入 ${
          aiConfig.selectedModel === "gemini 3 flash" ? "Gemini 3 Flash" : "DeepSeek-V4-Pro"
        } 的 API-Key。所有大模型调用必须先手工输入并确认 API-Key 后方能发起提问！`
      );
      setIsSettingsOpen(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const result = await executeAiQuery({
        message: query,
        context: {
          leadTime: params.leadTime,
          smoothingP: params.smoothingP,
          theoreticalBWE: currentBwe,
          shockType: params.shockType,
          shockMagnitude: params.shockMagnitude,
          enableVMI: params.enableVMI,
          enableCPFR: params.enableCPFR,
          enablePOSSharing: params.enablePOSSharing,
          demandMean: params.demandMean,
          batchingSize: params.batchingSize,
          rationingRatio: params.rationingRatio,
        },
        config: aiConfig,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: result.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: result.model,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: `❌ 大模型调用未能成功：${err?.message || "网络请求异常"}。\n\n提示：请点击标题右侧小齿轮 ⚙️ 检查您的 API-Key 输入是否正确，或验证您的网络连接与代理端点。`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        sender: "ai",
        text: `对话已重置。当前已重新同步实验上下文：提前期 L = ${params.leadTime}，平滑阶数 p = ${params.smoothingP}，BWE = ${currentBwe.toFixed(2)}x。当前模型：${aiConfig.selectedModel}。请随时提问！`,
        timestamp: "刚刚",
        source: aiConfig.selectedModel,
      },
    ]);
  };

  const handleSaveConfig = (newConfig: AiConfig) => {
    setAiConfig(newConfig);
    saveAiConfig(newConfig);
  };

  return (
    <div className="space-y-6">
      {/* 模块引言与大模型设置切片 */}
      <div className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-900 text-stone-100">
                模块 07 · AI决策大脑
              </span>
              <span className="text-xs text-stone-500 font-mono flex items-center gap-1">
                <span>浏览器直连</span>
                <span>·</span>
                <span className="font-semibold text-stone-800">{aiConfig.selectedModel}</span>
              </span>
              {hasKey ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  API-Key 已就绪
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-mono">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  未输入 API-Key (点击齿轮设置)
                </span>
              )}
            </div>

            {/* 模块标题栏：标题最右侧添加一个小齿轮设置大模型图标 */}
            <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 flex items-center gap-2.5 flex-wrap">
                <span>AI 智能对话窗口：实时异常诊断与科研策略推导</span>
                {/* 标题最右侧小齿轮设置大模型图标 */}
                <button
                  id="title-gear-settings-btn"
                  onClick={() => {
                    setSettingsInitialError(null);
                    setIsSettingsOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-stone-300 hover:border-stone-800 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-medium transition-all shadow-2xs group cursor-pointer"
                  title="设置大模型与手工输入 API-Key (gemini 3 flash / deepseek-v4-pro)"
                >
                  <Settings className="w-4 h-4 text-stone-600 group-hover:rotate-90 group-hover:text-stone-900 transition-transform duration-300" />
                  <span className="text-[11px] font-sans font-semibold text-stone-700 group-hover:text-stone-900">
                    大模型设置
                  </span>
                </button>
              </h2>
            </div>

            <p className="text-sm text-stone-600 mt-2 max-w-3xl leading-relaxed">
              支持直接在浏览器端发起大模型调用（适配 GitHub Pages 纯前端静态部署）。实时同步实验沙盒切片参数（<span className="font-mono font-medium">L={params.leadTime}, p={params.smoothingP}, BWE={currentBwe.toFixed(2)}x</span>），解答代数建模疑难，识别波动根因，推导运筹对策。
            </p>
          </div>

          {/* 右侧功能按钮区 */}
          <div className="flex items-center gap-2 shrink-0 self-start">
            <button
              id="header-open-settings-btn"
              onClick={() => {
                setSettingsInitialError(null);
                setIsSettingsOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 transition-colors shadow-2xs"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>{hasKey ? "配置 API-Key" : "输入 API-Key"}</span>
            </button>

            <button
              id="reset-chat-btn"
              onClick={handleResetChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
              title="清空并重置当前对话历史"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>清空对话</span>
            </button>
          </div>
        </div>

        {/* 快捷提问切片胶囊 */}
        <div className="mt-4 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>实验室科研推荐提问切片：</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                id={`quick-prompt-btn-${idx}`}
                onClick={() => handleSend(prompt)}
                className="text-left px-3 py-2 rounded-xl text-xs bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/80 transition-all flex items-center justify-between gap-2 group cursor-pointer"
              >
                <span className="truncate">{prompt}</span>
                <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-800 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI 运筹学实时诊断与主动决策建议面板 */}
      <AiDiagnosticPanel
        report={diagnosticReport}
        params={params}
        onChangeParams={onChangeParams}
        onAskAi={(prompt) => handleSend(prompt)}
        onSendReportToChat={handleSendReportToChat}
      />

      {/* 核心警示横幅：未输入 API-Key 时醒目提醒 */}
      {!hasKey && (
        <div 
          id="api-key-missing-banner"
          onClick={() => {
            setSettingsInitialError(null);
            setIsSettingsOpen(true);
          }}
          className="rounded-2xl p-4 bg-amber-50/90 border border-amber-200/90 text-amber-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-amber-100/70 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0">
              <Key className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="font-bold flex items-center gap-1.5">
                <span>提示：当前尚未配置大模型 API-Key</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-mono">必填</span>
              </div>
              <p className="text-amber-700 text-[11px] mt-0.5">
                本项目采用纯前端浏览器直接调用，所有大模型调用必须输入 API-Key 后方能调用。点击此处打开齿轮设置输入 Gemini 或 DeepSeek 密钥。
              </p>
            </div>
          </div>
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl bg-amber-900 text-amber-50 text-xs font-semibold hover:bg-amber-800 shrink-0 transition-colors shadow-2xs"
          >
            设置密钥
          </button>
        </div>
      )}

      {/* 对话消息流视窗 */}
      <div className="rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col h-[520px]">
        {/* 对话视窗顶栏：显示当前调用模型与状态 */}
        <div className="px-5 py-2.5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between text-xs text-stone-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>当前调用引擎: <strong className="text-stone-800 font-sans">{aiConfig.selectedModel}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSettingsInitialError(null);
                setIsSettingsOpen(true);
              }}
              className="text-stone-500 hover:text-stone-900 hover:underline flex items-center gap-1"
            >
              <Settings className="w-3 h-3" />
              <span>切换模型 / API-Key</span>
            </button>
          </div>
        </div>

        {/* 消息历史滚动区 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => {
            const isAi = m.sender === "ai";
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-3xl ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isAi
                      ? m.isError 
                        ? "bg-red-600 text-white" 
                        : "bg-stone-900 text-stone-100 shadow-xs"
                      : "bg-teal-600 text-white"
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className="space-y-1 max-w-2xl">
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isAi
                        ? m.isError
                          ? "bg-red-50 text-red-800 border border-red-200"
                          : "bg-stone-50/90 text-stone-800 border border-stone-200/80"
                        : "bg-stone-900 text-stone-100"
                    }`}
                  >
                    {isAi ? (
                      <MarkdownKatex content={m.text} />
                    ) : (
                      <div className="whitespace-pre-wrap font-sans">
                        <InlineMathText text={m.text} />
                      </div>
                    )}
                  </div>

                  <div className={`flex items-center gap-2 text-[10px] text-stone-400 font-mono px-1 ${!isAi ? "justify-end" : ""}`}>
                    <span>{m.timestamp}</span>
                    {m.source && (
                      <span className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-500">
                        {m.source}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                <span>{aiConfig.selectedModel} 正在研判当前供应链仿真切片与代数特征...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入框 */}
        <div className="p-3.5 border-t border-stone-100 bg-stone-50/50 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-user-query-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                hasKey
                  ? `向 ${aiConfig.selectedModel} 提问：例如“分析当前提前期 L 的敏感性”或“如何通过 CPFR 消除短缺博弈”...`
                  : "所有大模型调用必须输入 API-Key！请先点击右上角小齿轮 ⚙️ 设置 API-Key..."
              }
              className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-800"
            />
            <button
              id="send-ai-query-btn"
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-stone-900 text-stone-100 text-xs font-semibold hover:bg-stone-800 disabled:opacity-40 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <span>发送</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* 大模型设置与 API-Key 手工输入弹窗 */}
      <AiModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={aiConfig}
        onSaveConfig={handleSaveConfig}
        initialError={settingsInitialError}
      />
    </div>
  );
};
