/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ModuleId, SimulationParameters } from "./types";
import { calculateTheoreticalBWE } from "./utils/simulation";
import { Header } from "./components/common/Header";
import { TheoreticalAlgebraModule } from "./components/modules/TheoreticalAlgebraModule";
import { CascadeSandbox2DModule } from "./components/modules/CascadeSandbox2DModule";
import { OrderAmplificationModule } from "./components/modules/OrderAmplificationModule";
import { DampingControlModule } from "./components/modules/DampingControlModule";
import { CaseStudiesModule } from "./components/modules/CaseStudiesModule";
import { SystemDynamicsModule } from "./components/modules/SystemDynamicsModule";
import { AiAssistantModule } from "./components/modules/AiAssistantModule";
import { DataAnalysisReportModule } from "./components/modules/DataAnalysisReportModule";
import { KnowledgeGraphModule } from "./components/modules/KnowledgeGraphModule";
import { LAB_MODULES } from "./utils/constants";
import { ArrowLeft, ArrowRight, Layers, Sparkles } from "lucide-react";

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>("cascade-sandbox");

  // 核心实验全局参数
  const [params, setParams] = useState<SimulationParameters>({
    leadTime: 3,
    smoothingP: 5,
    demandMean: 100,
    demandVolatility: 15,
    shockType: "pulse",
    shockMagnitude: 40,
    batchingSize: 1,
    rationingRatio: 1.0,
    enableVMI: false,
    enableCPFR: false,
    enablePOSSharing: false,
  });

  const currentBwe = calculateTheoreticalBWE(params.leadTime, params.smoothingP);

  const handleReset = () => {
    setParams({
      leadTime: 3,
      smoothingP: 5,
      demandMean: 100,
      demandVolatility: 15,
      shockType: "pulse",
      shockMagnitude: 40,
      batchingSize: 1,
      rationingRatio: 1.0,
      enableVMI: false,
      enableCPFR: false,
      enablePOSSharing: false,
    });
  };

  const currentModIndex = LAB_MODULES.findIndex((m) => m.id === activeModule);
  const prevModule = currentModIndex > 0 ? LAB_MODULES[currentModIndex - 1] : null;
  const nextModule = currentModIndex < LAB_MODULES.length - 1 ? LAB_MODULES[currentModIndex + 1] : null;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/70 text-stone-800 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* 顶部3层架构导航与切片矩阵 */}
      <Header
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onReset={handleReset}
        currentBwe={currentBwe}
      />

      {/* 主实验视窗 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {activeModule === "theoretical-algebra" && (
          <TheoreticalAlgebraModule
            leadTime={params.leadTime}
            smoothingP={params.smoothingP}
            onChangeLeadTime={(l) => setParams((prev) => ({ ...prev, leadTime: l }))}
            onChangeSmoothingP={(p) => setParams((prev) => ({ ...prev, smoothingP: p }))}
          />
        )}

        {activeModule === "cascade-sandbox" && (
          <CascadeSandbox2DModule
            params={params}
            onChangeParams={setParams}
          />
        )}

        {activeModule === "order-amplification" && (
          <OrderAmplificationModule />
        )}

        {activeModule === "damping-control" && (
          <DampingControlModule
            params={params}
            onChangeParams={setParams}
          />
        )}

        {activeModule === "case-studies" && (
          <CaseStudiesModule />
        )}

        {activeModule === "system-dynamics" && (
          <SystemDynamicsModule />
        )}

        {activeModule === "ai-dialogue" && (
          <AiAssistantModule 
            params={params} 
            onChangeParams={setParams} 
          />
        )}

        {activeModule === "data-report" && (
          <DataAnalysisReportModule params={params} />
        )}

        {activeModule === "knowledge-graph" && (
          <KnowledgeGraphModule />
        )}

        {/* 底部前后模块切片快切栏 */}
        <div className="pt-4 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">实验导航：</span>
            <span>当前为第 {currentModIndex + 1} / 9 核心模块</span>
          </div>

          <div className="flex items-center gap-2">
            {prevModule && (
              <button
                onClick={() => setActiveModule(prevModule.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition-colors shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>上一模块: {prevModule.name}</span>
              </button>
            )}

            {nextModule && (
              <button
                onClick={() => setActiveModule(nextModule.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-900 text-stone-100 hover:bg-stone-800 transition-colors shadow-2xs"
              >
                <span>下一模块: {nextModule.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* 极简淡雅实验室底栏 */}
      <footer className="border-t border-stone-200/60 bg-stone-100/40 py-4 text-center text-xs text-stone-400 font-mono">
        <p>供应链牛鞭效应实验室 (Bullwhip Lab) · 运筹学与系统动力学仿真科研工作台</p>
      </footer>
    </div>
  );
}
