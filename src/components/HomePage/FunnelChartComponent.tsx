import { useMemo } from 'react';
import { FunnelChart, Funnel, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { Campaign } from '@/types/api';

interface FunnelChartProps {
  data: Campaign[];
}

export function FunnelChartComponent({ data }: FunnelChartProps) {
  const chartData = useMemo(() => {
    let globalImpressions = 0;
    let globalClicks = 0;
    let globalLeads = 0;

    data.forEach(c => {
      if (c.status !== 'ACTIVE') return;
      c.adsets?.forEach(a => {
        a.insights?.forEach(i => {
          globalImpressions += Number(i.impressions || 0);
          globalClicks += Number(i.clicks || 0);
          globalLeads += Number(i.leads || 0);
        });
      });
    });

    // Calcoliamo i tassi di conversione (Drop-off) per arricchire il grafico
    const ctr = globalImpressions > 0 ? ((globalClicks / globalImpressions) * 100).toFixed(2) + '%' : '0%';
    const cvr = globalClicks > 0 ? ((globalLeads / globalClicks) * 100).toFixed(2) + '%' : '0%';

    return [
      {
        step: '1. Visualizzazioni',
        actualValue: globalImpressions,
        visualValue: 100, // Valore fittizio per disegnare un imbuto perfetto e non far sparire la base
        fill: '#93c5fd', // Blue 300
        dropoff: '100% (Partenza)'
      },
      {
        step: '2. Traffico (Click)',
        actualValue: globalClicks,
        visualValue: 70,
        fill: '#60a5fa', // Blue 400
        dropoff: `${ctr} (CTR)`
      },
      {
        step: '3. Conversioni (Leads)',
        actualValue: globalLeads,
        visualValue: 40,
        fill: '#3b82f6', // Blue 500
        dropoff: `${cvr} (Conv. Rate)`
      }
    ];
  }, [data]);

  if (chartData[0].actualValue === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl border border-slate-100 min-w-[200px] z-50">
          <p className="font-black text-slate-400 text-xs uppercase tracking-wider mb-2">{data.step}</p>
          <p className="text-blue-600 font-black text-2xl">{data.actualValue.toLocaleString()}</p>
          <div className="mt-3 pt-3 border-t border-slate-100">
             <p className="text-xs font-bold text-slate-500">
               Conversione: <span className="text-slate-800">{data.dropoff}</span>
             </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md h-full flex flex-col">
      <div className="mb-6 px-2">
        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Imbuto di Acquisizione</h3>
        <p className="text-xs font-bold text-slate-400 mt-1">Sopravvivenza del traffico dall'impressione al lead.</p>
      </div>
      
      <div className="flex-1 w-full min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            <Funnel
              dataKey="visualValue"
              data={chartData}
              isAnimationActive
            >
              <LabelList position="right" fill="#64748b" stroke="none" dataKey="step" fontWeight="bold" fontSize={12} />
              <LabelList position="center" fill="#ffffff" stroke="none" dataKey="actualValue" fontSize={15} fontWeight="900" formatter={(val: any) => val ? val.toLocaleString() : ''} />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} stroke="#ffffff" strokeWidth={4} />
              ))}
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
