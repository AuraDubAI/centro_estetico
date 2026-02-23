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
  formatDate,
  formatCur,
  formatInt,
  sumInsights,
  calculateMetrics,
} from '@/utils/formats';
import { CampaignRow } from '@/types/api';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

function getDateRangeFormatted(insights: any[]) {
  if (!insights || insights.length === 0)
    return { start_date: null, end_date: null };

  const dates = insights
    .filter((i) => i.date_start && i.date_end)
    .map((i) => ({ start: new Date(i.date_start), end: new Date(i.date_end) }));

  if (dates.length === 0) return { start_date: null, end_date: null };

  const minDate = new Date(Math.min(...dates.map((d) => d.start.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.end.getTime())));

  return { start_date: formatDate(minDate), end_date: formatDate(maxDate) };
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

function mapCampaignsToAdsetRows(campaigns: any[]) {
  const rows: any[] = [];

  for (const campaign of campaigns) {
    for (const adset of campaign.adsets || []) {
      const insights = adset.insights || [];
      const { start_date, end_date } = getDateRangeFormatted(insights);

      const totals = sumInsights(insights);
      const { ctr, cpc, cpm, conversion_rate } = calculateMetrics(totals);

      rows.push({
        campaign_name: campaign.name,
        ad_account_name: campaign.account_name,
        adset_name: adset.name,
        status: adset.effective_status,
        start_date,
        end_date,
        leads_generated: totals.leads,
        clicks: totals.clicks,
        impressions: totals.impressions,
        spend: totals.spend,
        ctr,
        cpc,
        cpm,
        conversion_rate,
      });
    }
  }

  return rows;
}

const columns: ColumnDef<CampaignRow>[] = [
  {
    accessorKey: 'adset_name',
    header: 'Adset',
    cell: ({ row, getValue }) => {
      const adsetName = getValue() as string;
      const campaignName = row.original.campaign_name;
      const accountName = row.original.ad_account_name;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="cursor-pointer truncate max-w-[350px] text-ellipsis"
              style={{ display: 'inline-block' }}
            >
              {adsetName}
            </div>
          </TooltipTrigger>
          <TooltipContent className="whitespace-pre-line bg-white text-slate-900 rounded-md shadow-md p-2 border border-gray-200 text-sm max-w-xs">
            <div className="font-semibold">Ad Set:</div> {adsetName}
            <div className="font-semibold mt-1">Campaign:</div> {campaignName}
            <div className="font-semibold mt-1">Account:</div> {accountName}
          </TooltipContent>
        </Tooltip>
      );
    },
  },
  { accessorKey: 'start_date', header: 'Start Date' },
  { accessorKey: 'end_date', header: 'End Date' },
  {
    accessorKey: 'leads_generated',
    header: 'Leads',
    cell: ({ getValue }) => formatInt(Number(getValue() || 0)),
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
    accessorKey: 'ctr',
    header: 'CTR (%)',
    cell: ({ getValue }) => formatCur(Number(getValue() || 0)),
  },
  {
    accessorKey: 'cpm',
    header: 'CPM (€)',
    cell: ({ getValue }) => formatCur(Number(getValue() || 0)),
  },
  {
    accessorKey: 'spend',
    header: 'Spend (€)',
    cell: ({ getValue }) => formatCur(Number(getValue() || 0)),
  },
  {
    accessorKey: 'conversion_rate',
    header: 'Conv. (%)',
    cell: ({ getValue }) => formatCur(Number(getValue() || 0)),
  },
];

interface TableHomeProps {
  data: any[];
  sorting: any;
  setSorting: any;
}

export function TableHome({ data, sorting, setSorting }: TableHomeProps) {
  // Memoiza linhas e totais
  const adsetRows = useMemo(() => mapCampaignsToAdsetRows(data), [data]);
  const totals = useMemo(() => getTotals(adsetRows), [adsetRows]);

  // Memoiza colunas
  const memoColumns = useMemo(() => columns, []);

  const table = useReactTable({
    data: adsetRows,
    columns: memoColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto">
      <TooltipProvider>
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
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
              <TableCell>TOTALE</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>{formatInt(totals.totalLeads)}</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>€ {formatInt(totals.totalSpend)}</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TooltipProvider>
    </div>
  );
}
