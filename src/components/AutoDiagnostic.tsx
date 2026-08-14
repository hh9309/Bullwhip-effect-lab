import { useState, useEffect } from 'react';
import { SimulationState } from '@/lib/simulation';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, CheckCircle, Zap } from 'lucide-react';

interface DiagnosticAlert {
  id: string;
  type: 'WARNING' | 'INFO' | 'SUCCESS' | 'URGENT';
  message: string;
  subMessage?: string;
}

export function AutoDiagnostic({ state }: { state: SimulationState }) {
  const [alerts, setAlerts] = useState<DiagnosticAlert[]>([]);
  const [hasShownEndAlert, setHasShownEndAlert] = useState(false);

  useEffect(() => {
    const newAlerts: DiagnosticAlert[] = [];

    // 1. Check for Consecutive Backlog at Manufacturer
    const manufacturer = state.nodes.find(n => n.id === 'manufacturer');
    if (manufacturer && manufacturer.history.length >= 3) {
      const recentHistory = manufacturer.history.slice(-3);
      const isConsistentBacklog = recentHistory.every(h => h.backlog > 0);
      
      if (isConsistentBacklog) {
        newAlerts.push({
          id: 'mfg-backlog',
          type: 'URGENT',
          message: '注意：生产商已连续产生订单积压',
          subMessage: '这通常是由于前置反馈延迟或产能响应不足导致的“牛鞭效应”顶端显现。'
        });
      }
    }

    // 2. Check for Bullwhip Amplification
    if (state.tick > 10) {
      const retailerOrder = state.nodes[0].lastIncomingOrder || 1;
      const mfgOrder = state.nodes[3].lastOutgoingOrder;
      if (mfgOrder / retailerOrder > 3) {
        newAlerts.push({
          id: 'bullwhip-spike',
          type: 'WARNING',
          message: '实时警报：检测到严重的牛鞭效应',
          subMessage: `生产商的订货波动已达到终端需求的 ${(mfgOrder / retailerOrder).toFixed(1)} 倍。`
        });
      }
    }

    // 3. Check for Stockout at Retailer
    const retailer = state.nodes[0];
    if (retailer.inventory === 0 && retailer.backlog > 0) {
      newAlerts.push({
        id: 'retailer-stockout',
        type: 'WARNING',
        message: '零售商库存告罄',
        subMessage: '下游服务水平正在下降，这会触发上游的恐慌性订货。'
      });
    }

    // 4. End of simulation detection (arbitrary tick limit for this demo)
    if (state.tick >= 50 && !hasShownEndAlert) {
      newAlerts.push({
        id: 'simulation-end',
        type: 'SUCCESS',
        message: '仿真实验已完成周期目标',
        subMessage: '建议查看上方图表，分析各节点库存波动与订单放大的关联性。'
      });
      setHasShownEndAlert(true);
    } else if (state.tick < 50) {
      setHasShownEndAlert(false);
    }

    setAlerts(newAlerts);
  }, [state.tick, state.nodes]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            layout
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`p-4 rounded-xl shadow-2xl border ${
              alert.type === 'URGENT' ? 'bg-red-600 border-red-500 text-white' :
              alert.type === 'WARNING' ? 'bg-amber-500 border-amber-400 text-white' :
              alert.type === 'SUCCESS' ? 'bg-emerald-600 border-emerald-500 text-white' :
              'bg-blue-600 border-blue-500 text-white'
            }`}
          >
            <div className="flex gap-3">
              <div className="mt-1">
                {alert.type === 'URGENT' && <AlertTriangle className="w-5 h-5" />}
                {alert.type === 'WARNING' && <Zap className="w-5 h-5" />}
                {alert.type === 'SUCCESS' && <CheckCircle className="w-5 h-5" />}
                {alert.type === 'INFO' && <Info className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">{alert.message}</h4>
                {alert.subMessage && (
                  <p className="text-[11px] mt-1 opacity-90 leading-relaxed font-medium">
                    {alert.subMessage}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
