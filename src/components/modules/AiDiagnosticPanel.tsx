/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SimulationParameters } from "../../types";
import { DiagnosticReport, DiagnosticRecommendation } from "../../utils/aiDiagnosticEngine";
import { 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Sliders, 
  Check, 
  BookOpen, 
  Send,
  Zap,
  TrendingDown
} from "lucide-react";

interface AiDiagnosticPanelProps {
  report: DiagnosticReport;
  params: SimulationParameters;
  onChangeParams?: React.Dispatch<React.SetStateAction<SimulationParameters>>;
  onAskAi: (prompt: string) => void;
  onSendReportToChat: (report: DiagnosticReport) => void;
}

export const AiDiagnosticPanel: React.FC<AiDiagnosticPanelProps> = ({
  report,
  params,
  onChangeParams,
  onAskAi,
  onSendReportToChat,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [appliedRecId, setAppliedRecId] = useState<string | null>(null);

  const handleApplyAdvice = (rec: DiagnosticRecommendation) => {
    if (!rec.suggestedParams || !onChangeParams) return;
    onChangeParams((prev) => ({
      ...prev,
      ...rec.suggestedParams,
    }));
    setAppliedRecId(rec.id);
    setTimeout(() => {
      setAppliedRecId(null);
    }, 2500);
  };

  const getSeverityBadge = (severity: DiagnosticRecommendation["severity"]) => {
    switch (severity) {
      case "critical":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3 h-3 text-red-600" />
            高危发散
          </span>
        );
      case "warning":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            次级预警
          </span>
        );
      case "optimal":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            协同稳态
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <Info className="w-3 h-3 text-sky-600" />
            运筹建议
          </span>
        );
    }
  };

  const isRiskHigh = report.riskLevel === "high";
  const isRiskMedium = report.riskLevel === "medium";

  return (
    <div 
      id="ai-diagnostic-recommendations-panel"
      className={`rounded-2xl border transition-all duration-300 shadow-2xs overflow-hidden ${
        isRiskHigh
          ? "bg-gradient-to-b from-red-50/70 via-stone-50/50 to-white border-red-200/90"
          : isRiskMedium
          ? "bg-gradient-to-b from-amber-50/60 via-stone-50/50 to-white border-amber-200/90"
          : "bg-gradient-to-b from-teal-50/50 via-stone-50/40 to-white border-stone-200"
      }`}
    >
      {/* 头部摘要栏 */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100">
        <div className="flex items-start sm:items-center gap-3">
          <div 
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isRiskHigh
                ? "bg-red-600 text-white"
                : isRiskMedium
                ? "bg-amber-600 text-white"
                : "bg-stone-900 text-stone-100"
            }`}
          >
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
                <span>AI 运筹学实时诊断与对策建议</span>
              </h3>
              <span 
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide ${
                  isRiskHigh
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : isRiskMedium
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}
              >
                {report.riskLevel === "high" && "风险等级: 高危"}
                {report.riskLevel === "medium" && "风险等级: 中度"}
                {report.riskLevel === "low" && "风险等级: 轻微"}
                {report.riskLevel === "optimal" && "状态: 协同健康"}
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                综合健康指数: <strong className="text-stone-800">{100 - report.overallRiskScore}/100</strong>
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1 leading-snug">
              {report.summaryDescription}
            </p>
          </div>
        </div>

        {/* 顶部右侧指标与快捷按钮 */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            id="send-full-report-btn"
            onClick={() => onSendReportToChat(report)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            title="将当前的运筹学诊断与调整对策打包发送到下方 AI 对话视窗"
          >
            <Send className="w-3.5 h-3.5 text-stone-600" />
            <span>推入对话视窗</span>
          </button>

          <button
            id="toggle-diagnostic-panel-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 text-xs transition-colors cursor-pointer"
            title={isExpanded ? "收起建议列表" : "展开建议列表"}
          >
            <span className="text-[11px] font-mono">{report.recommendations.length} 条对策</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 参数变动感知胶囊栏 */}
      {report.detectedChanges.length > 0 && (
        <div className="px-4 sm:px-5 py-2 bg-stone-100/70 border-b border-stone-200/60 flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 text-stone-600 font-medium shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>感知到实验参数更新：</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {report.detectedChanges.map((change, idx) => (
              <span 
                key={idx}
                className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 text-[11px] font-mono shadow-2xs"
              >
                {change}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 建议卡片展开列表 */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="grid grid-cols-1 gap-3.5">
            {report.recommendations.map((rec) => {
              const isApplied = appliedRecId === rec.id;

              return (
                <div
                  key={rec.id}
                  className="rounded-xl bg-white border border-stone-200 p-4 transition-all hover:border-stone-400/80 shadow-2xs space-y-3"
                >
                  {/* 卡片顶栏 */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSeverityBadge(rec.severity)}
                      <h4 className="text-sm font-bold text-stone-900">
                        {rec.title}
                      </h4>
                      <span className="text-[11px] text-stone-400">·</span>
                      <span className="text-[11px] text-stone-500 font-medium flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-stone-400" />
                        <span>{rec.theoryOrigin}</span>
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-stone-500 shrink-0">
                      触发根据: <span className="text-stone-700">{rec.triggerCondition}</span>
                    </div>
                  </div>

                  {/* 深入机理剖析阐述 */}
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {rec.diagnosisText}
                  </p>

                  {/* 主动提出的调整策略（醒目展示） */}
                  <div className="p-3 rounded-lg bg-stone-50 border border-stone-200/90 text-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-stone-900 text-stone-100 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                        ⚡
                      </div>
                      <div>
                        <div className="text-[10px] font-mono font-bold text-stone-500 uppercase">
                          AI 运筹调整策略
                        </div>
                        <div className="text-xs font-semibold text-stone-900 mt-0.5 leading-snug">
                          {rec.actionAdvice}
                        </div>
                        <div className="text-[11px] text-teal-700 font-medium mt-0.5 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3 text-teal-600" />
                          <span>预期成效: {rec.expectedImpact}</span>
                        </div>
                      </div>
                    </div>

                    {/* 卡片动作操作栏 */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {rec.suggestedParams && onChangeParams && (
                        <button
                          type="button"
                          onClick={() => handleApplyAdvice(rec)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer ${
                            isApplied
                              ? "bg-emerald-600 text-white"
                              : "bg-stone-900 text-stone-100 hover:bg-stone-800"
                          }`}
                          title="自动将建议参数写入实验全局切片"
                        >
                          {isApplied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>已采纳对策</span>
                            </>
                          ) : (
                            <>
                              <Sliders className="w-3.5 h-3.5 text-stone-300" />
                              <span>一键采纳该建议</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onAskAi(rec.suggestedPrompt)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
                        title="将此对策作为深度学术课题发给 AI 大模型开展运筹学论证"
                      >
                        <span>向 AI 深入推演</span>
                        <ArrowRight className="w-3 h-3 text-stone-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
