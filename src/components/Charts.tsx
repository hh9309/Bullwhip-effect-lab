import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Brush } from 'recharts';

interface ChartProps {
  data: any[];
}

export function OrderChart({ data }: ChartProps) {
  return (
    <div className="h-96 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          订货量波动 (Order Size)
        </div>
        <span className="text-[10px] font-normal text-slate-400">滑动下方滑块进行缩放/平移</span>
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} syncId="sc-simulation">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="tick" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey="retailerOrder" name="零售商" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
            <Line type="monotone" dataKey="wholesalerOrder" name="批发商" stroke="#9333ea" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="distributorOrder" name="分销商" stroke="#ea580c" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="manufacturerOrder" name="生产商" stroke="#475569" strokeWidth={2} dot={false} />
            <Brush 
              dataKey="tick" 
              height={30} 
              stroke="#cbd5e1" 
              fill="#f8fafc"
              travellerWidth={8}
              padding={{ top: 20, bottom: 0, left: 0, right: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function InventoryChart({ data }: ChartProps) {
  return (
    <div className="h-96 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          库存水平 (Inventory Levels)
        </div>
        <span className="text-[10px] font-normal text-slate-400">已同步缩放状态</span>
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} syncId="sc-simulation">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="tick" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px' }}
              formatter={(value: any) => [value, '净库存 (库存-欠货)']}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line type="monotone" dataKey="retailerInv" name="零售商" stroke="#2563eb" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="wholesalerInv" name="批发商" stroke="#9333ea" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="distributorInv" name="分销商" stroke="#ea580c" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="manufacturerInv" name="生产商" stroke="#475569" strokeWidth={2} dot={false} />
            <Line type="step" dataKey={() => 0} stroke="#94a3b8" strokeDasharray="5 5" name="平衡线(0)" dot={false} />
            <Brush 
              dataKey="tick" 
              height={30} 
              stroke="#cbd5e1" 
              fill="#f8fafc"
              travellerWidth={8}
              padding={{ top: 20, bottom: 0, left: 0, right: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function AmplificationChart({ data }: ChartProps) {
  // Calculate standard deviation for the last 20 ticks (or all if less)
  const recentData = data.slice(-20);
  
  const calculateStdDev = (key: string) => {
    if (recentData.length === 0) return 0;
    const values = recentData.map(d => d[key]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  };

  const stats = [
    { name: '零售商', stdDev: calculateStdDev('retailerOrder'), fill: '#2563eb' },
    { name: '批发商', stdDev: calculateStdDev('wholesalerOrder'), fill: '#9333ea' },
    { name: '分销商', stdDev: calculateStdDev('distributorOrder'), fill: '#ea580c' },
    { name: '生产商', stdDev: calculateStdDev('manufacturerOrder'), fill: '#475569' },
  ];

  return (
    <div className="h-80 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
      <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500"></span>
        需求放大倍数 (波动标准差)
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="stdDev" name="订单波动标准差" radius={[4, 4, 0, 0]}>
              {stats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-slate-400 mt-2 text-center">
        柱状图越高，代表该层级的订单波动越剧烈（牛鞭效应越明显）
      </p>
    </div>
  );
}
