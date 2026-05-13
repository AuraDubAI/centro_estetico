export interface Campaign {
  campain_id: string;
  name: string;
  objective: string;
  status: string;
  start_time: string;
  account_id: string;
  account_name: string;
  tipologia: string | null;
  manager: string | null;
  updated_time_campaign: string;

  id: number;
  createdAt: string;
  updatedAt: string;

  adsets: Adset[];
}

export interface Adset {
  adset_id: string;
  campaign_id: string;
  name: string;

  daily_budget: string;
  lifetime_budget: string;

  start_time: string;
  effective_status: string;
  updated_time_adset: string;
  end_time: string | null;

  id: number;
  createdAt: string;
  updatedAt: string;

  insights: Insight[];
}

export interface Insight {
  insight_id: string;
  adset_id: string;

  impressions: string;
  clicks: string;
  spend: string;

  ctr: string;
  cpc: string;
  cpm: string;

  date_start: string;
  date_end: string;

  leads: number | null;

  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignRow {
  campaign_name: string;
  ad_account_name: string;

  user_id: string | null;
  tipologia: string | null;
  manager: string | null;

  adset_name: string;
  status: string;

  start_date: string | null;
  end_date: string | null;

  leads_generated: number;
  clicks: number;
  impressions: number;
  spend: number;

  cpl: number;

  ctr: number;
  cpc: number;
  cpm: number;
  conversion_rate: number;
}
