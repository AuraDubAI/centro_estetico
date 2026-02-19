import { useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layout } from '@/components/Layout';

interface FormItem {
  id: number;
  id_forms: string;
  status: string;
  name: string;
  locale: string;
  lead_amount?: number;
  name_page?: string;
  id_page?: string;
  id_campaign?: string | null;
  id_campaing?: string | null;
}

interface CampaignRef {
  Campain_ID: string;
  name: string; // Updated from Nome to name
}

export const FormsPage = () => {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [campaignsMap, setCampaignsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const getCampaignId = (item: FormItem) => {
    return item.id_campaign || item.id_campaing || null;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        let formsData: FormItem[] = [];

        // 1. CHECK SESSION STORAGE FOR FORMS
        const sessionCache = sessionStorage.getItem('forms_data_cache');

        if (sessionCache) {
          formsData = JSON.parse(sessionCache);
        } else {
          // 2. Fetch Forms Data
          const formsUrl = 'https://alfredodegrandis.app.n8n.cloud/webhook/f67ad9f3-14e1-4e66-b98f-4bd74e50cceb';
          const formsRes = await fetch(formsUrl);
          const formsJson = await formsRes.json();
          formsData = Array.isArray(formsJson) ? formsJson : (formsJson.data || []);

          // Sort by leads
          formsData.sort((a, b) => (b.lead_amount || 0) - (a.lead_amount || 0));

          sessionStorage.setItem('forms_data_cache', JSON.stringify(formsData));
        }

        setForms(formsData);

        // 3. Load Campaigns safely (Check Dashboard Cache first)
        let campaignList: CampaignRef[] = [];

        // Try getting dashboard cache first (fastest)
        const dashboardCache = sessionStorage.getItem('dashboard_data_cache');

        if (dashboardCache) {
          campaignList = JSON.parse(dashboardCache);
        } else {
          // Fallback to local storage (today)
          const today = new Date().toISOString().split('T')[0];
          const cached = localStorage.getItem(`stats_${today}`);
          if (cached) {
            try { campaignList = JSON.parse(cached); } catch(e) {}
          }
        }

        const map: Record<string, string> = {};
        campaignList.forEach(c => {
          if (c.Campain_ID) {
            // Using c.name now
            map[c.Campain_ID] = c.name;
          }
        });
        setCampaignsMap(map);

      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const activeCount = useMemo(() => forms.filter(f => f.status === 'ACTIVE').length, [forms]);
  const totalLeads = useMemo(() => forms.reduce((acc, curr) => acc + (Number(curr.lead_amount) || 0), 0), [forms]);

  return (
    <Layout
    title="Gestione Moduli"
    subtitle="Monitoraggio lead e stato moduli Facebook."
    lastUpdate={new Date().toLocaleDateString()}
    >
    {/* KPI GRID */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <Card className="shadow-sm border-slate-200">
    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Totale Moduli</CardTitle></CardHeader>
    <CardContent><div className="text-3xl font-bold text-slate-800">{forms.length}</div></CardContent>
    </Card>
    <Card className="shadow-sm border-slate-200">
    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Moduli Attivi</CardTitle></CardHeader>
    <CardContent><div className="text-3xl font-bold text-green-600">{activeCount}</div></CardContent>
    </Card>
    <Card className="shadow-sm border-slate-200">
    <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Leads Totali</CardTitle></CardHeader>
    <CardContent><div className="text-3xl font-bold text-blue-600">{totalLeads}</div></CardContent>
    </Card>
    </div>

    {/* TABLE */}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    {loading ? (
      <div className="p-20 text-center flex flex-col items-center justify-center text-slate-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      Recupero moduli...
      </div>
    ) : (
      <div className="relative w-full overflow-auto">
      <Table>
      <TableHeader>
      <TableRow className="bg-slate-50 border-b">
      <TableHead className="font-bold text-xs uppercase text-slate-500 w-[300px]">Nome Modulo</TableHead>
      <TableHead className="font-bold text-xs uppercase text-slate-500">Pagina FB</TableHead>
      <TableHead className="font-bold text-xs uppercase text-slate-500 text-center">Stato</TableHead>
      <TableHead className="font-bold text-xs uppercase text-slate-500 text-center">Leads</TableHead>
      <TableHead className="font-bold text-xs uppercase text-slate-500">Campagna Collegata</TableHead>
      <TableHead className="font-bold text-xs uppercase text-slate-500 text-right">ID Modulo</TableHead>
      </TableRow>
      </TableHeader>
      <TableBody>
      {forms.map((form) => {
        const campId = getCampaignId(form);
        const linkedName = campId ? campaignsMap[campId] : null;
        return (
          <TableRow key={form.id} className="hover:bg-blue-50/50 transition-colors border-b border-slate-50 last:border-0">
          <TableCell className="font-semibold text-slate-700 text-sm py-4">{form.name}</TableCell>
          <TableCell className="text-slate-500 text-sm">{form.name_page || '-'}</TableCell>
          <TableCell className="text-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${form.status === 'ACTIVE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>{form.status}</span>
          </TableCell>
          <TableCell className="text-center">
          <div className="inline-block min-w-[30px] text-center font-bold text-slate-700 bg-slate-100 rounded px-2 py-1">
          {form.lead_amount ?? 0}
          </div>
          </TableCell>
          <TableCell>
          {linkedName ? (
            <div className="flex flex-col group cursor-help">
            <span className="text-blue-600 font-semibold text-xs truncate max-w-[200px] group-hover:underline" title={linkedName}>{linkedName}</span>
            <span className="text-[10px] text-slate-400 font-mono">Ref: {campId}</span>
            </div>
          ) : (
            <span className="text-slate-300 text-xs italic">{campId ? `ID mancante: ${campId}` : '-'}</span>
          )}
          </TableCell>
          <TableCell className="font-mono text-[10px] text-slate-400 text-right">{form.id_forms}</TableCell>
          </TableRow>
        );
      })}
      </TableBody>
      </Table>
      </div>
    )}
    </div>
    </Layout>
  );
};
