'use client';

import { useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import {
  formatCur,
  formatInt,
  formatNum2,
  sumInsights,
  calculateMetrics,
  formatDate,
} from '@/utils/formats';
import { CampaignRow } from '@/types/api';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

function getDateRangeFormatted(insights: any[]) {
  if (!insights || insights.length === 0)
    return { start_date: null, end_date: null };

  const timestamps = insights
    .filter((i) => i.date_start && i.date_end)
    .map((i) => ({
      start: dayjs(i.date_start).valueOf(),
      end: dayjs(i.date_end).valueOf(),
    }));

  if (timestamps.length === 0) return { start_date: null, end_date: null };

  const minDate = Math.min(...timestamps.map((d) => d.start));
  const maxDate = Math.max(...timestamps.map((d) => d.end));

  return {
    start_date: minDate,
    end_date: maxDate,
  };
}

interface AdsetRow {
  leads_generated: number;
  spend: number;
  [key: string]: any;
}

function getTotals(rows: AdsetRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.totalLeads += Number(row.leads_generated || 0);
      acc.totalSpend += Number(row.spend || 0);
      return acc;
    },
    { totalLeads: 0, totalSpend: 0 },
  );
}

const SortIcon = ({ column }: { column: any }) => {
  const sorted = column.getIsSorted();
  if (!column.getCanSort()) return null;
  if (sorted === 'asc')
    return <ArrowUp className="ml-1 h-3 w-3 text-blue-500" />;
  if (sorted === 'desc')
    return <ArrowDown className="ml-1 h-3 w-3 text-blue-500" />;
  return <ArrowUpDown className="ml-1 h-3 w-3 opacity-20" />;
};

export function mapCampaignsToAdsetRows(campaigns: any[]) {
  const rows: any[] = [];

  for (const campaign of campaigns) {
    for (const adset of campaign.adsets || []) {
      const insights = adset.insights || [];
      const { start_date } = getDateRangeFormatted(insights);

      const totals = sumInsights(insights);
      const { ctr, cpc, cpm, conversion_rate, cpl } = calculateMetrics(totals);

      // Calculate reach sum and weighted average frequency
      let reach = 0;
      let weightedFreqSum = 0;
      let totalImpressions = 0;

      for (const insight of insights) {
        const imps = Number(insight.impressions || 0);
        const rch = Number(insight.reach || 0);
        const freq = parseFloat(String(insight.frequency || '0'));

        reach += rch;
        weightedFreqSum += imps * freq;
        totalImpressions += imps;
      }

      const frequency = totalImpressions > 0
        ? parseFloat((weightedFreqSum / totalImpressions).toFixed(2))
        : 0;

      rows.push({
        campaign_id: campaign.campain_id,
        campaign_name: campaign.name,
        ad_account_name: campaign.account_name,
        user_id: campaign.account_id || null,
        tipologia: campaign.tipologia || null,
        manager: campaign.manager || null,
        adset_name: adset.name,
        status: adset.effective_status,
        start_date,
        end_date: adset.end_time,
        leads_generated: totals.leads,
        clicks: totals.clicks,
        impressions: totals.impressions,
        spend: totals.spend,
        cpl,
        ctr,
        cpc,
        cpm,
        conversion_rate,
        account_id: campaign.account_id || null,
        target_geo: adset.target_geo || null,
        audience_size: adset.audience_size || null,
        reach,
        frequency,
      });
    }
  }

  return rows;
}

