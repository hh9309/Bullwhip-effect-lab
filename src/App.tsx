/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, ChevronRight, Info, LayoutDashboard, LineChart, BookMarked, FlaskConical, Rocket, GraduationCap } from 'lucide-react';
import { createInitialState, advanceSimulation, SimulationState } from '@/lib/simulation';
import { RoleCard } from '@/components/RoleCard';
import { OrderChart, InventoryChart, AmplificationChart } from '@/components/Charts';
import { AIInsight } from '@/components/AIInsight';
import { TransitStatus } from '@/components/TransitStatus';
import { LinkStatus } from '@/components/LinkStatus';
import { FormulaModule } from '@/components/FormulaModule';
import { ManufacturingScene } from '@/components/ManufacturingScene';
import { KnowledgeBase } from '@/components/KnowledgeBase';
import { ExperimentalScenarios } from '@/components/ExperimentalScenarios';
import { BlackSwanDashboard } from '@/components/BlackSwanDashboard';
import { AutoDiagnostic } from '@/components/AutoDiagnostic';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export default function App() {
  const [state, setState] = useState<SimulationState>(createInitialState());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000); // ms per tick
  const [activeView, setActiveView] = useState<'monitor' | 'data' | 'scenarios' | 'theory'>('monitor');
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [showLevelIntro, setShowLevelIntro] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStep = () => {
    if (state.tick < 100) {
      setState(prev => advanceSimulation(prev));
    }
  };

  const handleReset = () => {
    if (window.confirm("确定要重置仿真到初始状态吗？重置后所有当前数据将丢失。")) {
      setIsPlaying(false);
      setState(createInitialState());
      setCurrentLevel(null);
    }
  };

  const startLevel = (levelId: number) => {
    const initialState = createInitialState();
    if (levelId === 1) {
      initialState.config.baseLeadTime = 4;
      initialState.config.orderDelay = 1;
    }
    setState(initialState);
    setCurrentLevel(levelId);
    setShowLevelIntro(true);
    setActiveView('monitor');
  };

  const togglePlay = () => {
    if (!isPlaying && state.tick >= 100) return;
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setState(prev => {
          if (prev.tick >= 100) {
            setIsPlaying(false);
            return prev;
          }
          return advanceSimulation(prev);
        });
      }, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed]);

  const chartData = state.nodes[0].history.map((_, index) => ({
    tick: index,
    retailerOrder: state.nodes[0].history[index].order,
    wholesalerOrder: state.nodes[1].history[index].order,
    distributorOrder: state.nodes[2].history[index].order,
    manufacturerOrder: state.nodes[3].history[index].order,
    retailerInv: state.nodes[0].history[index].inventory,
    wholesalerInv: state.nodes[1].history[index].inventory,
    distributorInv: state.nodes[2].history[index].inventory,
    manufacturerInv: state.nodes[3].history[index].inventory,
  }));

  const getPrevNodeId = (index: number) => {
    if (index === 0) return 'customer';
    return state.nodes[index - 1].id;
  };

  const navItems = [
    { id: 'monitor', label: '仿真监控', icon: LayoutDashboard },
    { id: 'data', label: '数据中心', icon: LineChart },
    { id: 'scenarios', label: '实验场景', icon: FlaskConical },
    { id: 'theory', label: '管理手册', icon: BookMarked },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center bg-slate-900 w-10 h-10 rounded-lg transform rotate-[-10deg] shadow-xl border border-slate-700">
              <Rocket className="w-6 h-6 text-white transform rotate-[45deg]" />
            </div>
            <div className="flex flex-col -gap-1">
              <div className="flex items-baseline gap-1">
                <h1 className="text-xl font-extrabold tracking-tighter text-slate-900 flex items-center">
                  SCM
                  <span className="text-blue-600 font-black italic ml-0.5">X</span>
                  <span className="ml-1 font-light tracking-widest text-slate-500 text-base">SIMFLOW</span>
                </h1>
              </div>
              <p className="text-[9px] text-blue-500 font-bold uppercase tracking-[0.2em] -mt-0.5">Bullwhip Effect Lab</p>
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-2" />
            
            {/* Guided Levels Selector */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => startLevel(1)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all border-2",
                  currentLevel === 1 
                    ? "bg-slate-900 text-white border-slate-900" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-900"
                )}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                延迟深渊
              </button>
            </div>
          </div>
          
          {/* Navigation Slices */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                  activeView === item.id 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {[1000, 500, 200].map((s, idx) => (
                <button 
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-bold transition-all",
                    speed === s ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  {idx + 1}x
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1" />

            <button 
              onClick={handleReset}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            {state.tick >= 100 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-right-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-red-600 uppercase tracking-tight">仿真已达上限</span>
              </div>
            )}

            <button 
              onClick={handleStep}
              disabled={isPlaying || state.tick >= 100}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="单步执行"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <button 
              onClick={togglePlay}
              disabled={state.tick >= 100}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-white transition-all shadow-md active:scale-95",
                isPlaying ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' : 
                state.tick >= 100 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
              )}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              {isPlaying ? '暂停' : state.tick >= 100 ? '仿真完成' : '开启仿真'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeView === 'monitor' && (
            <motion.div
              key="monitor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Monitoring Header */}
              <div className="space-y-6">
                {/* Banner & Node Flow */}
                <div className="space-y-6">
                  {/* Banner */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row items-start gap-4 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                      <LayoutDashboard className="w-32 h-32" />
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <Info className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="relative z-10 flex-1">
                      <h3 className="font-bold text-slate-900 text-lg">实时仿真全景看板</h3>
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-2xl">
                        当前正在监控四级供应链。您可以观察下游需求如何通过订单流向上游传递，
                        以及物流如何由于库存累积平衡法则影响各环节的欠货水平。
                      </p>
                      
                      {/* Dynamic Parameters Control */}
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <label>物流延迟 (Logistics Delay): {state.config.baseLeadTime}期</label>
                            {currentLevel === 1 && <span className="bg-slate-900 text-white px-1.5 py-0.5 rounded">关卡锁定</span>}
                          </div>
                          <input 
                            type="range" min="0" max="5" 
                            disabled={currentLevel === 1}
                            value={state.config.baseLeadTime} 
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              config: { ...prev.config, baseLeadTime: parseInt(e.target.value) }
                            }))}
                            className={cn(
                              "w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600",
                              currentLevel === 1 && "opacity-50 cursor-not-allowed"
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">信息延迟 (Order Delay): {state.config.orderDelay}期</label>
                          </div>
                          <input 
                            type="range" min="0" max="5" 
                            value={state.config.orderDelay} 
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              config: { ...prev.config, orderDelay: parseInt(e.target.value) }
                            }))}
                            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Node Flow */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-x-auto no-scrollbar">
                    <div className="flex justify-center items-center gap-0 min-w-max pb-4">
                      {/* Customer */}
                      <div className="flex flex-col items-center gap-3 shrink-0 mx-4">
                        <motion.div 
                          animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-14 h-14 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-2xl shadow-inner"
                        >
                          👤
                        </motion.div>
                        <div className="text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">终端需求</span>
                          <div className="mt-1 bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-black shadow-lg shadow-emerald-100">
                            {state.customerDemand}
                          </div>
                        </div>
                      </div>

                      {state.nodes.map((node, index) => (
                        <div key={node.id} className="flex items-center">
                          <LinkStatus leftId={getPrevNodeId(index)} rightId={node.id} state={state} />
                          <RoleCard 
                            name={node.name}
                            role={node.role}
                            inventory={node.inventory}
                            backlog={node.backlog}
                            lastOrder={node.lastOutgoingOrder}
                            lastShipment={node.lastOutgoingShipment}
                            lastReceived={node.lastIncomingShipment}
                            totalProduced={node.totalProduced}
                            incomingOrder={node.lastIncomingOrder}
                            userOrder={state.userOrders[node.id]}
                            leadTime={state.config.baseLeadTime}
                            onOrderChange={(val) => setState(prev => ({
                              ...prev,
                              userOrders: { ...prev.userOrders, [node.id]: val }
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Manufacturing Visual - Moved up as the main board */}
                  <ManufacturingScene state={state} />

                  {/* Operational Modules - Stacked full-width */}
                  <div className="flex flex-col gap-6 w-full">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <BlackSwanDashboard state={state} onTrigger={(newState) => setState(newState)} />
                    </div>
                    <TransitStatus state={state} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'data' && (
            <motion.div
              key="data"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OrderChart data={chartData} />
                <InventoryChart data={chartData} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <AmplificationChart data={chartData} />
                </div>
                <div className="lg:col-span-2">
                  <AIInsight history={chartData} tick={state.tick} activeEvents={state.activeEvents} />
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'scenarios' && (
            <motion.div
              key="scenarios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ExperimentalScenarios />
            </motion.div>
          )}

          {activeView === 'theory' && (
            <motion.div
              key="theory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-2">
                <KnowledgeBase />
              </div>
              <div className="lg:col-span-1">
                <FormulaModule config={state.config} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Floating Diagnostic */}
        <AutoDiagnostic state={state} />

        {/* Level Intro Modal */}
        <AnimatePresence>
          {showLevelIntro && currentLevel === 1 && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200"
              >
                <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                    <Rocket className="w-40 h-40" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="w-6 h-6 text-blue-400" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">引导关卡 (Level 01)</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tighter mb-2">延迟的深渊 / The Abyss</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      欢迎来到供应链实验室。在这一关，我们将向你揭示供应链波动的“物理杀手”——极大的物流延迟。
                    </p>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div className="flex gap-4">
                    <div className="bg-red-50 p-3 rounded-2xl h-fit">
                      <Rocket className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">关卡强制约束 (Constraints)</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        本关物流延迟强制设为 <span className="font-black text-slate-900">4 周期</span>。这意味着你发出的货物需要 4 周才能到达下游。
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-blue-50 p-3 rounded-2xl h-fit">
                      <Play className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">学习目标 (Goal)</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        由于延迟极大，你将在前几周完全看不到补货回馈。你会陷入“盲目补货”的陷阱：因为没看到库存增加而疯狂下单，最终导致库存爆炸。
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowLevelIntro(false)}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-slate-200"
                  >
                    接受挑战
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Global Footer Stats - Always Visible or Persistent */}
        <footer className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
          <div className="text-center border-r border-slate-100 last:border-0 px-4">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">系统步次 (Tick)</div>
            <div className="text-3xl font-black text-slate-900 tracking-tighter">{state.tick}</div>
          </div>
          <div className="text-center border-r border-slate-100 last:border-0 px-4">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">全局库存</div>
            <div className="text-3xl font-black text-emerald-600 tracking-tighter">
              {state.nodes.reduce((acc, n) => acc + n.inventory, 0)}
            </div>
          </div>
          <div className="text-center border-r border-slate-100 last:border-0 px-4">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">待满足订单</div>
            <div className="text-3xl font-black text-red-500 tracking-tighter">
              {state.nodes.reduce((acc, n) => acc + n.backlog, 0)}
            </div>
          </div>
          <div className="text-center px-4">
             <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">波峰放大倍数</div>
             <div className="text-3xl font-black text-purple-600 tracking-tighter">
               {state.tick > 5 ? (
                 (state.nodes[3].lastOutgoingOrder / (state.nodes[0].lastIncomingOrder || 1)).toFixed(1) + 'x'
               ) : '-'}
             </div>
          </div>
        </footer>
      </main>
    </div>
  );
}


