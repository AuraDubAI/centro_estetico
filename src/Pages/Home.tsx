import { ArrowLeft, Server } from 'lucide-react';
import { Command, CommandInput } from '@/components/ui/command';
import { useEffect, useState } from 'react';
import { AdAccountKPIs } from '@/components/campaing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

('use client');

export const Home = () => {
  const [data, setData] = useState<any[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<any[]>([]);
  const [selectAccount, setSelectAccount] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAccounts();
    getAllCampaigns();
  }, []);

  const getAccounts = async (name?: string) => {
    let url = 'https://fb-kpi-worker.vercel.app/api/ad-accounts';
    if (name) url += `?name=${encodeURIComponent(name)}`;
    const response = await fetch(url);
    const json = await response.json();
    setData(json.data || []);
  };

  const getAllCampaigns = async () => {
    let url = 'https://fb-kpi-worker.vercel.app/api/all-campaigns';
    const response = await fetch(url);
    const json = await response.json();
    setAllCampaigns(json.data || []);
  };

  const findSelectAccount = async (id: string) => {
    const response = await fetch(
      `https://fb-kpi-worker.vercel.app/api/ad-accounts/${id}`,
    );
    const json = await response.json();
    setSelectAccount(json.data || []);
    console.log(json.data);
  };

  // Definição das colunas para a DataTable

  interface Campaign {
    campaign_id: string;
    ad_account_id: string;
    campaign_name: string;
    ad_account_name: string;
    spend: string;
    leads_generated: number;
    cpl: string;
    ctr: string;
    cpm: string;
    conversion_rate: string;
    frequency: string;
    recorded_at: string;
  }

  const columns: ColumnDef<Campaign>[] = [
    {
      accessorKey: 'campaign_name',
      header: 'Campanha',
    },
    {
      accessorKey: 'ad_account_name',
      header: 'Conta',
    },
    {
      accessorKey: 'spend',
      header: 'Gasto (€)',
    },
    {
      accessorKey: 'leads_generated',
      header: 'Leads',
    },
    {
      accessorKey: 'cpl',
      header: 'CPL (€)',
    },
    {
      accessorKey: 'ctr',
      header: 'CTR (%)',
    },
    {
      accessorKey: 'cpm',
      header: 'CPM (€)',
    },
    {
      accessorKey: 'conversion_rate',
      header: 'Taxa de Conversão (%)',
    },
    {
      accessorKey: 'frequency',
      header: 'Frequência',
    },
    {
      accessorKey: 'recorded_at',
      header: 'Data',
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(),
    },
  ];

  return (
    <Tabs defaultValue="search" className="w-full p-10">
      <TabsList>
        <TabsTrigger value="search">Search</TabsTrigger>
        <TabsTrigger value="all_campaigns">All Campaigns</TabsTrigger>
      </TabsList>
      <TabsContent value="search">
        {selectAccount ? (
          <>
            <div
              className="flex row items-center pt-2 cursor-pointer"
              onClick={() => setSelectAccount(null)}
            >
              <ArrowLeft className="mr-2 w-4 h-4 text-blue-600" />
              <span>Voltar</span>
            </div>
            <AdAccountKPIs data={selectAccount} />
          </>
        ) : (
          <CommandDemo
            data={data}
            search={search}
            setSearch={setSearch}
            getAccounts={getAccounts}
            findSelectAccount={findSelectAccount}
          />
        )}
      </TabsContent>
      <TabsContent value="all_campaigns">
        <DataTable data={allCampaigns} columns={columns} />
      </TabsContent>
    </Tabs>
  );
};

interface CommandDemoProps {
  data: any[];
  search: string;
  setSearch: (v: string) => void;
  getAccounts: (name?: string) => void;
  findSelectAccount: (id: string) => void;
}

export function CommandDemo({
  data,
  search,
  setSearch,
  getAccounts,
  findSelectAccount,
}: CommandDemoProps) {
  return (
    <Command className="rounded-[20px] border shadow-md md:max-w-[500px] p-5 m-auto mt-5">
      <CommandInput
        placeholder="Type an account..."
        value={search}
        onValueChange={(v) => {
          setSearch(v);
          getAccounts(v);
        }}
      />
      <div>
        {data.map((a) => (
          <div
            className="flex row items-center pt-2 cursor-pointer"
            key={a.ad_account_id}
            onClick={() => findSelectAccount(a.ad_account_id)}
          >
            <Server className="mr-2 w-4 h-4 text-blue-600" />
            <span>{a.name}</span>
          </div>
        ))}
      </div>
    </Command>
  );
}

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
    getSortedRowModel: getSortedRowModel(), // <-- habilita a ordenação
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()} // <-- toggle sorting
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
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
