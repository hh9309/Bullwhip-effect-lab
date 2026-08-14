import { triggerBlackSwan, SimulationState } from '@/lib/simulation';
import { AlertCircle, Zap, ShieldAlert, TrendingUp, Clock, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BlackSwanDashboardProps {
  state: SimulationState;
  onTrigger: (newState: SimulationState) => void;
}

export function BlackSwanDashboard({ state, onTrigger }: BlackSwanDashboardProps) {
  const trigger = (type: 'SHORTAGE' | 'CONGESTION' | 'SPIKE') => {
    onTrigger(triggerBlackSwan(state, type));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
        <h3 className="font-bold text-slate-800">市场突发状况 (Black Swan Events)</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Shortage */}
        <button
          onClick={() => trigger('SHORTAGE')}
          className="group flex flex-col items-start p-4 bg-white border border-red-100 rounded-xl hover:border-red-500 hover:shadow-md transition-all text-left"
        >
          <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-500 group-hover:text-white transition-colors mb-3">
            <ShieldAlert className="w-5 h-5 text-red-600 group-hover:text-white" />
          </div>
          <h4 className="font-bold text-slate-800 mb-1">原材料断供</h4>
          <p className="text-xs text-slate-500">生产商原材料供应延迟大幅增加 (T+6)</p>
        </button>

        {/* Congestion */}
        <button
          onClick={() => trigger('CONGESTION')}
          className="group flex flex-col items-start p-4 bg-white border border-amber-100 rounded-xl hover:border-amber-500 hover:shadow-md transition-all text-left"
        >
          <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-500 group-hover:text-white transition-colors mb-3">
            <Clock className="w-5 h-5 text-amber-600 group-hover:text-white" />
          </div>
          <h4 className="font-bold text-slate-800 mb-1">物流拥堵</h4>
          <p className="text-xs text-slate-500">全链段运输提前期临时增加 (Lead Time +3)</p>
        </button>

        {/* Spike */}
        <button
          onClick={() => trigger('SPIKE')}
          className="group flex flex-col items-start p-4 bg-white border border-blue-100 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left"
        >
          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600 group-hover:text-white" />
          </div>
          <h4 className="font-bold text-slate-800 mb-1">需求暴增</h4>
          <p className="text-xs text-slate-500">终端客户产生瞬间大批量订单 (Demand 35+)</p>
        </button>
      </div>

      {/* Active Events Display */}
      <AnimatePresence>
        {state.activeEvents && state.activeEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2 pt-2"
          >
            {state.activeEvents.map(event => (
              <motion.div
                layout
                key={event.id}
                className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-full text-xs shadow-lg border border-slate-700"
              >
                <AlertCircle className="w-3 h-3 text-amber-400 animate-pulse" />
                <span className="font-bold">{event.name}</span>
                <span className="text-slate-400 border-l border-slate-700 pl-2 ml-1">
                  持续: {event.remainingTicks} 期
                </span>
                <div className="group relative ml-1">
                   <Info className="w-3 h-3 text-slate-400 cursor-help" />
                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 rounded text-[10px] hidden group-hover:block z-50">
                     {event.description}
                   </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
