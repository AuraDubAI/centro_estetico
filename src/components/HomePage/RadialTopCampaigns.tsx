import { useMemo } from 'react';
import { RadialBarChart, RadialBar, Tooltip, ResponsiveContainer } from 'recharts';
import { Campaign } from '@/types/api';

interface RadialTopCampaignsProps {
  data: Campaign[];
}

export function RadialTopCampaigns({ data }: RadialTopCampaignsProps) {
  const chartData = useMemo(() => {
    const campaignsMetrics: any[] = [];
    let totalAccountLeads = 0;

    data.forEach(c => {
      if (c.status !== 'ACTIVE') return;

      let cLeads = 0;

      c.adsets?.forEach(a => {
        a.insights?.forEach(i => {
          const leads = Number(i.leads || 0);
          cLeads += leads;
          totalAccountLeads += leads;
        });
      });

      if (cLeads > 0) {
        campaignsMetrics.push({
          name: c.name,
          leads: cLeads,
        });
      }
    });

    // Top 15 campaigns by leads
    const sorted = campaignsMetrics.sort((a, b) => b.leads - a.leads).slice(0, 15);
    
    // Assegna colori gradientati (dal più scuro al più chiaro) per l'effetto wow
    const colors = [
      '#1e1b4b', '#312e81', '#3730a3', '#4338ca', '#4f46e5', 
      '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff',
      '#064e3b', '#065f46', '#047857', '#059669', '#10b981'
    ];

    // RadialBarChart renderizza dal centro (primo elemento) verso l'esterno (ultimo elemento).
    // Vogliamo la Top 1 all'esterno perché è l'anello più grande. Quindi invertiamo l'array.
    return sorted.map((item, index) => ({
      ...item,
      fill: colors[index % colors.length]
    })).reverse(); 
  }, [data]);

  if (chartData.length === 0) return null;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 max-w-[250px] z-50">
          <p className="font-extrabold text-slate-800 text-xs mb-1 line-clamp-2">{data.name}</p>
          <p className="text-indigo-600 font-bold text-lg">{data.leads} Leads</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md h-full flex flex-col">
      <div className="mb-2 px-2">
        <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Top 15 Macchine da Lead</h3>
        <p className="text-xs font-bold text-slate-400 mt-1">Gli anelli concentrici rappresentano i generatori di contatti più forti.</p>
      </div>
      
      <div className="flex-1 w-full min-h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="20%" 
            outerRadius="100%" 
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              background={{ fill: '#f1f5f9' }}
              dataKey="leads"
              cornerRadius={10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
