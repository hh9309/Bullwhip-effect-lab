/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  X, 
  Key, 
  Check, 
  Cpu, 
  Sparkles, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe
} from "lucide-react";
import { 
  AiConfig, 
  AiModelId, 
  saveAiConfig 
} from "../../utils/aiService";

interface AiModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AiConfig;
  onSaveConfig: (newConfig: AiConfig) => void;
  initialError?: string | null;
}

export const AiModelSettingsModal: React.FC<AiModelSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  initialError,
}) => {
  const [selectedModel, setSelectedModel] = useState<AiModelId>(config.selectedModel);
  const [geminiKey, setGeminiKey] = useState<string>(config.geminiKey);
  const [deepseekKey, setDeepseekKey] = useState<string>(config.deepseekKey);
  const [deepseekBaseUrl, setDeepseekBaseUrl] = useState<string>(
    config.deepseekBaseUrl || "https://api.deepseek.com"
  );
  const [customGeminiModel, setCustomGeminiModel] = useState<string>(
    config.customGeminiModel || "gemini-2.5-flash"
  );
  const [customDeepseekModel, setCustomDeepseekModel] = useState<string>(
    config.customDeepseekModel || "deepseek-chat"
  );

  const [showKey, setShowKey] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const [successNotice, setSuccessNotice] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedModel(config.selectedModel);
      setGeminiKey(config.geminiKey);
      setDeepseekKey(config.deepseekKey);
      setDeepseekBaseUrl(config.deepseekBaseUrl || "https://api.deepseek.com");
      setCustomGeminiModel(config.customGeminiModel || "gemini-2.5-flash");
      setCustomDeepseekModel(config.customDeepseekModel || "deepseek-chat");
      setErrorMessage(initialError || null);
      setSuccessNotice(false);
    }
  }, [isOpen, config, initialError]);

  if (!isOpen) return null;

  const currentKey = selectedModel === "gemini 3 flash" ? geminiKey : deepseekKey;

  const handleConfirm = () => {
    const trimmedKey = currentKey.trim();

    if (!trimmedKey) {
      setErrorMessage(
        `所有大模型调用必须输入 API-Key！请手工输入 ${
          selectedModel === "gemini 3 flash" ? "Gemini 3 Flash" : "DeepSeek-V4-Pro"
        } 的有效 API-Key 后再确认。`
      );
      return;
    }

    const newConfig: AiConfig = {
      selectedModel,
      geminiKey: geminiKey.trim(),
      deepseekKey: deepseekKey.trim(),
      deepseekBaseUrl: (deepseekBaseUrl || "https://api.deepseek.com").trim(),
      customGeminiModel: customGeminiModel.trim() || "gemini-2.5-flash",
      customDeepseekModel: customDeepseekModel.trim() || "deepseek-chat",
    };

    saveAiConfig(newConfig);
    onSaveConfig(newConfig);
    setSuccessNotice(true);
    setErrorMessage(null);

    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div 
      id="ai-model-settings-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-xl bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden text-stone-800">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
              <Settings className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                大模型设置与 API-Key 配置
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                GitHub 静态部署 · 浏览器端直连调用 · 本地安全加密存储
              </p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="关闭窗口"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 状态警示或成功通知 */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>大模型配置已确认生效！已更新本地运行策略。</span>
            </div>
          )}

          {/* 核心功能 1: 选择大模型 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                <span>选择大模型 (双核引擎)</span>
              </label>
              <span className="text-[11px] text-stone-400 font-mono">
                当前勾选: {selectedModel}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 模型 1: gemini 3 flash */}
              <div
                id="select-model-gemini"
                onClick={() => {
                  setSelectedModel("gemini 3 flash");
                  setErrorMessage(null);
                }}
                className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative flex flex-col justify-between ${
                  selectedModel === "gemini 3 flash"
                    ? "border-stone-900 bg-stone-50 ring-1 ring-stone-900 shadow-2xs"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      gemini 3 flash
                    </span>
                    {selectedModel === "gemini 3 flash" && (
                      <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Google DeepMind 闪电推理模型。原生支持浏览器跨域直连，极速解析代数推导与级联时滞。
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                  <span>GitHub部署极佳</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    CORS友好
                  </span>
                </div>
              </div>

              {/* 模型 2: deepseek-v4-pro */}
              <div
                id="select-model-deepseek"
                onClick={() => {
                  setSelectedModel("deepseek-v4-pro");
                  setErrorMessage(null);
                }}
                className={`cursor-pointer p-4 rounded-xl border transition-all text-left relative flex flex-col justify-between ${
                  selectedModel === "deepseek-v4-pro"
                    ? "border-stone-900 bg-stone-50 ring-1 ring-stone-900 shadow-2xs"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/50"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-teal-600" />
                      deepseek-v4-pro
                    </span>
                    {selectedModel === "deepseek-v4-pro" && (
                      <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    DeepSeek AI 深度思维引擎。长逻辑链推导，擅长博弈论推演、短缺配额博弈与复杂运筹诊断。
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                  <span>深度推理链</span>
                  <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                    Chat API
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 核心功能 2: 手工输入 API-Key */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 text-[10px] font-bold flex items-center justify-center">
                  2
                </span>
                <span>
                  手工输入 {selectedModel === "gemini 3 flash" ? "Gemini" : "DeepSeek"} API-Key
                </span>
                <span className="text-red-500 font-bold">*</span>
              </label>

              <div className="flex items-center gap-2">
                {currentKey.trim() ? (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    已输入密钥
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    未输入密钥 (必填)
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Key className="w-4 h-4" />
              </div>
              <input
                id="api-key-input-field"
                type={showKey ? "text" : "password"}
                value={selectedModel === "gemini 3 flash" ? geminiKey : deepseekKey}
                onChange={(e) => {
                  setErrorMessage(null);
                  if (selectedModel === "gemini 3 flash") {
                    setGeminiKey(e.target.value);
                  } else {
                    setDeepseekKey(e.target.value);
                  }
                }}
                placeholder={
                  selectedModel === "gemini 3 flash"
                    ? "请输入 Gemini API-Key (例如: AIzaSy...)"
                    : "请输入 DeepSeek API-Key (例如: sk-...)"
                }
                className="w-full pl-9 pr-20 py-2.5 text-xs rounded-xl border border-stone-200 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900 font-mono shadow-2xs"
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                {currentKey && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedModel === "gemini 3 flash") setGeminiKey("");
                      else setDeepseekKey("");
                    }}
                    className="p-1 text-stone-400 hover:text-stone-700 text-xs rounded"
                    title="清除输入"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1 text-stone-400 hover:text-stone-700 text-xs rounded"
                  title={showKey ? "隐藏密钥" : "显示明文"}
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* 快速获取与安全说明 */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                仅保存在浏览器本地 LocalStorage，无服务器转存
              </span>
              <a
                href={
                  selectedModel === "gemini 3 flash"
                    ? "https://aistudio.google.com/app/apikey"
                    : "https://platform.deepseek.com/api_keys"
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-stone-700 hover:text-stone-900 hover:underline font-medium"
              >
                <span>获取官方 {selectedModel === "gemini 3 flash" ? "Gemini" : "DeepSeek"} Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* 高级设置抽屉 (适用于 GitHub Pages 跨域代理或微调) */}
            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium transition-colors"
              >
                <span>高级网络与端点配置 (GitHub Pages 部署中转)</span>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="mt-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-3 animate-in fade-in duration-150">
                  {selectedModel === "deepseek-v4-pro" ? (
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>DeepSeek API Base URL (反向代理地址)</span>
                      </label>
                      <input
                        type="text"
                        value={deepseekBaseUrl}
                        onChange={(e) => setDeepseekBaseUrl(e.target.value)}
                        placeholder="https://api.deepseek.com"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-stone-800 font-mono focus:outline-none focus:border-stone-800"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">
                        默认使用官方地址。若部署在 GitHub Pages 遇到浏览器跨域拦截（CORS），可配置为支持跨域的 Cloudflare Worker 反向代理或第三方 OpenAI 兼容端点。
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-1">
                        Gemini 模型版本标识符
                      </label>
                      <input
                        type="text"
                        value={customGeminiModel}
                        onChange={(e) => setCustomGeminiModel(e.target.value)}
                        placeholder="gemini-2.5-flash"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-stone-800 font-mono focus:outline-none focus:border-stone-800"
                      />
                      <p className="text-[10px] text-stone-400 mt-1">
                        支持指定 gemini-2.5-flash、gemini-2.0-flash 或 gemini-1.5-flash，系统已配置自动容错回落。
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 核心功能 3: 底部操作栏（确认大模型） */}
        <div className="px-6 py-4 border-t border-stone-100 bg-stone-50/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
          >
            取消
          </button>

          <button
            id="confirm-ai-model-btn"
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs hover:shadow"
          >
            <Check className="w-4 h-4" />
            <span>确认大模型并保存配置</span>
          </button>
        </div>
      </div>
    </div>
  );
};
