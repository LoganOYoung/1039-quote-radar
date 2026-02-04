import { createClient } from "@supabase/supabase-js";

// 构建时若无 env 使用占位，避免 build 报错；运行前请配置 .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Quote = {
  id: string;
  supplier_id: string | null;
  short_id: string;
  product_name: string;
  exw_price: number | null;
  profit_margin: number | null;
  fob_price_usd: number | null;
  customer_name: string | null;
  trade_mode: string;
  views_count: number;
  expires_at: string | null;
  created_at: string;
  company_name: string | null;
  company_logo_url: string | null;
};

export type QuoteLog = {
  id: string;
  quote_id: string;
  ip_address: string | null;
  location_city: string | null;
  user_agent: string | null;
  duration_seconds: number | null;
  viewed_at: string;
};
