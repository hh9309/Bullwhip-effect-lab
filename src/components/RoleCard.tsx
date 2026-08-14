import { Package, ShoppingCart, Truck, Factory, AlertCircle, TrendingUp, Clock, RefreshCw, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { BASE_LEAD_TIME, FIXED_PRODUCTION_CAPACITY, calculateRecommendedOrder } from '@/lib/simulation';

interface RoleCardProps {
  name: string;
  role: 'Retailer' | 'Wholesaler' | 'Distributor' | 'Manufacturer';
  inventory: number;
  backlog: number;
  lastOrder: number;
  lastShipment: number;
  lastReceived: number;
  totalProduced?: number;
  incomingOrder: number;
  userOrder?: number;
  leadTime?: number;
  onOrderChange?: (val: number | undefined) => void;
  className?: string;
}

const RoleIcon = ({ role }: { role: string }) => {
  switch (role) {
    case 'Retailer': return <ShoppingCart className="w-6 h-6 text-blue-600" />;
    case 'Wholesaler': return <Package className="w-6 h-6 text-purple-600" />;
    case 'Distributor': return <Truck className="w-6 h-6 text-orange-600" />;
    case 'Manufacturer': return <Factory className="w-6 h-6 text-slate-600" />;
    default: return <Package />;
  }
};

export function RoleCard({ 
  name, 
  role, 
  inventory, 
  backlog, 
  lastOrder, 
  lastShipment,
  lastReceived,
  totalProduced,
  incomingOrder,
  userOrder,
  leadTime = BASE_LEAD_TIME,
  onOrderChange,
  className 
}: RoleCardProps) {
  const handleAutoRecommend = () => {
    if (!onOrderChange) return;
    const recommended = calculateRecommendedOrder({ 
      lastIncomingOrder: incomingOrder, 
      inventory, 
      backlog 
    }, leadTime);
    onOrderChange(recommended);
  };

  return (
    <motion.div 
      layout
      className={cn(
        "bg-white rounded-xl shadow-sm border border-slate-200 p-2.5 w-40 md:w-44 flex flex-col gap-2 relative shrink-0 transition-all",
        backlog > 5 && "border-red-300 ring-2 ring-red-100",
        userOrder !== undefined && "border-blue-300 bg-blue-50/20",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <div className="p-1.5 bg-slate-50 rounded-lg">
          <RoleIcon role={role} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1 overflow-hidden">
            <h3 className="font-semibold text-slate-900 text-xs truncate" title={name}>{name}</h3>
            <div 
              className="flex items-center gap-0.5 px-1 py-0.5 bg-slate-100 rounded text-[8px] font-bold text-slate-500 shrink-0 cursor-help"
              title={`物流提前期: ${BASE_LEAD_TIME}T, 信息延迟: 0T`}
            >
              <Clock className="w-2 h-2" />
              <span>{BASE_LEAD_TIME}T</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 truncate">{role}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-sm">
        <div className="bg-emerald-50 p-1.5 rounded-lg cursor-help" title="实时库存 = (初始库存 + 累计到货/产出) - 累计运出量">
          <span className="text-[10px] text-emerald-600 font-medium block leading-tight">库存</span>
          <span className="text-base font-bold text-emerald-700 leading-tight">{inventory}</span>
        </div>
        <div className={cn("p-1.5 rounded-lg cursor-help", backlog > 0 ? "bg-red-50" : "bg-slate-50")} title="欠货数量 = 累计需求 - 累计运出量">
          <span className={cn("text-[10px] font-medium block leading-tight", backlog > 0 ? "text-red-600" : "text-slate-500")}>
            欠货
          </span>
          <span className={cn("text-base font-bold leading-tight", backlog > 0 ? "text-red-700" : "text-slate-700")}>
            {backlog}
          </span>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        {role !== 'Manufacturer' && (
          <>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 flex items-center gap-1 truncate">
                <TrendingUp className="w-3 h-3" /> 上游订货
              </span>
              <span className="font-mono font-medium">{lastOrder}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 flex items-center gap-1 truncate">
                <Package className="w-3 h-3" /> 上游到货
              </span>
              <span className="font-mono font-medium text-emerald-600">+{lastReceived}</span>
            </div>
          </>
        )}
        
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-500 flex items-center gap-1 truncate">
            <Truck className="w-3 h-3" /> 下游发货
          </span>
          <span className="font-mono font-medium">{lastShipment}</span>
        </div>
        {role === 'Manufacturer' && totalProduced !== undefined && (
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 flex items-center gap-1 truncate">
              <Factory className="w-3 h-3" /> 累计产量
            </span>
            <span className="font-mono font-medium text-slate-700">{totalProduced}</span>
          </div>
        )}
        {role === 'Manufacturer' && (
          <div className="flex justify-between items-center text-[10px] bg-slate-50 px-1.5 py-1 rounded border border-slate-100 mt-1">
            <span className="text-slate-500 font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> 固定产能
            </span>
            <span className="font-mono font-black text-slate-900">{FIXED_PRODUCTION_CAPACITY}</span>
          </div>
        )}
         <div className="flex justify-between items-center text-[10px] border-t border-slate-100 pt-1.5 mt-0.5">
          <span className="text-slate-500 truncate">收到订单</span>
          <span className="font-mono font-bold text-blue-600">{incomingOrder}</span>
        </div>

        {role !== 'Manufacturer' && onOrderChange && (
          <div className="pt-2 mt-1 border-t border-slate-50">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
              下期订货
            </label>
            <div className="flex items-center gap-1">
              <input 
                type="number" 
                min="0" 
                max="99"
                value={userOrder ?? lastOrder}
                onChange={(e) => onOrderChange(parseInt(e.target.value) || 0)}
                className={cn(
                  "w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500",
                  userOrder !== undefined && "bg-blue-50 border-blue-200 text-blue-700 font-bold"
                )}
              />
              <div className="flex flex-col gap-0.5">
                <button 
                  onClick={handleAutoRecommend}
                  className="p-1 hover:bg-blue-50 rounded text-slate-400 hover:text-blue-600 transition-colors"
                  title="自动生成建议订单"
                >
                  <Wand2 className="w-3 h-3" />
                </button>
                {userOrder !== undefined && (
                  <button 
                    onClick={() => onOrderChange(undefined)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400"
                    title="重置为自动"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {backlog > 10 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm z-20"
        >
          <AlertCircle className="w-2.5 h-2.5" /> 缺货
        </motion.div>
      )}
    </motion.div>
  );
}
