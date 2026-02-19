'use client';

<<<<<<< HEAD
import { useEffect, useState } from 'react';
import imgLogo from '../assets/logo.jpeg';
=======
import { useEffect, useState, useMemo } from 'react';
>>>>>>> a7a628a (UI update)
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
<<<<<<< HEAD
} from '@/components/ui/table';

// ===== Interface de Campaign =====
interface Campaign {
  campaign_id: string;
  ad_account_id: string;
  Nome: string;
  ad_account_name: string;
  spend: number | string;
  leads_generated: number;
  cpl: number | string;
  ctr: number | string;
  cpm: number | string;
  conversion_rate: number | string;
  frequency: number | string;
  date_start: string;
}

export const Home = () => {
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState<string>('');

  const getAllCampaigns = async () => {
    try {
      const url =
        'https://alfredodegrandis.app.n8n.cloud/webhook/563e4ce7-1d91-4f7a-8485-eee0b0553e94';
      const response = await fetch(url);
      const json = await response.json();
      setAllCampaigns(json.data || []);
    } catch (err) {
      console.error('Erro ao buscar campanhas:', err);
=======
  TableFooter,
} from '@/components/ui/table';
import { MultiSelectFilter } from '@/components/ui/multi-select-filter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Layout } from '@/components/Layout';

interface Campaign {
  row_number: number;
  Campain_ID: string;
  ad_account_id: string;
  name: string; // Updated from Nome to name to match API
  ad_account_name: string;
  spend: number;
  leads_generated: number;
  cpl: number;
  ctr: number;
  cpm: number;
  conversion_rate: number;
  impressions: string | number;
  clicks: string | number;
  frequency: number;
  date_start: string;
  date_stop: string;
  cpc?: number;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

export const Home = () => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [comparisonDate, setComparisonDate] = useState<string>('');
  const [currentData, setCurrentData] = useState<Campaign[]>([]);
  const [comparisonData, setComparisonData] = useState<Campaign[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [selectedFrontends, setSelectedFrontends] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Helper to safely parse JSON
  const safeParse = (str: string | null) => {
    if (!str) return null;
    try { return JSON.parse(str); } catch (e) { return null; }
  };

  useEffect(() => {
    const fetchData = async () => {
      const today = getTodayString();
      let newData: Campaign[] = [];

      // 1. CHECK SESSION STORAGE FIRST
      const sessionCache = sessionStorage.getItem('dashboard_data_cache');

      if (sessionCache) {
        newData = safeParse(sessionCache) || [];
      } else {
        // 2. FETCH FROM API
        setLoading(true);
        try {
          const url = import.meta.env.VITE_API_URL || 'https://alfredodegrandis.app.n8n.cloud/webhook/563e4ce7-1d91-4f7a-8485-eee0b0553e94';
          const response = await fetch(url);
          const json = await response.json();

          newData = (json.data || []).map((c: any) => ({
            ...c,
            // Ensure numeric conversions
            spend: Number(c.spend),
                                                       leads_generated: Number(c.leads_generated),
                                                       clicks: Number(c.clicks),
                                                       cpc: Number(c.clicks) > 0 ? Number(c.spend) / Number(c.clicks) : 0,
                                                       // Map 'name' explicitly if needed, though ...c handles it if key is 'name'
                                                       name: c.name
          }));

          sessionStorage.setItem('dashboard_data_cache', JSON.stringify(newData));
          localStorage.setItem(`stats_${today}`, JSON.stringify(newData));
        } catch (err) {
          console.error('API Error, trying local storage cache', err);
          const cached = localStorage.getItem(`stats_${today}`);
          const parsed = safeParse(cached);
          if (parsed) newData = parsed;
        } finally {
          setLoading(false);
        }
      }

      // Cleanup old cache
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('stats_') && key.replace('stats_', '') < oneYearAgoStr) {
          localStorage.removeItem(key);
        }
      });

      const keys = Object.keys(localStorage)
      .filter(k => k.startsWith('stats_'))
      .map(k => k.replace('stats_', ''))
      .sort()
      .reverse();

      setAvailableDates(keys);

      if (keys.length > 1 && !comparisonDate) {
        const prev = keys.find(k => k !== today);
        if (prev) setComparisonDate(prev);
      }

      if (selectedDate === today) {
        setCurrentData(newData);
      } else {
        loadSnapshot(selectedDate, true);
      }

      if (comparisonDate) loadSnapshot(comparisonDate, false);
    };

      fetchData();
  }, []);

  const loadSnapshot = (date: string, isCurrent: boolean) => {
    const dataStr = localStorage.getItem(`stats_${date}`);
    const data = safeParse(dataStr);

    if (data) {
      if (isCurrent) setCurrentData(data);
      else setComparisonData(data);
    } else {
      if (isCurrent) setCurrentData([]);
      else setComparisonData([]);
>>>>>>> a7a628a (UI update)
    }
  };

  useEffect(() => {
<<<<<<< HEAD
    getAllCampaigns();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredCampaigns(
        allCampaigns.filter(
          (campaign) =>
            campaign.Nome.toLowerCase().includes(search.toLowerCase()) ||
            campaign.ad_account_name
              .toLowerCase()
              .includes(search.toLowerCase()),
        ),
      );
    } else {
      setFilteredCampaigns(allCampaigns);
    }
  }, [search, allCampaigns]);

  const formatNumber = (v: any) =>
    v !== null && v !== undefined ? Number(v).toFixed(2) : '0.00';

  const columns: ColumnDef<Campaign>[] = [
    { accessorKey: 'Nome', header: 'Campanha' },
    { accessorKey: 'ad_account_name', header: 'Conta' },
    {
      accessorKey: 'spend',
      header: 'Gasto (€)',
      cell: ({ getValue }) => formatNumber(getValue()),
    },
    { accessorKey: 'leads_generated', header: 'Leads' },
    {
      accessorKey: 'cpl',
      header: 'CPL (€)',
      cell: ({ getValue }) => formatNumber(getValue()),
    },
    {
      accessorKey: 'ctr',
      header: 'CTR (%)',
      cell: ({ getValue }) => formatNumber(getValue()),
    },
    {
      accessorKey: 'cpm',
      header: 'CPM (€)',
      cell: ({ getValue }) => formatNumber(getValue()),
    },
    {
      accessorKey: 'conversion_rate',
      header: 'Taxa de Conversão (%)',
      cell: ({ getValue }) => formatNumber(getValue()),
    },
    {
      accessorKey: 'frequency',
      header: 'Frequência',
      cell: ({ getValue }) => formatNumber(getValue()),
    },
    {
      accessorKey: 'date_start',
      header: 'Data',
      cell: ({ getValue }) => {
        const date = new Date(getValue<string>());
        return date.toLocaleDateString('pt-BR'); // dd/mm/yyyy
      },
    },
  ];

  return (
    <div className="p-5">
      <img
        src={imgLogo}
        alt="Logo"
        width={150}
        height={150}
        className="rounded m-auto mb-4"
      />
      <input
        type="text"
        placeholder="Digite uma conta..."
        className="border rounded p-2 w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable data={filteredCampaigns} columns={columns} />
    </div>
  );
};

