import { useState } from 'react';
import { Truck, FileText, ArrowRight, Clock, Box, Factory, ShoppingCart, User, Database, Map as MapIcon } from 'lucide-react';
import { SimulationState, BASE_LEAD_TIME, ORDER_DELAY } from '@/lib/simulation';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface TransitStatusProps {
  state: SimulationState;
}

export function TransitStatus({ state }: TransitStatusProps) {
  const { transit, tick, activeEvents } = state;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Lead times for progress calculation
  const currentLeadTime = activeEvents.some(e => e.type === 'CONGESTION') ? BASE_LEAD_TIME + 3 : BASE_LEAD_TIME;
  const currentProductionDelay = activeEvents.some(e => e.type === 'SHORTAGE') ? BASE_LEAD_TIME * 3 : BASE_LEAD_TIME;

  // Node sequence from Left to Right (Removed 'raw' node to match the main supply chain)
  const nodes = [
    { id: 'customer', name: '终端客户', icon: <User className="w-5 h-5" />, role: 'customer' },
    { id: 'retailer', name: '零售商', icon: <ShoppingCart className="w-5 h-5" />, role: 'Retailer' },
    { id: 'wholesaler', name: '批发商', icon: <Box className="w-5 h-5" />, role: 'Wholesaler' },
    { id: 'distributor', name: '分销商', icon: <Truck className="w-5 h-5" />, role: 'Distributor' },
    { id: 'manufacturer', name: '生产商', icon: <Factory className="w-5 h-5" />, role: 'Manufacturer' }
  ];

  const nodeMap = nodes.reduce((acc, node, index) => {
    acc[node.id] = { ...node, index };
    return acc;
  }, {} as Record<string, any>);

  // Parse transit keys to meaningful objects
  const activeTransits: any[] = [];
  Object.entries(transit).forEach(([key, items]) => {
    const activeItems = items.filter(i => i.arrivalTick > tick);
    if (activeItems.length === 0) return;

    const isOrder = key.endsWith('-order');
    const parts = key.replace('-order', '').split('-');
    const sourceId = parts[0];
    const targetId = parts[1] || '';

    // Only include transits between nodes that exist in our defined sequence
    if (!nodeMap[sourceId] || !nodeMap[targetId]) return;

    activeItems.forEach((item, idx) => {
      const duration = isOrder ? ORDER_DELAY : currentLeadTime;

      const remaining = item.arrivalTick - tick;
      const progress = 1 - (remaining / duration);
      const id = `${key}-${idx}-${item.arrivalTick}`;

      activeTransits.push({
        id,
        amount: item.amount,
        isOrder,
        sourceId,
        targetId,
        progress: Math.max(0.1, Math.min(0.9, progress)),
        remaining,
        originalDuration: duration
      });
    });
  });

  const selectedTransit = activeTransits.find(t => t.id === selectedId);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
            <MapIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-white text-base tracking-tight leading-none mb-1">全球物流实况地图</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Visual Supply Chain Map · Live Tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
           <div className="flex items-center gap-1.5 text-blue-400">
             <div className="w-2 h-2 rounded-full border border-current border-dashed" />
             <span>订单流</span>
           </div>
           <div className="flex items-center gap-1.5 text-emerald-400">
             <div className="w-2 h-2 rounded-full bg-current" />
             <span>货物运输</span>
           </div>
        </div>
      </div>
      
      {/* Visual Logistics Map Area */}
      <div className="p-8 pb-12 bg-slate-50 relative overflow-hidden min-h-[400px]">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none grayscale" 
             style={{ 
               backgroundImage: `url('https://www.transparenttextures.com/patterns/world-map.png')`,
               backgroundSize: '800px auto',
               backgroundPosition: 'center'
             }} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {nodes.slice(0, -1).map((node, i) => {
            const nextNode = nodes[i+1];
            const startX = (i / (nodes.length - 1)) * 90 + 5;
            const endX = ((i + 1) / (nodes.length - 1)) * 90 + 5;
            return (
              <g key={`route-group-${node.id}`}>
                <path 
                  d={`M ${startX}% 180 Q ${(startX + endX)/2}% 80 ${endX}% 180`} 
                  fill="none" stroke="url(#routeGradient)" strokeWidth="4" strokeLinecap="round"
                />
                <path 
                  d={`M ${startX}% 180 Q ${(startX + endX)/2}% 80 ${endX}% 180`} 
                  fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="5,10"
                  className="animate-[dash_20s_linear_infinite]"
                />
              </g>
            );
          })}
        </svg>

        <div className="relative flex justify-between items-center max-w-5xl mx-auto h-72">
          {nodes.map((node) => {
            const nodeState = state.nodes.find(n => n.id === node.id);
            const inv = nodeState?.inventory || 0;
            
            return (
              <div key={node.id} className="relative z-10 flex flex-col items-center">
                {/* 3D Storage View above node */}
                <div className="absolute -top-24 w-12 h-16 perspective-[400px] pointer-events-none hidden md:block">
                  <div className="relative w-full h-full transform-style-3d rotate-x-[15deg] rotate-y-[-10deg]">
                    <div className="absolute inset-0 bg-slate-200/40 border border-slate-300 rounded shadow-inner" />
                    <div className="absolute inset-x-1 bottom-1 flex flex-wrap-reverse gap-0.5">
                      {[...Array(Math.min(9, Math.floor(inv / 10)))].map((_, i) => (
                        <motion.div 
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2.5 h-2.5 bg-blue-500 rounded-sm shadow-[1px_1px_0_rgba(0,0,0,0.2)]"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border-2 transition-colors z-30 bg-white",
                    node.id === 'customer' 
                      ? "border-slate-200 text-slate-400" 
                      : "border-blue-100 text-blue-600 shadow-blue-200/50"
                  )}
                >
                  {node.icon}
                </motion.div>
                <div className="absolute top-16 text-center whitespace-nowrap">
                  <div className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{node.name}</div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{node.role}</div>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <Database className="w-2 h-2 text-blue-400" />
                    <span className="text-[9px] font-mono font-bold text-blue-600">{inv}</span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="absolute inset-x-0 top-0 bottom-0">
            <AnimatePresence>
              {activeTransits.map((item) => {
                const sourceNode = nodeMap[item.sourceId];
                const targetNode = nodeMap[item.targetId];
                if (!sourceNode || !targetNode) return null;

                const sourceX = (sourceNode.index / (nodes.length - 1)) * 90 + 5;
                const targetX = (targetNode.index / (nodes.length - 1)) * 90 + 5;
                const currentX = sourceX + (targetX - sourceX) * item.progress;
                
                // Track following arc path
                const x1 = sourceX;
                const x2 = targetX;
                const xc = (x1 + x2) / 2;
                const y1 = 180; // normalized base Y in SVG space or just relative
                const currentProgress = item.progress;
                
                // Arc formula: height is max at 0.5 progress
                const arcMaxHeight = 100;
                const arcY = Math.sin(currentProgress * Math.PI) * -arcMaxHeight;
                
                const isSelected = selectedId === item.id;

                return (
                  <motion.div
                    key={`transit-item-${item.id}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: 1, 
                      scale: isSelected ? 1.4 : 1,
                      left: `${currentX}%`,
                      top: `calc(180px + ${arcY}px)`,
                      zIndex: isSelected ? 60 : 20
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    style={{ position: 'absolute', transform: 'translateX(-50%) translateY(-100%)' }}
                    onClick={() => setSelectedId(isSelected ? null : item.id)}
                    className="group/vehicle cursor-pointer"
                  >
                    <div className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-xl border shadow-xl backdrop-blur-md transition-all",
                      item.isOrder 
                        ? "bg-blue-600/90 border-blue-400 text-white shadow-blue-500/20" 
                        : "bg-emerald-600/90 border-emerald-400 text-white shadow-emerald-500/20",
                      isSelected && "ring-4 ring-white ring-offset-2 ring-offset-blue-500"
                    )}>
                      {item.isOrder ? (
                        <FileText className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Truck className={cn("w-4 h-4 shadow-sm", sourceX < targetX ? "" : "scale-x-[-1]")} />
                      )}
                      
                      {/* Tooltip */}
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-white text-[9px] px-3 py-2 rounded-xl font-bold shadow-2xl whitespace-nowrap opacity-0 group-hover/vehicle:opacity-100 transition-all z-[100] scale-90 group-hover/vehicle:scale-100 ring-4 ring-black/5 pointer-events-none">
                        <div className="flex items-center gap-2 mb-1 border-b border-white/10 pb-1">
                          <div className={cn("w-2 h-2 rounded-full", item.isOrder ? "bg-blue-400" : "bg-emerald-400")} />
                          <span className={item.isOrder ? "text-blue-300" : "text-emerald-300"}>
                            {item.isOrder ? '采购订单' : '发货物流'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">起始:</span>
                            <span>{nodeMap[item.sourceId]?.name}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">目的:</span>
                            <span>{nodeMap[item.targetId]?.name}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-slate-400">预计到达:</span>
                            <span className="text-amber-400 font-mono">T+{item.remaining}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Selected Inspector Panel */}
        <AnimatePresence>
          {selectedTransit && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-md z-50 px-4"
            >
              <div className="bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-4 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", selectedTransit.isOrder ? "bg-blue-500" : "bg-emerald-500")}>
                      {selectedTransit.isOrder ? <FileText className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-black leading-none">{selectedTransit.isOrder ? '订单深度追踪' : '物流实时监控'}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase tracking-tighter">BATCH ID: {selectedTransit.id.split('-')[0].toUpperCase()}</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelectedId(null); }} className="w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors text-slate-400">
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">发送方</div>
                    <div className="text-xs font-bold text-blue-200">{nodeMap[selectedTransit.sourceId]?.name}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">接收方</div>
                    <div className="text-xs font-bold text-emerald-200">{nodeMap[selectedTransit.targetId]?.name}</div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between mb-4 ring-1 ring-white/10">
                   <div className="text-center">
                     <div className="text-[10px] text-slate-500 font-bold uppercase">数量</div>
                     <div className="text-xl font-black text-white">{selectedTransit.amount}</div>
                   </div>
                   <div className="h-8 w-px bg-white/10" />
                   <div className="text-center">
                     <div className="text-[10px] text-slate-500 font-bold uppercase">剩余周期</div>
                     <div className="text-xl font-black text-amber-400">T+{selectedTransit.remaining}</div>
                   </div>
                   <div className="h-8 w-px bg-white/10" />
                   <div className="text-center">
                     <div className="text-[10px] text-slate-500 font-bold uppercase">进度</div>
                     <div className="text-xl font-black text-white">{Math.round(selectedTransit.progress * 100)}%</div>
                   </div>
                </div>

                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className={cn("h-full", selectedTransit.isOrder ? "bg-blue-400" : "bg-emerald-400")}
                    initial={{ width: 0 }}
                    animate={{ width: `${selectedTransit.progress * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Monitoring List */}
      {activeTransits.length > 0 && (
        <div className="border-t border-slate-100 bg-white">
          <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3 h-3" /> 实时物流追踪清单
            </h4>
            <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
              共 {activeTransits.length} 项在途
            </span>
          </div>
          <div className="p-4 max-h-[240px] overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTransits.sort((a, b) => a.remaining - b.remaining).map((item) => (
                <motion.div 
                  key={`list-item-${item.id}`}
                  onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                  className={cn(
                    "p-3 rounded-xl border flex flex-col gap-2 transition-all cursor-pointer",
                    item.isOrder ? "bg-blue-50/30 border-blue-100" : "bg-emerald-50/30 border-emerald-100",
                    selectedId === item.id ? "ring-2 ring-blue-500 shadow-md bg-white border-transparent" : "hover:shadow-md"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("p-1.5 rounded-lg", item.isOrder ? "bg-blue-100" : "bg-emerald-100")}>
                        {item.isOrder ? <FileText className="w-3 h-3 text-blue-600" /> : <Truck className="w-3 h-3 text-emerald-600" />}
                      </div>
                      <span className="text-[10px] font-black text-slate-700 uppercase leading-none">
                        #{item.id.split('-').slice(-2).join('')}
                      </span>
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md",
                      item.remaining <= 1 ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-slate-100 text-slate-600"
                    )}>
                      T+{item.remaining}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <div className="text-center flex-1">
                      <div className="text-[8px] text-slate-400 font-bold uppercase truncate">{nodeMap[item.sourceId]?.name}</div>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-300 mx-2" />
                    <div className="text-center flex-1">
                      <div className="text-[8px] text-slate-400 font-bold uppercase truncate">{nodeMap[item.targetId]?.name}</div>
                    </div>
                    <div className="ml-2 flex flex-col items-end">
                       <span className="text-base font-black leading-none">{item.amount}</span>
                       <span className="text-[7px] text-slate-400 font-bold uppercase">Units</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-end text-[10px]">
        <div className="text-slate-400 font-medium font-mono uppercase tracking-wider bg-slate-50 px-2 py-1 rounded">当前仿真步长 (Tick): {tick}</div>
      </div>
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