const columns: ColumnDef<CampaignRow>[] = [
  {
    accessorKey: 'ad_account_name',
    header: 'Cliente',
  },
  {
    accessorKey: 'spend',
    header: 'Spend (€)',
    cell: ({ getValue }) => formatCur(Number(getValue() || 0)),
  },
  {
    accessorKey: 'leads_generated',
    header: 'Leads',
    cell: ({ getValue }) => formatInt(Number(getValue() || 0)),
  },
  {
    accessorKey: 'cpl',
    header: 'CPL (€)',
    cell: ({ getValue }) => formatCur(Number(getValue() || 0)),
  },
  {
    accessorKey: 'cpm',
    header: 'CPM (€)',
    cell: ({ getValue }) => formatCur(Number(getValue() || 0)),
  },
  {
    accessorKey: 'ctr',
    header: 'CTR (%)',
    cell: ({ getValue }) => formatCur(Number(getValue() || 0)),
  },
  {
    accessorKey: 'campaign_name',
    header: 'Frontend',
  },
  {
    accessorKey: 'start_date',
    header: 'Start Date',
    cell: ({ getValue }) => {
      const value = getValue<number | null>();

      return value ? dayjs(value).format('DD/MM/YYYY') : '-';
    },
  },
  {
    accessorKey: 'end_date',
    header: 'End Date',
    cell: ({ getValue }) => {
      const value = getValue<number | null>();

      return value ? formatDate(value) : '--';
    },
  },
  {
    accessorKey: 'manager',
    header: 'Manager',
    cell: ({ getValue }) => getValue<string | null>() || '-',
  },
  {
    accessorKey: 'user_id',
    header: 'User ID',
    cell: ({ getValue }) => getValue<string | null>() || '-',
  },
  {
    accessorKey: 'tipologia',
    header: 'Tipologia',
    cell: ({ getValue }) => getValue<string | null>() || '-',
  },
  {
    accessorKey: 'cpc',
    header: 'CPC (€)',
    cell: ({ getValue }) => formatCur(Number(getValue() || 0)),
  },
  {
    accessorKey: 'clicks',
    header: 'Clicks',
    cell: ({ getValue }) => formatInt(Number(getValue() || 0)),
  },
  {
    accessorKey: 'conversion_rate',
    header: 'Conv. (%)',
    cell: ({ getValue }) => formatCur(Number(getValue() || 0)),
  },
  {
    accessorKey: 'account_id',
    header: 'Account ID',
    cell: ({ getValue }) => getValue<string | null>() || '-',
  },
  {
    accessorKey: 'target_geo',
    header: 'Target Geo',
    cell: ({ getValue }) => getValue<string | null>() || '-',
  },
  {
    accessorKey: 'audience_size',
    header: 'Audience Size',
    cell: ({ getValue }) => getValue<string | null>() || '-',
  },
  {
    accessorKey: 'reach',
    header: 'Reach',
    cell: ({ getValue }) => formatInt(Number(getValue() || 0)),
  },
  {
    accessorKey: 'frequency',
    header: 'Frequency',
    cell: ({ getValue }) => formatNum2(Number(getValue() || 0)),
  },
];

interface TableHomeProps {
  data: any[];
  sorting: any;
  setSorting: any;
  onExclude?: (campaignId: string) => void;
}

export function TableHome({ data, sorting, setSorting, onExclude }: TableHomeProps) {
  const adsetRows = useMemo(() => mapCampaignsToAdsetRows(data), [data]);
  const totals = useMemo(() => getTotals(adsetRows), [adsetRows]);
  
  const memoColumns = useMemo<ColumnDef<CampaignRow>[]>(() => [
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => onExclude?.((row.original as any).campaign_id)}
          title="Escludi campagna (nascondi)"
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
        </button>
      )
    },
    ...columns
  ], [onExclude]);

  const table = useReactTable({
    data: adsetRows,
    columns: memoColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto bg-white rounded-3xl shadow-sm border border-slate-100">
      <Table className="table-auto">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="hover:bg-transparent w-full"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="bg-slate-50/80 border-b h-12"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex items-center cursor-pointer"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      <SortIcon column={header.column} />
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
              <TableRow
                key={row.id}
                className="hover:bg-blue-50/50 transition-colors border-b border-slate-100 w-full"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="py-3 text-xs text-slate-700 truncate max-w-[350px]"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-32 text-center text-slate-400"
              >
                Nessun dato trovato per i filtri selezionati.
              </TableCell>
            </TableRow>
          )}
        </TableBody>

        <TableFooter>
          <TableRow className="bg-slate-100 font-bold hover:bg-slate-100 border-t-2 border-slate-200">
            <TableCell></TableCell>
            <TableCell>TOTALE</TableCell>
            <TableCell>€ {formatInt(totals.totalSpend)}</TableCell>
            <TableCell>{formatInt(totals.totalLeads)}</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
            <TableCell>-</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

export function exportTableToCSV(rows: CampaignRow[], filename = 'campagne.csv') {
  const headers = [
    'Frontend', 'Cliente', 'User ID', 'Tipologia', 'Manager',
    'Start Date', 'End Date', 'Leads', 'Spend (€)', 'CPL (€)',
    'CPM (€)', 'CTR (%)', 'CPC (€)', 'Clicks', 'Conv. (%)',
    'Account ID', 'Target Geo', 'Audience Size', 'Reach', 'Frequency'
  ];

  const csvRows = rows.map(row => [
    row.campaign_name,
    row.ad_account_name,
    row.user_id || '',
    row.tipologia || '',
    row.manager || '',
    row.start_date ? new Date(row.start_date).toLocaleDateString('it-IT') : '',
    row.end_date ? new Date(row.end_date).toLocaleDateString('it-IT') : '',
    row.leads_generated,
    row.spend,
    row.cpl,
    row.cpm,
    row.ctr,
    row.cpc,
    row.clicks,
    row.conversion_rate,
    row.account_id || '',
    row.target_geo || '',
    row.audience_size || '',
    row.reach || 0,
    row.frequency || 0,
  ]);

  const csvContent = [headers, ...csvRows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
