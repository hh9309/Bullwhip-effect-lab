import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, Factory, 
  Settings, ShieldCheck, Box, Zap, Globe, Layers,
  Activity, Cpu as ChipIcon, Database, Terminal,
  Lightbulb, CheckCircle2, Search,
  Navigation, Plane, Map as MapIcon
} from 'lucide-react';
import { SimulationState } from '@/lib/simulation';
import { cn } from '@/lib/utils';

const SYSTEM_LOGS = [
  "核心芯片组生产正常",
  "鸿蒙系统自动化部署",
  "卫星通信模块校验完成",
  "精密组装流水线运行中",
  "AI 视觉检测通过",
  "产品自动化包装已准备",
  "全球调度：首批货源发往亚太",
  "系统自检：自动化率达标",
  "绿色工厂能耗平衡中",
  "麒麟芯片 5nm 工艺验证成功"
];

interface ManufacturingSceneProps {
  state: SimulationState;
}

export function ManufacturingScene({ state }: ManufacturingSceneProps) {
  const mfgNode = state.nodes.find(n => n.id === 'manufacturer');
  const [activeStage, setActiveStage] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const inventory = mfgNode?.inventory || 0;
  const lastOutput = mfgNode?.lastOutgoingShipment || 0;
  const backlog = mfgNode?.backlog || 0;
  const incomingOrder = mfgNode?.lastIncomingOrder || 0;

  // Process data synchronization with visual stages
  useEffect(() => {
    if (incomingOrder > 0) {
      setActiveStage(1); // Precision Assembly if orders incoming
    } else if (lastOutput > 0) {
      setActiveStage(3); // Packaging if shipping
    } else {
      setActiveStage(0); // R&D / Standby
    }
  }, [incomingOrder, lastOutput, state.tick]);

  // Synchronize logs with real simulation events
  useEffect(() => {
    if (state.tick === 0) return;
    
    setLogs(prev => {
      const newLogs = [...prev];
      
      if (incomingOrder > 0) {
        newLogs.push(`收到新需求: ${incomingOrder} 单位，流水线保持固定产能输出`);
      }
      
      newLogs.push(`系统状态: 基于固定产能 (20) 持续产出，平滑制造波动`);
      
      if (lastOutput > 0) {
        newLogs.push(`质检完成：流水线交付 ${lastOutput} 单位 Mate 60 Pro+`);
      }

      if (backlog > 0) {
        newLogs.push(`警告：生产线负荷超载，积压订单共 ${backlog} 单位`);
      }

      // Add a random generic log to keep it "alive"
      if (state.tick % 2 === 0) {
        newLogs.push(SYSTEM_LOGS[state.tick % SYSTEM_LOGS.length]);
      }

      return newLogs.slice(-10);
    });
  }, [state.tick, incomingOrder, lastOutput, backlog]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-white pt-8 pb-8 px-8 rounded-2xl shadow-xl overflow-hidden relative border border-slate-100 group transition-all duration-700 hover:border-blue-200/50">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#3b82f6 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-100/40 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-100/40 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ rotate: 180, scale: 1.1 }}
            className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-2 rounded-xl shadow-lg shadow-blue-200/50"
          >
            <Factory className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none mb-1">华为智能制造中心</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100">
                <span className="flex h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] text-emerald-700 font-black uppercase tracking-widest">LIVE DATA SYNC</span>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">松山湖基地 · 状态: {backlog > 0 ? '超负荷' : '正常运行'}</p>
            </div>
          </div>
        </div>
        
        <div id="manufacturing_metric_badges_top" className="flex gap-2">
          <motion.div key={`mfg-inv-${inventory}`} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-50/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white shadow-sm flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-1 rounded-lg"><Database className="w-3 h-3 text-white" /></div>
            <div className="flex flex-col"><span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">成品库存</span><span className="text-sm font-black font-mono text-slate-800 leading-none">{inventory}</span></div>
          </motion.div>
          <motion.div key={`mfg-out-${lastOutput}`} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-50/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white shadow-sm flex items-center gap-2">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-1 rounded-lg shadow-inner"><Zap className="w-3 h-3 text-white fill-white" /></div>
            <div className="flex flex-col"><span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">单期产出 (固定)</span><span className="text-sm font-black font-mono text-slate-800 leading-none">{lastOutput}</span></div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 mt-4">
        {/* Left Section: Supply & R&D (Col 3) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Database className="w-3 h-3 text-blue-500" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">核心供应链</span>
            </div>
            <Activity className="w-2.5 h-2.5 text-blue-400 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <StageNode 
              icon={<ChipIcon className="w-3.5 h-3.5" />} 
              label="麒麟 9000S" 
              status="5nm 晶圆加工" 
              color="blue" 
              active={activeStage === 0}
            />
            <StageNode 
              icon={<Layers className="w-3.5 h-3.5" />} 
              label="鸿蒙系统" 
              status="内核深度部署" 
              color="indigo" 
              active={activeStage === 0}
            />
            <StageNode 
              icon={<Lightbulb className="w-3.5 h-3.5" />} 
              label="研发实验室" 
              status="算法实时优化" 
              color="amber" 
              active={activeStage === 0}
            />
          </div>
        </div>

        {/* Middle Section: Assembly & QC (Col 5) */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
          <div className="relative py-4">
            {/* Conveyor Belt */}
            <div className="absolute left-0 right-0 h-14 bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner overflow-hidden">
              <motion.div id="conveyor_belt_motion" animate={{ x: incomingOrder > 0 || lastOutput > 0 ? [-60, 0] : 0 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} className="w-[200%] h-full flex items-center">
                {[...Array(10)].map((_, i) => (
                  <div key={`belt-seg-${i}`} className="flex-1 flex justify-center">
                    <div className="w-8 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-300/20 shadow-sm" />
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Assembly Process Steps */}
            <div className="flex items-center justify-between px-4 relative z-10">
              <ProcessStep 
                icon={<Settings className="w-5 h-5" />} 
                label="精密组装" 
                active={activeStage === 1}
                color="blue"
                showRobotArm={activeStage === 1}
              />
              <ProcessStep 
                icon={<Search className="w-5 h-5" />} 
                label="全检质控" 
                active={activeStage === 2 || lastOutput > 0}
                color="emerald"
                showBeam={activeStage === 2 || lastOutput > 0}
              />
              <ProcessStep 
                icon={<Box className="w-5 h-5" />} 
                label="自动包装" 
                active={activeStage === 3}
                color="amber"
              />
            </div>
          </div>

          {/* System Log Console */}
          <div className="bg-slate-900 rounded-xl p-3 border border-slate-800 shadow-2xl relative overflow-hidden group/console">
            <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">生产线同步日志 (仿真实时)</span>
              </div>
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-red-500/50" />
                <div className="w-1 h-1 rounded-full bg-amber-500/50" />
                <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
              </div>
            </div>
            <div ref={logContainerRef} className="h-20 overflow-y-auto scrollbar-hide space-y-1">
              <AnimatePresence mode="popLayout">
                {logs.map((log, i) => (
                  <motion.div 
                    key={`log-${state.tick}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 text-[8px] font-medium leading-relaxed"
                  >
                    <span className="text-emerald-500/40 font-mono shrink-0">[{state.tick}T]</span>
                    <span className="text-slate-300 group-hover/console:text-white transition-colors">{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-6 animate-scanline" />
          </div>
        </div>

        {/* Right Section: Logistics & Product (Col 4) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-indigo-500" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">全球交付中心</span>
              </div>
              <Navigation className={cn("w-2.5 h-2.5 text-indigo-400", lastOutput > 0 && "animate-bounce")} />
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 relative group/product">
              <motion.div 
                animate={{ 
                  y: [0, -4, 0],
                  rotateY: [0, 15, 0]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="w-14 h-24 bg-slate-900 rounded-xl shadow-2xl flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-transparent to-white/20" />
                <Smartphone className="w-7 h-7 text-white/90" />
                <div className="absolute bottom-1.5 text-[6px] text-blue-400 font-black tracking-[0.2em]">HUAWEI</div>
                <motion.div 
                  animate={{ y: [-30, 60] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-x-0 h-px bg-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.8)] z-20"
                />
              </motion.div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs font-black text-slate-900 tracking-tight">Mate 60 Pro+</div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">先锋计划 · 累计产出: {(mfgNode?.history.reduce((a,b) => a + (b.order > 0 ? b.order : 0), 0) || 0) + 12480}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 text-[8px] font-black bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 w-fit">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>质检通过率 99.9%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600 text-[8px] font-black bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 w-fit">
                    <Zap className="w-2.5 h-2.5" />
                    <span>欠货积压: {backlog}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logistics Map Visualization */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-3 rounded-2xl shadow-xl shadow-blue-200 relative overflow-hidden group/map">
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 200 100">
                <path d="M20,50 Q60,20 100,50 T180,50" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2,2" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-[8px] font-bold text-blue-100 uppercase tracking-widest mb-0.5">全球物流调度</div>
                  <div className="flex items-center gap-1.5 text-white font-black text-sm tracking-tight">
                    <Plane className={cn("w-3.5 h-3.5", lastOutput > 0 && "animate-pulse")} />
                    <span>{lastOutput > 0 ? '物流发货中' : '航线待机'}</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/20">
                  <MapIcon className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1.5">
                  {[...Array(4)].map((_, i) => (
                    <motion.div 
                      key={`globe-mfg-${i}`}
                      whileHover={{ y: -3, scale: 1.1, zIndex: 10 }}
                      className="w-5 h-5 rounded-full bg-blue-500 border border-blue-700 flex items-center justify-center shadow-lg cursor-pointer"
                    >
                      <Globe className="w-2.5 h-2.5 text-white/90" />
                    </motion.div>
                  ))}
                </div>
                <div className="text-[8px] font-black text-blue-100 bg-blue-700/50 px-1.5 py-0.5 rounded-md">
                  当前发货量: {lastOutput}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Production Metrics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-slate-100 pt-4">
        <Metric label="库存深度 (3D)" value={`${inventory} units`} color="text-amber-600" icon={<Database className="w-3 h-3" />} inventory={inventory} />
        <Metric label="生产效率" value={backlog > 0 ? "85%" : "99.9%"} color={backlog > 0 ? "text-amber-600" : "text-emerald-600"} icon={<ShieldCheck className="w-3 h-3" />} />
        <Metric label="订单处理率" value={incomingOrder > 0 ? `${Math.round((lastOutput/incomingOrder)*100)}%` : "100%"} color="text-blue-600" icon={<Settings className="w-3 h-3" />} />
        <Metric label="AI 调度率" value="98.5%" color="text-indigo-600" icon={<Activity className="w-3 h-3" />} />
      </div>

      <style>{`
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        .animate-scanline {
          animation: scanline 5s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .clip-path-beam {
          clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%);
        }
      `}</style>
    </div>
  );
}

function StageNode({ icon, label, status, color, active }: { icon: React.ReactNode, label: string, status: string, color: string, active: boolean }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <motion.div 
      animate={{ 
        x: active ? 8 : 0, 
        scale: active ? 1.03 : 1,
      }}
      className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-500 ${active ? colorMap[color] + ' shadow-lg shadow-current/5' : 'bg-white text-slate-400 border-slate-100'}`}
    >
      <div className={`p-2 rounded-lg transition-colors ${active ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black leading-tight tracking-tight">{label}</span>
        <span className="text-[8px] opacity-70 font-bold uppercase tracking-widest mt-0.5">{status}</span>
      </div>
    </motion.div>
  );
}

function ProcessStep({ icon, label, active, color, showBeam, showRobotArm }: { icon: React.ReactNode, label: string, active: boolean, color: string, showBeam?: boolean, showRobotArm?: boolean }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200 shadow-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200 shadow-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-200 shadow-amber-100',
  };

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {showRobotArm && (
        <motion.div 
          initial={{ rotate: -20, opacity: 0 }}
          animate={{ rotate: [20, -20, 20], opacity: 1 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-8 text-blue-400 pointer-events-none"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4m0 0l-4 4m4-4l4 4M12 22v-4m0 0l-4-4m4 4l4-4" />
          </svg>
        </motion.div>
      )}
      
      <motion.div 
        animate={{ 
          scale: active ? 1.1 : 1,
          y: active ? -4 : 0
        }}
        className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-500 relative ${active ? colorMap[color] + ' shadow-xl' : 'bg-white text-slate-300 border-slate-100'}`}
      >
        {icon}
        {active && (
          <motion.div 
            className="absolute -inset-1.5 border border-current rounded-xl opacity-20"
            animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        {showBeam && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
            className="absolute top-full left-1/2 -translate-x-1/2 w-12 h-16 bg-gradient-to-b from-emerald-400/50 to-transparent clip-path-beam z-20"
          />
        )}
      </motion.div>
      <span className={`text-[10px] font-black tracking-tight ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
    </div>
  );
}

function Metric({ label, value, color, icon, inventory }: { label: string, value: string, color: string, icon: React.ReactNode, inventory?: number }) {
  return (
    <div className="bg-slate-50/50 p-2 rounded-xl border border-slate-100/50 flex flex-col items-center group/metric hover:bg-white hover:shadow-lg hover:border-blue-100 transition-all duration-500 cursor-default">
      <div className="flex items-center gap-1.5 mb-1">
        <div className="p-1 rounded-md bg-white shadow-sm text-slate-400 group-hover/metric:text-blue-500 transition-all">
          {icon}
        </div>
        <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className={`text-xs font-black font-mono tracking-tight ${color}`}>{value}</span>
      
      {inventory !== undefined && (
        <div className="mt-2 w-full h-8 perspective-[400px] flex justify-center">
          <div className="relative w-full h-full transform-style-3d rotate-x-[20deg] rotate-y-[-10deg]">
            <div className="absolute inset-0 border border-slate-200 rounded-sm bg-slate-100/50" />
            <div className="absolute inset-0 flex flex-wrap gap-0.5 p-0.5 content-end">
              {[...Array(Math.min(15, Math.floor(inventory / 5)))].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, translateZ: -20 }}
                  animate={{ scale: 1, translateZ: 0 }}
                  className="w-1.5 h-1.5 bg-gradient-to-br from-blue-400 to-blue-600 rounded-sm shadow-sm border border-blue-700/20"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
