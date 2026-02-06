'use client';

import { useEffect, useState } from 'react';
import imgLogo from '../assets/logo.jpeg';
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
    }
  };

  useEffect(() => {
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
              </TableRow>
            ))
          ) : (
            <TableRow>
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
