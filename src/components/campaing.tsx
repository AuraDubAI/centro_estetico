import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

interface Campaign {
  campaign_id: string;
  campaign_name: string;
  spend: string;
  leads_generated: number;
  cpl: string;
  ctr: string;
  cpm: string;
  conversion_rate: string;
  frequency: string;
}

interface AccountData {
  ad_account_id: string;
  name: string;
  kpi: {
    spend: string;
    leads_generated: number;
    cpl: string;
    ctr: string;
    cpm: string;
    conversion_rate: string;
    frequency: string;
  };
  campaigns: Campaign[];
}

interface Props {
  data: AccountData;
}

export const AdAccountKPIs = ({ data }: Props) => {
  const { kpi, campaigns } = data;

  // Transformar dados para gráfico de campanhas
  const chartData = campaigns.map((c) => ({
    name: c.campaign_name,
    spend: parseFloat(c.spend),
    leads: c.leads_generated,
    cpl: parseFloat(c.cpl),
    ctr: parseFloat(c.ctr),
    conversion: parseFloat(c.conversion_rate),
  }));

  return (
    <div className="space-y-10">
      {/* KPI Geral da Conta */}
      <div className="border p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">{data.name} - KPIs Gerais</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>Spend: €{kpi.spend}</div>
          <div>Leads: {kpi.leads_generated}</div>
          <div>CPL: €{kpi.cpl}</div>
          <div>CTR: {kpi.ctr}%</div>
          <div>CPM: {kpi.cpm}</div>
          <div>Conversion Rate: {kpi.conversion_rate}%</div>
          <div>Frequency: {kpi.frequency}</div>
        </div>
      </div>

      {/* Gráfico de Gastos por Campanha */}
      <div className="border p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-4">Spend e Leads por Campanha</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              // dataKey="name"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-35}
              textAnchor="end"
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="spend" fill="#3b82f6" name="Spend (€)" />
            <Bar dataKey="leads" fill="#10b981" name="Leads Gerados" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de CPL e CTR */}
      <div className="border p-4 rounded shadow">
        <h3 className="text-lg font-bold mb-4">CPL e CTR por Campanha</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              // dataKey="name"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-35}
              textAnchor="end"
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="cpl"
              stroke="#f59e0b"
              name="CPL (€)"
            />
            <Line
              type="monotone"
              dataKey="ctr"
              stroke="#ef4444"
              name="CTR (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
