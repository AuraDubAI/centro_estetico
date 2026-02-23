import { Insight } from '@/types/api';

// --- FORMATTERS ---
export const formatNum2 = (v: number) =>
  v.toLocaleString('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
export const formatCur = (v: number) => formatNum2(v);

export const formatPct = (v: number) => formatNum2(v) + '%';

export const formatInt = (v: number) =>
  v.toLocaleString('it-IT', { maximumFractionDigits: 0 });

export const formatDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

export function sumInsights(insights: Insight[]) {
  return insights.reduce(
    (acc, i) => {
      acc.impressions += Number(i.impressions || 0);
      acc.clicks += Number(i.clicks || 0);
      acc.spend += Number(i.spend || 0);
      acc.leads += Number(i.leads || 0);
      return acc;
    },
    { impressions: 0, clicks: 0, spend: 0, leads: 0 },
  );
}

export function calculateMetrics(totals: {
  impressions: number;
  clicks: number;
  spend: number;
  leads: number;
}) {
  const { impressions, clicks, spend, leads } = totals;
  return {
    ctr: impressions ? (clicks / impressions) * 100 : 0,
    cpc: clicks ? spend / clicks : 0,
    cpm: impressions ? (spend / impressions) * 1000 : 0,
    conversion_rate: clicks ? (leads / clicks) * 100 : 0,
  };
}
