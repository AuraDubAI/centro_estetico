import { useEffect, useState, useMemo } from 'react';
import { SortingState } from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableHome, exportTableToCSV, mapCampaignsToAdsetRows } from '@/components/HomePage/table';
import { Layout } from '@/components/Layout';
import { formatCur, formatPct, formatInt, formatNum2 } from '@/utils/formats';
import { Campaign } from '@/types/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import dayjs from 'dayjs';
import { BIInsights } from '@/components/HomePage/BIInsights';
import { PerformanceChart } from '@/components/HomePage/PerformanceChart';

export const Home = () => {
  const [currentData, setCurrentData] = useState<Campaign[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<'ALL' | 'CEA' | 'MEDTECH'>('ALL');
  const [spendingYesterday, setSpendingYesterday] = useState(false);

  const handleCampaignClick = (name: string) => {
    setSearchName(name);
    setTimeout(() => {
      document.getElementById('campaign-table-container')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = import.meta.env.VITE_API_URL;
      const response = await fetch(url);
      const json = await response.json();
      setCurrentData(json[0].data);
    } catch (err) {
      console.error('API Error!', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const KPICard = ({ title, value, prevValue, type = 'curr' }: any) => {
    const diff = prevValue > 0 ? ((value - prevValue) / prevValue) * 100 : 0;
    const isCost = ['COSTO PER LEAD', 'CPC', 'CPM', 'SPESA TOTALE'].includes(title.toUpperCase());
    const isPositive = diff > 0;
    const color =
      diff === 0
        ? 'text-slate-400'
        : isCost
          ? isPositive
            ? 'text-red-500'
            : 'text-emerald-500'
          : isPositive
            ? 'text-emerald-500'
            : 'text-red-500';

    const displayVal =
      type === 'curr'
        ? `€${formatCur(value)}`
        : type === 'pct'
          ? formatPct(value)
          : type === 'int'
            ? formatInt(value)
            : formatNum2(value);

    return (
      <Card className="rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 bg-white">
        <CardHeader className="flex items-start justify-between pb-1 px-5 pt-5">
          <CardTitle className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div className="text-3xl font-extrabold text-slate-800 mt-2 tracking-tight">{displayVal}</div>
          <div className={`text-xs font-bold ${color} flex items-center mt-3 bg-slate-50 w-fit px-2.5 py-1.5 rounded-full border border-slate-100`}>
            {diff > 0 ? '+' : ''}
            {formatNum2(diff)}%
            <span className="ml-1 text-[10px] text-slate-400 font-semibold">
              vs periodo
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ControlPanel = (
    <div className="bg-white rounded-[2rem] p-5 shadow-sm border border-slate-100 mb-8 flex flex-wrap gap-6 items-end justify-between transition-all hover:shadow-md">
      <div className="flex flex-wrap gap-6 items-end">
        <div className="flex flex-col relative">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase mb-2 pl-2 tracking-wider">
            Data Inizio
          </label>
          <div className="relative">
            <input
              type="date"
              className="border border-slate-100 bg-slate-50 p-3 rounded-2xl text-sm min-w-[150px] focus:ring-2 focus:ring-blue-100 outline-none pr-10 font-semibold text-slate-700 transition-all hover:bg-slate-100"
              value={selectedStartDate}
              onChange={(e) => setSelectedStartDate(e.target.value)}
            />
            {selectedStartDate && (
              <button
                onClick={() => setSelectedStartDate('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-white rounded-full p-1 shadow-sm"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col relative">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase mb-2 pl-2 tracking-wider">
            Data Fine
          </label>
          <div className="relative">
            <input
              type="date"
              className="border border-slate-100 bg-slate-50 p-3 rounded-2xl text-sm min-w-[150px] focus:ring-2 focus:ring-blue-100 outline-none pr-10 font-semibold text-slate-700 transition-all hover:bg-slate-100"
              value={selectedEndDate}
              onChange={(e) => setSelectedEndDate(e.target.value)}
            />
            {selectedEndDate && (
              <button
                onClick={() => setSelectedEndDate('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-white rounded-full p-1 shadow-sm"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase mb-2 pl-2 tracking-wider">Verticale</label>
          <div className="flex rounded-2xl bg-slate-50 p-1 border border-slate-100">
            {(['ALL', 'CEA', 'MEDTECH'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setSelectedVertical(v)}
                className={`px-6 py-2.5 text-xs font-bold transition-all rounded-xl ${
                  selectedVertical === v
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-100/50'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {v === 'ALL' ? 'Tutti' : v === 'CEA' ? 'CEA' : 'Med & Tech'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase mb-2 pl-2 tracking-wider">Filtro Rapido</label>
          <button
            onClick={() => setSpendingYesterday(!spendingYesterday)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
              spendingYesterday
                ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-100'
                : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${
              spendingYesterday ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
            }`} />
            Spending Yesterday
          </button>
        </div>
      </div>
      
      <div>
         <button
            onClick={() => exportTableToCSV(
              mapCampaignsToAdsetRows(currentFiltered),
              `campagne_${new Date().toISOString().split('T')[0]}.csv`
            )}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Esporta CSV
          </button>
      </div>
    </div>
  );

  const filterDataByDate = (
    data: Campaign[],
    startDate: string,
    endDate: string,
    searchName: string,
    selectedVertical: 'ALL' | 'CEA' | 'MEDTECH',
    spendingYesterday: boolean
  ) => {
    const search = searchName.toLowerCase();

    return data
      .map((campaign) => {
        const verticalMatch =
          selectedVertical === 'ALL' ||
          (selectedVertical === 'MEDTECH' && campaign.account_name === 'Med & Tech') ||
          (selectedVertical === 'CEA' && campaign.account_name !== 'Med & Tech');

        if (!verticalMatch) return { ...campaign, adsets: [] };

        const filteredAdsets = (campaign.adsets || [])
          .map((adset) => {
            const filteredInsights = (adset.insights || [])
              .filter((insight) => {
                const date = dayjs(insight.date_start).format('YYYY-MM-DD');

                const afterStart = startDate ? date >= startDate : true;
                const beforeEnd = endDate ? date <= endDate : true;

                const yesterdayStr = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
                const passesSpendingYesterday = spendingYesterday
                  ? date === yesterdayStr && parseFloat(insight.spend || '0') > 0
                  : true;

                return afterStart && beforeEnd && passesSpendingYesterday;
              })
              .sort(
                (a, b) =>
                  new Date(a.date_start).getTime() -
                  new Date(b.date_start).getTime(),
              );

            return { ...adset, insights: filteredInsights };
          })
          .filter((a) => a.insights.length > 0);

        let campaignMatch = false;
        if (search === '#sprechi#') {
          let cSpend = 0;
          let cLeads = 0;
          filteredAdsets.forEach(a => {
            a.insights.forEach(i => {
              cSpend += parseFloat(i.spend || '0');
              cLeads += Number(i.leads || 0);
            });
          });
          campaignMatch = cLeads === 0 && cSpend > 15;
        } else {
          campaignMatch =
            !search ||
            campaign.name?.toLowerCase().includes(search) ||
            campaign.account_name?.toLowerCase().includes(search);
        }

        if (!campaignMatch) {
          return { ...campaign, adsets: [] };
        }

        return { ...campaign, adsets: filteredAdsets };
      })
      .filter((c) => c.adsets.length > 0);
  };

  const currentFiltered = useMemo(() => {
    return filterDataByDate(
      currentData,
      selectedStartDate,
      selectedEndDate,
      searchName,
      selectedVertical,
      spendingYesterday
    );
  }, [currentData, selectedStartDate, selectedEndDate, searchName, selectedVertical, spendingYesterday]);

  const comparisonFiltered = useMemo(() => {
    return filterDataByDate(
      currentData,
      selectedStartDate,
      selectedEndDate,
      searchName,
      selectedVertical,
      spendingYesterday
    );
  }, [currentData, selectedStartDate, selectedEndDate, searchName, selectedVertical, spendingYesterday]);

  const calculateKPIs = (data: Campaign[]) => {
    let totalSpend = 0;
    let totalLeads = 0;
    let totalImpressions = 0;
    let totalClicks = 0;

    data.forEach((campaign) => {
      (campaign.adsets || []).forEach((adset) => {
        (adset.insights || []).forEach((insight) => {
          const spend = parseFloat(insight.spend || '0');
          const leads = Number(insight.leads || 0);
          const impressions = Number(insight.impressions || 0);
          const clicks = Number(insight.clicks || 0);

          totalSpend += spend;
          totalLeads += leads;
          totalImpressions += impressions;
          totalClicks += clicks;
        });
      });
    });

    const CTR =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const CPC = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const CPM =
      totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;
    const convRate = totalClicks > 0 ? (totalLeads / totalClicks) * 100 : 0;
    const CPL = totalLeads > 0 ? totalSpend / totalLeads : 0;

    return {
      spend: totalSpend,
      leads: totalLeads,
      cpl: CPL,
      ctr: CTR,
      cpm: CPM,
      cpc: CPC,
      clicks: totalClicks,
      convRate,
    };
  };

  const currentKPIs = useMemo(
    () => calculateKPIs(currentFiltered),
    [currentFiltered],
  );
  const comparisonKPIs = useMemo(
    () => calculateKPIs(comparisonFiltered),
    [comparisonFiltered],
  );

  return (
    <Layout
      title="Performance Campagne"
      subtitle="Analisi dettagliata di traffico, costi e conversioni."
      lastUpdate={new Date().toLocaleDateString()}
    >
      {ControlPanel}

      {/* Performance Chart */}
      <PerformanceChart data={currentFiltered} />

      {/* BI Insights Banner (Cliccabili) */}
      <BIInsights data={currentFiltered} onCampaignClick={handleCampaignClick} />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8 mt-8">
        <KPICard
          title="SPESA TOTALE"
          value={currentKPIs.spend}
          prevValue={comparisonKPIs.spend}
          type="curr"
        />

        <KPICard
          title="LEADS GENERATI"
          value={currentKPIs.leads}
          prevValue={comparisonKPIs.leads}
          type="int"
        />

        <KPICard
          title="COSTO PER LEAD"
          value={currentKPIs.cpl}
          prevValue={comparisonKPIs.cpl}
          type="curr"
        />

        <KPICard
          title="CLICK THRU RATE"
          value={currentKPIs.ctr}
          prevValue={comparisonKPIs.ctr}
          type="pct"
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-6 p-4 border border-slate-100 rounded-3xl bg-white shadow-sm items-end transition-all hover:shadow-md">
        <div className="flex flex-col gap-2 w-full">
          <Label className="pl-2 font-bold text-slate-500 uppercase tracking-wider text-[10px]">Cerca nella tabella</Label>

          <div className="relative">
            <Input
              placeholder="Cerca per nome campagna, frontend, cliente..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pr-10 rounded-2xl bg-slate-50 border-slate-100 py-6 font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
            />

            {searchName && (
              <button
                onClick={() => setSearchName('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 bg-white shadow-sm rounded-full p-1 border border-slate-100"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div id="campaign-table-container" className="animate-in fade-in duration-1000">
        {loading ? (
          <div className="p-32 text-center flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
            <span className="font-semibold tracking-wide">Caricamento dati in corso...</span>
          </div>
        ) : (
          <TableHome
            data={currentFiltered}
            sorting={sorting}
            setSorting={setSorting}
          />
        )}
      </div>
    </Layout>
  );
};
