import { SimulationState } from '@/lib/simulation';
import { Truck, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface LinkStatusProps {
  leftId: string;
  rightId: string;
  state: SimulationState;
}

export function LinkStatus({ leftId, rightId, state }: LinkStatusProps) {
  const { transit, tick } = state;

  // Helper to get transit items
  const getTransitItems = (key: string) => {
    const items = transit[key] || [];
    return items.filter(i => i.arrivalTick > tick);
  };

  // 1. Order Flow (Left -> Right - Upstream)
  // Key format: "leftId-rightId-order"
  let orderData: { amount: number; arrival: string }[] = [];
  if (leftId === 'customer') {
    orderData = [{ amount: state.customerDemand, arrival: '即时' }];
  } else {
    const key = `${leftId}-${rightId}-order`;
    const items = getTransitItems(key);
    orderData = items.map(i => ({
      amount: i.amount,
      arrival: `T+${i.arrivalTick - tick}`
    }));
  }

  // 2. Shipment Flow (Right -> Left - Downstream)
  // Key format: "rightId-leftId"
  let shipmentData: { amount: number; arrival: string }[] = [];
  if (leftId === 'customer') {
    const retailer = state.nodes.find(n => n.id === 'retailer');
    if (retailer && retailer.lastOutgoingShipment > 0) {
      shipmentData = [{ amount: retailer.lastOutgoingShipment, arrival: '即时' }];
    }
  } else {
    const key = `${rightId}-${leftId}`;
    const items = getTransitItems(key);
    shipmentData = items.map(i => ({
      amount: i.amount,
      arrival: `T+${i.arrivalTick - tick}`
    }));
  }

  const totalOrder = orderData.reduce((sum, i) => sum + i.amount, 0);
  const totalShipment = shipmentData.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="flex flex-col justify-center items-center w-14 md:w-20 h-full gap-8 px-0.5 select-none shrink-0 border-x border-slate-100/50 bg-slate-50/30">
      
      {/* Order Flow (Top, Left -> Right) */}
      <div className="w-full relative h-6 group">
        <div className="absolute -top-3 left-0 right-0 text-center">
          <span className="text-[7px] font-black uppercase tracking-tighter text-blue-400 group-hover:text-blue-500 transition-colors">Order 订单</span>
        </div>
        
        {/* Line and Arrow */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-100 border-t border-blue-300 border-dashed opacity-60" />
        <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-blue-400" />
        
        {/* Animated Order Icon moving Left -> Right if active */}
        {totalOrder > 0 && (
          <motion.div 
            animate={{ x: [0, 40, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-0"
          >
            <FileText className="w-2 h-2 text-blue-300" />
          </motion.div>
        )}

        {/* Badge (Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            initial={false}
            animate={{ 
              scale: totalOrder > 0 ? 1 : 0.8, 
              opacity: totalOrder > 0 ? 1 : 0.4,
              backgroundColor: totalOrder > 0 ? '#eff6ff' : '#ffffff'
            }}
            className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold z-10 whitespace-nowrap border transition-all duration-300 shadow-sm",
              totalOrder > 0 ? 'text-blue-600 border-blue-200' : 'text-slate-300 border-slate-100'
            )}
          >
            <FileText className={cn("w-2.5 h-2.5", totalOrder > 0 && "animate-pulse")} />
            <span>{totalOrder}</span>
          </motion.div>
          
          {/* Tooltip */}
          {orderData.length > 0 && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30">
              <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[9px] rounded-lg py-1.5 px-2.5 shadow-xl border border-blue-500/30 whitespace-nowrap ring-4 ring-blue-500/5">
                <div className="font-bold text-blue-300 border-b border-blue-500/30 mb-1 pb-0.5">待处理订单</div>
                {orderData.map((d, i) => (
                  <div key={`order-item-${i}`} className="flex justify-between gap-4">
                    <span>数量: <span className="text-blue-300">{d.amount}</span></span>
                    <span className="text-slate-400">{d.arrival}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shipment Flow (Bottom, Right -> Left) */}
      <div className="w-full relative h-6 group">
        <div className="absolute -bottom-3 left-0 right-0 text-center">
          <span className="text-[7px] font-black uppercase tracking-tighter text-emerald-400 group-hover:text-emerald-500 transition-colors">Shipment 货物</span>
        </div>

        {/* Line and Arrow */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-100 opacity-60" />
        <ArrowLeft className="absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-emerald-400" />
        
        {/* Animated Shipment Icon moving Right -> Left if active */}
        {totalShipment > 0 && (
          <motion.div 
            animate={{ x: [40, 0, 40], opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-0"
          >
            <Truck className="w-2 h-2 text-emerald-300" />
          </motion.div>
        )}

        {/* Badge (Center) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div 
            initial={false}
            animate={{ 
              scale: totalShipment > 0 ? 1 : 0.8, 
              opacity: totalShipment > 0 ? 1 : 0.4,
              backgroundColor: totalShipment > 0 ? '#ecfdf5' : '#ffffff'
            }}
            className={cn(
              "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold z-10 whitespace-nowrap border transition-all duration-300 shadow-sm",
              totalShipment > 0 ? 'text-emerald-600 border-emerald-200' : 'text-slate-300 border-slate-100'
            )}
          >
            <Truck className={cn("w-2.5 h-2.5", totalShipment > 0 && "animate-bounce")} />
            <span>{totalShipment}</span>
          </motion.div>

          {/* Tooltip */}
          {shipmentData.length > 0 && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block z-30">
              <div className="bg-slate-900/95 backdrop-blur-sm text-white text-[9px] rounded-lg py-1.5 px-2.5 shadow-xl border border-emerald-500/30 whitespace-nowrap ring-4 ring-emerald-500/5">
                <div className="font-bold text-emerald-300 border-b border-emerald-500/30 mb-1 pb-0.5">在途货物</div>
                {shipmentData.map((d, i) => (
                  <div key={`ship-item-${i}`} className="flex justify-between gap-4">
                    <span>数量: <span className="text-emerald-300">{d.amount}</span></span>
                    <span className="text-slate-400">{d.arrival}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