// ===== DataTable genérico =====
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border mt-5">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted() as string] ?? null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
=======
    if (selectedDate) loadSnapshot(selectedDate, true);
  }, [selectedDate]);

    useEffect(() => {
      if (comparisonDate) loadSnapshot(comparisonDate, false);
    }, [comparisonDate]);

      const filteredTableData = useMemo(() => {
        return currentData.filter((campaign) => {
          const matchAccount = selectedAccounts.size === 0 || selectedAccounts.has(campaign.ad_account_name);
          // Updated to use campaign.name
          const matchFrontend = selectedFrontends.size === 0 || selectedFrontends.has(campaign.name);
          return matchAccount && matchFrontend;
        });
      }, [currentData, selectedAccounts, selectedFrontends]);

      const calculateTotals = (data: Campaign[]) => {
        const filtered = data.filter((campaign) => {
          const matchAccount = selectedAccounts.size === 0 || selectedAccounts.has(campaign.ad_account_name);
          // Updated to use campaign.name
          const matchFrontend = selectedFrontends.size === 0 || selectedFrontends.has(campaign.name);
          return matchAccount && matchFrontend;
        });

        const spend = filtered.reduce((a, b) => a + (b.spend || 0), 0);
        const leads = filtered.reduce((a, b) => a + (b.leads_generated || 0), 0);
        const clicks = filtered.reduce((a, b) => a + Number(b.clicks || 0), 0);
        const impressions = filtered.reduce((a, b) => a + Number(b.impressions || 0), 0);

        const cpl = leads > 0 ? spend / leads : 0;
        const cpc = clicks > 0 ? spend / clicks : 0;
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;

        const count = filtered.length || 1;
        const conversion = filtered.reduce((a, b) => a + Number(b.conversion_rate || 0), 0) / count;
        const frequency = filtered.reduce((a, b) => a + Number(b.frequency || 0), 0) / count;

        return { spend, leads, clicks, cpl, cpc, ctr, cpm, conversion, frequency };
      };

      const currentStats = useMemo(() => calculateTotals(currentData), [currentData, selectedAccounts, selectedFrontends]);
      const compareStats = useMemo(() => calculateTotals(comparisonData), [comparisonData, selectedAccounts, selectedFrontends]);

      // Updated to use c.name
      const uniqueAccounts = useMemo(() => Array.from(new Set(currentData.map(c => c.ad_account_name || "Unknown"))).sort(), [currentData]);
      const uniqueFrontends = useMemo(() => Array.from(new Set(currentData.map(c => c.name || "Unknown"))).sort(), [currentData]);

      // --- FORMATTERS ---
      const formatNum2 = (v: number) => v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const formatCur = (v: number) => formatNum2(v);
      const formatPct = (v: number) => formatNum2(v) + '%';
      const formatInt = (v: number) => v.toLocaleString('it-IT', { maximumFractionDigits: 0 });

      const columns: ColumnDef<Campaign>[] = [
        // Updated accessorKey to 'name'
        { accessorKey: 'name', header: 'Frontend' },
        { accessorKey: 'ad_account_name', header: 'Account' },
        { accessorKey: 'leads_generated', header: 'Leads', cell: ({ getValue }) => formatInt(Number(getValue() || 0)) },
        // Removed date_start column as requested
        { accessorKey: 'cpc', header: 'CPC (€)', cell: ({ getValue }) => formatCur(Number(getValue() || 0)) },
        { accessorKey: 'clicks', header: 'Click Tot.', cell: ({ getValue }) => formatInt(Number(getValue() || 0)) },
        { accessorKey: 'ctr', header: 'CTR (%)', cell: ({ getValue }) => formatCur(Number(getValue() || 0)) },
        { accessorKey: 'cpm', header: 'CPM (€)', cell: ({ getValue }) => formatCur(Number(getValue() || 0)) },
        { accessorKey: 'spend', header: 'Spend (€)', cell: ({ getValue }) => formatCur(Number(getValue() || 0)) },
        { accessorKey: 'conversion_rate', header: 'Conv. (%)', cell: ({ getValue }) => formatCur(Number(getValue() || 0)) },
        { accessorKey: 'frequency', header: 'Freq.', cell: ({ getValue }) => formatCur(Number(getValue() || 0)) },
      ];

      const table = useReactTable({
        data: filteredTableData,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
                                  getSortedRowModel: getSortedRowModel(),
      });

      const KPICard = ({ title, value, prevValue, type = 'curr' }: any) => {
        let diff = 0;
        if (prevValue > 0) diff = ((value - prevValue) / prevValue) * 100;

        const isCost = ['CPL', 'CPC', 'CPM', 'SPEND'].includes(title);
        const isPositive = diff > 0;
        let color = 'text-gray-500';
        if (diff !== 0) {
          if (isCost) color = isPositive ? 'text-red-600' : 'text-green-600';
          else color = isPositive ? 'text-green-600' : 'text-red-600';
        }

        let displayVal = '';
        if (type === 'curr') displayVal = `€${formatCur(value)}`;
        else if (type === 'pct') displayVal = formatPct(value);
        else if (type === 'int') displayVal = formatInt(value);
        else if (type === 'num') displayVal = formatNum2(value);
        else displayVal = formatNum2(value);

        return (
          <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
          <div className="text-xl md:text-2xl font-bold text-slate-800">{displayVal}</div>
          <div className={`text-xs font-bold ${color} flex items-center mt-1`}>
          {diff > 0 ? '+' : ''}{formatNum2(diff)}%
          <span className="ml-1 text-[10px] text-gray-400 font-normal">vs confronto</span>
          </div>
          </CardContent>
          </Card>
        );
      };

      const FilterControls = (
        <div className="flex gap-3">
        <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">DATA</label>
        <select className="border border-slate-200 p-2 rounded-md text-sm bg-white min-w-[120px] focus:ring-2 focus:ring-blue-100 outline-none" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
        {availableDates.map(d => <option key={d} value={d}>{d}</option>)}
        {availableDates.length === 0 && <option>{getTodayString()}</option>}
        </select>
        </div>
        <div className="flex flex-col">
        <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">CONFRONTO</label>
        <select className="border border-slate-200 p-2 rounded-md text-sm bg-white min-w-[120px] focus:ring-2 focus:ring-blue-100 outline-none" value={comparisonDate} onChange={(e) => setComparisonDate(e.target.value)}>
        <option value="">-- Nessuna --</option>
        {availableDates.filter(d => d !== selectedDate).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        </div>
        </div>
      );

      return (
        <Layout
        title="Performance Campagne"
        subtitle="Analisi dettagliata di traffico, costi e conversioni."
        lastUpdate={new Date().toLocaleDateString()}
        rightActions={FilterControls}
        >
        {/* KPI GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <KPICard title="SPEND" value={currentStats.spend} prevValue={compareStats.spend} type="curr" />
        <KPICard title="LEADS" value={currentStats.leads} prevValue={compareStats.leads} type="int" />
        <KPICard title="CPL" value={currentStats.cpl} prevValue={compareStats.cpl} type="curr" />
        <KPICard title="CTR" value={currentStats.ctr} prevValue={compareStats.ctr} type="pct" />
        <KPICard title="CPM" value={currentStats.cpm} prevValue={compareStats.cpm} type="curr" />
        <KPICard title="Conv. Rate" value={currentStats.conversion} prevValue={compareStats.conversion} type="pct" />
        <KPICard title="Frequency" value={currentStats.frequency} prevValue={compareStats.frequency} type="num" />
        </div>

        {/* FILTERS TOOLBAR */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 border border-slate-100 rounded-xl bg-white shadow-sm items-center">
        <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">Filtra dati:</span>
        <MultiSelectFilter title="Account" options={uniqueAccounts} selectedValues={selectedAccounts} onChange={setSelectedAccounts} />
        <MultiSelectFilter title="Frontend" options={uniqueFrontends} selectedValues={selectedFrontends} onChange={setSelectedFrontends} />
        {(selectedAccounts.size > 0 || selectedFrontends.size > 0) && (
          <button onClick={() => { setSelectedAccounts(new Set()); setSelectedFrontends(new Set()); }} className="text-sm text-red-500 font-medium hover:text-red-700 ml-auto transition-colors">
          Resetta Filtri
          </button>
        )}
        </div>

        {/* MAIN TABLE */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && currentData.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          Caricamento dati in corso...
          </div>
        ) : (
          <Table>
          <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id} className="bg-slate-50/80 border-b h-12">
              {header.isPlaceholder ? null : (
                <div className={header.column.getCanSort() ? 'flex items-center cursor-pointer select-none hover:text-slate-900 font-bold text-xs uppercase tracking-wider text-slate-500' : ''} onClick={header.column.getToggleSortingHandler()}>
                {flexRender(header.column.columnDef.header, header.getContext())}
                {{
                  asc: <ArrowUp className="ml-1 h-3 w-3 text-blue-500" />,
                  desc: <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />,
                }[header.column.getIsSorted() as string] ?? (header.column.getCanSort() ? <ArrowUpDown className="ml-1 h-3 w-3 opacity-20" /> : null)}
                </div>
              )}
              </TableHead>
            ))}
            </TableRow>
          ))}
          </TableHeader>
          <TableBody>
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-blue-50/50 transition-colors border-b border-slate-100">
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-3 text-xs text-slate-700">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
>>>>>>> a7a628a (UI update)
              </TableRow>
            ))
          ) : (
            <TableRow>
<<<<<<< HEAD
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Nenhum resultado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
=======
            <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
            Nessun dato trovato per i filtri selezionati.
            </TableCell>
            </TableRow>
          )}
          </TableBody>
          <TableFooter>
          <TableRow className="bg-slate-100 font-bold hover:bg-slate-100 border-t-2 border-slate-200">
          <TableCell>TOTALE</TableCell>
          <TableCell colSpan={4}></TableCell> {/* Adjusted colspan after removing Data Inizio */}
          <TableCell>{formatInt(filteredTableData.reduce((acc, c) => acc + (Number(c.clicks) || 0), 0))}</TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          <TableCell>€ {formatCur(filteredTableData.reduce((acc, c) => acc + (Number(c.spend) || 0), 0))}</TableCell>
          <TableCell>-</TableCell>
          <TableCell>-</TableCell>
          </TableRow>
          </TableFooter>
          </Table>
        )}
        </div>
        </Layout>
      );
};
>>>>>>> a7a628a (UI update)
