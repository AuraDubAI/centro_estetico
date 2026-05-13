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

export const Home = () => {
  const [currentData, setCurrentData] = useState<Campaign[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<'ALL' | 'CEA' | 'MEDTECH'>('ALL');
  const [spendingYesterday, setSpendingYesterday] = useState(false);

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
    const isCost = ['CPL', 'CPC', 'CPM', 'SPEND'].includes(title.toUpperCase());
    const isPositive = diff > 0;
    const color =
      diff === 0
        ? 'text-gray-500'
        : isCost
          ? isPositive
            ? 'text-red-600'
            : 'text-green-600'
          : isPositive
            ? 'text-green-600'
            : 'text-red-600';

    const displayVal =
      type === 'curr'
        ? `€${formatCur(value)}`
        : type === 'pct'
          ? formatPct(value)
          : type === 'int'
            ? formatInt(value)
            : formatNum2(value);

    return (
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex items-start justify-between pb-2 px-4">
          <CardTitle className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-wide">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-lg font-bold text-slate-800">{displayVal}</div>
          <div className={`text-xs font-bold ${color} flex items-center mt-1`}>
            {diff > 0 ? '+' : ''}
            {formatNum2(diff)}%
            <span className="ml-1 text-[10px] text-gray-400 font-normal">
              vs confronto
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  const FilterControls = (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col relative">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">
          Data Início
        </label>
        <input
          type="date"
          className="border border-slate-200 p-2 rounded-md text-sm bg-white min-w-[120px] focus:ring-2 focus:ring-blue-100 outline-none pr-8"
          value={selectedStartDate}
          onChange={(e) => setSelectedStartDate(e.target.value)}
        />
        {selectedStartDate && (
          <button
            onClick={() => setSelectedStartDate('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-col relative">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">
          Data Fim
        </label>
        <input
          type="date"
          className="border border-slate-200 p-2 rounded-md text-sm bg-white min-w-[120px] focus:ring-2 focus:ring-blue-100 outline-none pr-8"
          value={selectedEndDate}
          onChange={(e) => setSelectedEndDate(e.target.value)}
        />
        {selectedEndDate && (
          <button
            onClick={() => setSelectedEndDate('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Verticale</label>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          {(['ALL', 'CEA', 'MEDTECH'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVertical(v)}
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                selectedVertical === v
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {v === 'ALL' ? 'Tutti' : v === 'CEA' ? 'CEA' : 'Med & Tech'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Spending</label>
        <button
          onClick={() => setSpendingYesterday(!spendingYesterday)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-xs font-semibold transition-all duration-200 ${
            spendingYesterday
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100'
              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full transition-all ${
            spendingYesterday ? 'bg-white animate-pulse' : 'bg-slate-300'
          }`} />
          Spending Yesterday
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

        // 🔥 filtro SOMENTE no nível campaign
        const campaignMatch =
          !search ||
          campaign.name?.toLowerCase().includes(search) ||
          campaign.account_name?.toLowerCase().includes(search);

        if (!campaignMatch) {
          return { ...campaign, adsets: [] };
        }

        const filteredAdsets = (campaign.adsets || [])
          .map((adset) => {
            const filteredInsights = (adset.insights || [])
              .filter((insight) => {
                const date = new Date(insight.date_start)
                  .toISOString()
                  .split('T')[0];

                const afterStart = startDate ? date >= startDate : true;
                const beforeEnd = endDate ? date <= endDate : true;

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                const insightDate = new Date(insight.date_start).toISOString().split('T')[0];
                const passesSpendingYesterday = spendingYesterday
                  ? insightDate === yesterdayStr && parseFloat(insight.spend || '0') > 0
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

        return { ...campaign, adsets: filteredAdsets };
      })
      .filter((c) => c.adsets.length > 0); // remove campaigns vazias
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
      rightActions={
        <div className="flex items-center gap-4">
          {FilterControls}
          <button
            onClick={() => exportTableToCSV(
              mapCampaignsToAdsetRows(currentFiltered),
              `campagne_${new Date().toISOString().split('T')[0]}.csv`
            )}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Esporta CSV
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <KPICard
          title="SPEND"
          value={currentKPIs.spend}
          prevValue={comparisonKPIs.spend}
          type="curr"
        />

        <KPICard
          title="LEADS"
          value={currentKPIs.leads}
          prevValue={comparisonKPIs.leads}
          type="int"
        />

        <KPICard
          title="CPL"
          value={currentKPIs.cpl}
          prevValue={comparisonKPIs.cpl}
          type="curr"
        />

        <KPICard
          title="CTR"
          value={currentKPIs.ctr}
          prevValue={comparisonKPIs.ctr}
          type="pct"
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-6 p-4 border border-slate-100 rounded-xl bg-white shadow-sm items-end">
        <div className="flex flex-col gap-1 w-full">
          <Label>Nome</Label>

          <div className="relative">
            <Input
              placeholder="Cerca campagna, cliente..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pr-8"
            />

            {searchName && (
              <button
                onClick={() => setSearchName('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            Caricamento dati in corso...
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
