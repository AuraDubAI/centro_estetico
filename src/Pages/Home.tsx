import { ArrowLeft, Server } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { AdAccountKPIs } from '@/components/campaing';

export const Home = () => {
  const [data, setData] = useState<any[]>([]);
  const [selectAccount, setSelectAccount] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAccounts();
  }, []);

  const getAccounts = async (name?: string) => {
    let url = 'http://localhost:3000/api/ad-accounts';
    if (name) url += `?name=${encodeURIComponent(name)}`;
    const response = await fetch(url);
    const json = await response.json();
    setData(json.data || []);
  };

  const findSelectAccount = async (id: string) => {
    const response = await fetch(`http://localhost:3000/api/ad-accounts/${id}`);
    const json = await response.json();
    setSelectAccount(json.data || []);
    console.log(json.data);
  };

  return (
    <>
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
    </>
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
