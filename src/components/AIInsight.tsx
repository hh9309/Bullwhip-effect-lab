import { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { FileText, Sparkles, Loader2, AlertTriangle, Settings, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIInsightProps {
  history: any[];
  tick: number;
  activeEvents?: any[];
}

type ModelType = 'gemini-3-flash' | 'deepseek-v4-pro';

export function AIInsight({ history, tick, activeEvents = [] }: AIInsightProps) {
  const [insight, setInsight] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Settings state
  const [model, setModel] = useState<ModelType>('gemini-3-flash');
  const [apiKey, setApiKey] = useState<string>('');
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedModel = localStorage.getItem('ai_model');
    const savedKey = localStorage.getItem('ai_api_key');
    if (savedModel === 'deepseek-reasoner') {
      setModel('deepseek-v4-pro');
      localStorage.setItem('ai_model', 'deepseek-v4-pro');
    } else if (savedModel === 'gemini-3-flash' || savedModel === 'deepseek-v4-pro') {
      setModel(savedModel);
    }
    if (savedKey) setApiKey(savedKey);
  }, []);

  // Save settings
  const saveSettings = () => {
    localStorage.setItem('ai_model', model);
    localStorage.setItem('ai_api_key', apiKey);
    setShowSettings(false);
  };

  const generateInsight = async () => {
    if (history.length < 5) {
      setInsight("仿真数据不足，请先运行一段时间（至少5个周期）再生成分析。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data summary for AI
      const recentHistory = history.slice(-20); // Analyze last 20 ticks
      const summary = {
        tick,
        activeEvents: activeEvents.map(e => ({ name: e.name, type: e.type, desc: e.description })),
        data: recentHistory.map((h: any) => ({
          t: h.tick,
          retailerOrder: h.retailerOrder,
          manufacturerOrder: h.manufacturerOrder,
          retailerBacklog: h.retailerBacklog,
          manufacturerBacklog: h.manufacturerBacklog
        }))
      };

      const prompt = `
        作为供应链专家，请分析以下啤酒游戏（牛鞭效应仿真）的数据片段。
        
        当前时间: Tick ${tick}
        当前活跃的突发事件: ${JSON.stringify(summary.activeEvents)}
        最近20个周期的数据摘要: ${JSON.stringify(summary.data)}
        
        请提供简短的洞察（200字以内）：
        1. **现状评估**：牛鞭效应是否严重？请明确给出**牛鞭效应放大倍数（B = Var(Orders) / Var(Demand)）**的分析估算。若有突发事件，请说明其影响。
        2. **原因分析**：分析当前波动与突发事件之间的关联。
        3. **建议**：在此种极端情况下，供应链各方应如何调整策略？
        
        请用中文回答，使用Markdown格式，语气专业且富有洞察力。
      `;

      if (model === 'gemini-3-flash') {
        const key = apiKey || '';
        if (!key) throw new Error("缺少 Gemini API Key。请在设置中输入。");
        
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash", 
          contents: prompt,
        });
        
        setInsight(response.text || "无法生成分析结果。");
      } else if (model === 'deepseek-v4-pro') {
        if (!apiKey) throw new Error("缺少 DeepSeek API Key。请在设置中输入。");
        
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "deepseek-v4-pro",
            messages: [
              { role: "system", content: "你是一个专业的供应链管理专家。" },
              { role: "user", content: prompt }
            ],
            max_tokens: 2048,
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          let errorMessage = "DeepSeek API 请求失败";
          try {
            const errData = JSON.parse(errText);
            errorMessage = errData.error?.message || errorMessage;
          } catch (e) {
            errorMessage = `API Error: ${response.status} ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setInsight(data.choices?.[0]?.message?.content || "无法生成分析结果。");
      }

    } catch (err: any) {
      console.error("AI Generation Error:", err);
      setError(err.message || "生成分析时出错，请检查网络或 API Key 设置。");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (history.length < 10) {
      setError("仿真数据不足，请先运行至少10个周期后再生成详细实验报告。");
      return;
    }

    setReportLoading(true);
    setError(null);

    try {
      // Prepare full data snapshot for report
      const fullHistory = history.map((h: any) => ({
        t: h.tick,
        demand: h.customerDemand,
        retailer: { inv: h.nodes.find((n: any) => n.id === 'retailer')?.inventory, order: h.nodes.find((n: any) => n.id === 'retailer')?.lastOutgoingOrder, backlog: h.nodes.find((n: any) => n.id === 'retailer')?.backlog },
        wholesaler: { inv: h.nodes.find((n: any) => n.id === 'wholesaler')?.inventory, order: h.nodes.find((n: any) => n.id === 'wholesaler')?.lastOutgoingOrder, backlog: h.nodes.find((n: any) => n.id === 'wholesaler')?.backlog },
        manufacturer: { inv: h.nodes.find((n: any) => n.id === 'manufacturer')?.inventory, order: h.nodes.find((n: any) => n.id === 'manufacturer')?.lastOutgoingOrder, backlog: h.nodes.find((n: any) => n.id === 'manufacturer')?.backlog }
      }));

      const prompt = `
        你是一位资深的供应链战略顾问，请根据这份完整的“啤酒游戏”供应链仿真实验数据，撰写一份详尽的实验分析报告。
        
        实验总历时: ${tick} 周期
        发生的突发事件记录: ${JSON.stringify(activeEvents)}
        详细历史数据流: ${JSON.stringify(fullHistory)}
        
        报告要求（总字数约800字）：
        1. **实验背景与目标**：简述本次仿真的设置条件（如基础延迟、突发事件）。
        2. **运行过程回顾**：描述需求波动的演变过程，特别是突发事件如何打破原有平衡。
        3. **核心数据指标分析**：
           - 计算各环节订单方差与需求方差的比值（牛鞭效应放大率）。
           - 分析库存周转与欠货成本的平衡点。
        4. **系统性洞察**：从系统动力学角度分析波动放大的根源（信息滞后、恐慌决策、库存策略等）。
        5. **管理改善方案**：基于本次实验结果，提出至少3条具体的供应链优化策略。
        
        请用中文回答，使用专业的报告格式，Markdown 排版，逻辑严密。
      `;

      if (model === 'gemini-3-flash') {
        const key = apiKey || '';
        if (!key) throw new Error("缺少 Gemini API Key。请在设置中输入。");
        
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash", 
          contents: prompt,
        });
        
        setReport(response.text || "无法生成报告。");
      } else if (model === 'deepseek-v4-pro') {
        if (!apiKey) throw new Error("缺少 DeepSeek API Key。请在设置中输入。");
        
        const response = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "deepseek-v4-pro",
            messages: [
              { role: "system", content: "你是一个专业的供应链管理专家。" },
              { role: "user", content: prompt }
            ],
            max_tokens: 4096,
            temperature: 0.7
          })
        });

        if (!response.ok) throw new Error("DeepSeek API 请求失败");

        const data = await response.json();
        setReport(data.choices?.[0]?.message?.content || "无法生成报告。");
      }

    } catch (err: any) {
      console.error("Report Generation Error:", err);
      setError(err.message || "生成报告时出错。");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden relative">
      <div className="bg-gradient-to-r from-purple-50 to-white p-4 border-b border-purple-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-purple-900">AI 供应链智能洞察</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="设置模型与 API Key"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={generateReport}
            disabled={reportLoading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {report ? "重新生成报告" : "生成实验报告"}
          </button>
          <button
            onClick={generateInsight}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {insight ? "重新分析" : "生成分析"}
          </button>
        </div>
      </div>
      
      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-50 border-b border-slate-200 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-semibold text-slate-700">AI 模型设置</h4>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">选择模型</label>
                  <select 
                    value={model} 
                    onChange={(e) => setModel(e.target.value as ModelType)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="gemini-3-flash">Gemini 3 Flash</option>
                    <option value="deepseek-v4-pro">DeepSeek V4 Pro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={model === 'gemini-3-flash' ? "请输入 Gemini API Key" : "请输入 DeepSeek API Key"}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">调用 AI 模型必须提供有效的 API Key</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  onClick={saveSettings}
                  className="px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md hover:bg-slate-700 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> 保存设置
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="p-6 min-h-[120px]">
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-4">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {report && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 border-b border-indigo-100 pb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h4 className="font-bold text-indigo-900 border-b-2 border-indigo-600 pb-1">详细实验总结分析报告</h4>
              <button 
                onClick={() => setReport("")}
                className="ml-auto text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="prose prose-sm prose-indigo max-w-none text-slate-800 bg-indigo-50/30 p-6 rounded-xl border border-indigo-100 shadow-inner">
              <div dangerouslySetInnerHTML={{ 
                __html: report
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n\s*-\s/g, '<br/>• ')
                  .replace(/\n\d+\.\s/g, '<br/>$0')
                  .replace(/\n/g, '<br/>') 
              }} />
            </div>
          </motion.div>
        )}
        
        {insight ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose prose-sm prose-purple max-w-none text-slate-700"
          >
            <div className="mb-2 text-xs text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Generated by {model === 'gemini-3-flash' ? 'Gemini 3' : 'DeepSeek V4 Pro'}
            </div>
            <div dangerouslySetInnerHTML={{ 
              __html: insight
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n/g, '<br/>') 
            }} />
          </motion.div>
        ) : (
          <div className="text-center text-slate-400 py-8">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>点击上方按钮，让 AI 分析当前的供应链波动情况</p>
          </div>
        )}
      </div>
    </div>
  );
}
