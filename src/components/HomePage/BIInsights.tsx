import { Campaign } from '@/types/api';
import { Sparkles, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { useMemo } from 'react';

interface BIInsightsProps {
  data: Campaign[];
  onCampaignClick: (campaignName: string) => void;
}

export function BIInsights({ data, onCampaignClick }: BIInsightsProps) {
  const insights = useMemo<{
    bestCampaign: { name: string, cpl: number, spend: number, leads: number, frontend: string } | null;
    wastingCampaigns: {name: string, spend: number}[];
    hiddenGem: { name: string, cpl: number, spend: number, leads: number, convRate: number } | null;
    fatigueCampaign: { name: string, spend: number, ctr: number, impressions: number } | null;
  }>(() => {
    let bestCampaign: any = null;
    let lowestCpl = Infinity;
    const wastingCampaigns: any[] = [];
    let hiddenGem: any = null;
    let fatigueCampaign: any = null;

    // 1. Calculate Global Metrics
    let globalSpend = 0;
    let globalLeads = 0;
    let globalImpressions = 0;
    let globalClicks = 0;
    let activeCampaignsCount = 0;

    data.forEach(c => {
      if (c.status !== 'ACTIVE') return;

      let cSpend = 0;
      let cLeads = 0;
      let cImpressions = 0;
      let cClicks = 0;

      c.adsets?.forEach(a => {
        a.insights?.forEach(i => {
          cSpend += parseFloat(i.spend || '0');
          cLeads += Number(i.leads || 0);
          cImpressions += Number(i.impressions || 0);
          cClicks += Number(i.clicks || 0);
        });
      });

      if (cSpend > 0) activeCampaignsCount++;

      globalSpend += cSpend;
      globalLeads += cLeads;
      globalImpressions += cImpressions;
      globalClicks += cClicks;
    });

    const averageSpendPerCampaign = activeCampaignsCount > 0 ? globalSpend / activeCampaignsCount : 0;
    const globalConvRate = globalClicks > 0 ? (globalLeads / globalClicks) * 100 : 0;
    const globalCtr = globalImpressions > 0 ? (globalClicks / globalImpressions) * 100 : 0;

    // 2. Find Insights
    data.forEach(c => {
      if (c.status !== 'ACTIVE') return;

      let campaignSpend = 0;
      let campaignLeads = 0;
      let campaignImpressions = 0;
      let campaignClicks = 0;

      c.adsets?.forEach(a => {
        a.insights?.forEach(i => {
          campaignSpend += parseFloat(i.spend || '0');
          campaignLeads += Number(i.leads || 0);
          campaignImpressions += Number(i.impressions || 0);
          campaignClicks += Number(i.clicks || 0);
        });
      });

      if (campaignSpend === 0) return;

      const cpl = campaignLeads > 0 ? campaignSpend / campaignLeads : Infinity;
      const ctr = campaignImpressions > 0 ? (campaignClicks / campaignImpressions) * 100 : 0;
      const convRate = campaignClicks > 0 ? (campaignLeads / campaignClicks) * 100 : 0;

      // Top Performer
      if (campaignLeads > 0 && cpl < lowestCpl) {
        lowestCpl = cpl;
        bestCampaign = { name: c.name, cpl, spend: campaignSpend, leads: campaignLeads, frontend: c.name };
      } 
      
      // Wasting Alert
      if (campaignLeads === 0 && campaignSpend > 15) {
        wastingCampaigns.push({ name: c.name, spend: campaignSpend });
      }

      // Hidden Gem (Scaling Opportunity)
      // High convRate (> 50% better than average), Good CTR, but low spend (< 50% of average)
      if (campaignLeads > 0 && convRate > globalConvRate * 1.5 && ctr >= globalCtr * 0.8 && campaignSpend < averageSpendPerCampaign * 0.5) {
        // If there are multiple, keep the one with the highest conversion rate
        if (!hiddenGem || convRate > hiddenGem.convRate) {
           hiddenGem = { name: c.name, cpl, spend: campaignSpend, leads: campaignLeads, convRate };
        }
      }

      // Ad Fatigue (Saturazione)
      // High impressions (> 2000), very low CTR (< 0.8%), spent some money
      if (campaignImpressions > 2000 && ctr < 0.8 && campaignSpend > 5) {
        if (!fatigueCampaign || campaignImpressions > fatigueCampaign.impressions) {
           fatigueCampaign = { name: c.name, spend: campaignSpend, ctr, impressions: campaignImpressions };
        }
      }
    });

    // Make sure hidden gem and top performer are not the exact same campaign to avoid redundant UI
    if (hiddenGem && bestCampaign && hiddenGem.name === bestCampaign.name) {
       hiddenGem = null;
    }

    return { bestCampaign, wastingCampaigns, hiddenGem, fatigueCampaign };
  }, [data]);

  if (!insights.bestCampaign && insights.wastingCampaigns.length === 0 && !insights.hiddenGem && !insights.fatigueCampaign) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-in slide-in-from-bottom-4 duration-500">
      {insights.bestCampaign && (
        <button 
          onClick={() => onCampaignClick(insights.bestCampaign!.name)}
          className="text-left w-full bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-3xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="bg-blue-100 p-3 rounded-2xl border border-blue-200/50 shadow-inner group-hover:bg-blue-200 transition-colors w-fit">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-blue-900 tracking-tight">Top Performer</h4>
            <p className="text-xs text-blue-800/80 font-medium mt-1 leading-relaxed">
              La campagna <span className="font-bold text-blue-900 underline decoration-blue-300 underline-offset-2">"{insights.bestCampaign.name}"</span> ha generato {insights.bestCampaign.leads} lead a <strong>€{insights.bestCampaign.cpl.toFixed(2)}</strong>. Clicca per filtrare.
            </p>
          </div>
        </button>
      )}

      {insights.hiddenGem && (
        <button 
          onClick={() => onCampaignClick(insights.hiddenGem!.name)}
          className="text-left w-full bg-gradient-to-r from-fuchsia-50/80 to-purple-50/80 border border-fuchsia-100 rounded-3xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="bg-fuchsia-100 p-3 rounded-2xl border border-fuchsia-200/50 shadow-inner group-hover:bg-fuchsia-200 transition-colors w-fit">
            <TrendingUp className="w-5 h-5 text-fuchsia-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-fuchsia-900 tracking-tight">Gemma Nascosta</h4>
            <p className="text-xs text-fuchsia-800/80 font-medium mt-1 leading-relaxed">
              <span className="font-bold text-fuchsia-900 underline decoration-fuchsia-300 underline-offset-2">"{insights.hiddenGem.name}"</span> converte al {insights.hiddenGem.convRate.toFixed(1)}% ma spende solo €{insights.hiddenGem.spend.toFixed(2)}. Valuta lo scale!
            </p>
          </div>
        </button>
      )}

      {insights.fatigueCampaign && (
        <button 
          onClick={() => onCampaignClick(insights.fatigueCampaign!.name)}
          className="text-left w-full bg-gradient-to-r from-amber-50/80 to-yellow-50/80 border border-amber-100 rounded-3xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="bg-amber-100 p-3 rounded-2xl border border-amber-200/50 shadow-inner group-hover:bg-amber-200 transition-colors w-fit">
            <TrendingDown className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-amber-900 tracking-tight">Ad Fatigue</h4>
            <p className="text-xs text-amber-800/80 font-medium mt-1 leading-relaxed">
              <span className="font-bold text-amber-900 underline decoration-amber-300 underline-offset-2">"{insights.fatigueCampaign.name}"</span> CTR crollato a {insights.fatigueCampaign.ctr.toFixed(2)}% dopo {insights.fatigueCampaign.impressions} impr. Rinnova.
            </p>
          </div>
        </button>
      )}

      {insights.wastingCampaigns.length > 0 && (
        <button 
          onClick={() => onCampaignClick('#sprechi#')}
          className="text-left w-full bg-gradient-to-r from-red-50/80 to-rose-50/80 border border-red-100 rounded-3xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:scale-[1.02] hover:-translate-y-1 transition-all cursor-pointer group"
        >
          <div className="bg-red-100 p-3 rounded-2xl border border-red-200/50 shadow-inner group-hover:bg-red-200 transition-colors w-fit">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-red-900 tracking-tight">Attenzione Sprechi</h4>
            <p className="text-xs text-red-800/80 font-medium mt-1 leading-relaxed">
              {insights.wastingCampaigns.length === 1 
                ? <>La campagna <span className="font-bold text-red-900 underline decoration-red-300 underline-offset-2">"{insights.wastingCampaigns[0].name}"</span> ha speso €{insights.wastingCampaigns[0].spend.toFixed(2)} a vuoto.</>
                : <>{insights.wastingCampaigns.length} campagne hanno speso &gt;15€ a vuoto. Clicca per vedere la prima.</>}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
