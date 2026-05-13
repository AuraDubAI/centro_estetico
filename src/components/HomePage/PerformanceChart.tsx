import { useMemo } from 'react';
import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts';
import { Campaign } from '@/types/api';
import dayjs from 'dayjs';

interface PerformanceChartProps {
  data: Campaign[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    const dailyData: Record<string, { spend: number; leads: number }> = {};
    const todayStr = dayjs().format('YYYY-MM-DD'); // FB non manda i dati di oggi, lo escludiamo

    data.forEach(c => {
      c.adsets?.forEach(a => {
        a.insights?.forEach(i => {
          const dateStr = dayjs(i.date_start).format('YYYY-MM-DD');
          
          // Nascondiamo i dati "parziali" di oggi come richiesto
          if (dateStr >= todayStr) return;

          if (!dailyData[dateStr]) {
            dailyData[dateStr] = { spend: 0, leads: 0 };
          }
          dailyData[dateStr].spend += parseFloat(i.spend || '0');
          dailyData[dateStr].leads += Number(i.leads || 0);
        });
      });
    });

    const sortedDates = Object.keys(dailyData).sort();
    return sortedDates.map(date => ({
      date: dayjs(date).format('DD/MM'),
      fullDate: date,
      spend: Number(dailyData[date].spend.toFixed(2)),
      leads: dailyData[date].leads,
    }));
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8 transition-all hover:shadow-md">
      <div className="mb-6 px-2">
        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Andamento nel Tempo</h3>
        <p className="text-xs font-bold text-slate-400 mt-1">Spesa vs Leads (Dati consolidati fino a ieri)</p>
      </div>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }} 
              dy={10}
            />
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }}
              tickFormatter={(val) => `€${val}`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 700 }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontWeight: 'bold' }}
              labelStyle={{ fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
            />
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="spend" 
              name="Spesa"
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSpend)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
            />
            <Line 
              yAxisId="right" 
              type="monotone" 
              dataKey="leads" 
              name="Leads"
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
