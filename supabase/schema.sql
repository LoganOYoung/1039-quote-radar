-- 1039报价雷达 - 在 Supabase SQL Editor 中执行

-- 报价单主表
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  short_id TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  exw_price DECIMAL(10, 2),
  profit_margin DECIMAL(5, 2),
  fob_price_usd DECIMAL(10, 2),
  customer_name TEXT,
  trade_mode TEXT DEFAULT '1039',
  views_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 访问日志（情报）
CREATE TABLE IF NOT EXISTS quote_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  ip_address TEXT,
  location_city TEXT,
  user_agent TEXT,
  duration_seconds INTEGER,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 可选：匿名访问
CREATE TABLE IF NOT EXISTS anonymous_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT,
  referrer TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 浏览次数 +1 的 RPC
CREATE OR REPLACE FUNCTION increment_views(quote_row_id UUID)
RETURNS void AS $$
  UPDATE quotes SET views_count = views_count + 1 WHERE id = quote_row_id;
$$ LANGUAGE sql;

-- 允许匿名读写（开发用；生产建议用 RLS 限制）
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all on quotes" ON quotes;
CREATE POLICY "Allow all on quotes" ON quotes FOR ALL USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow all on quote_logs" ON quote_logs;
CREATE POLICY "Allow all on quote_logs" ON quote_logs FOR ALL USING (true) WITH CHECK (true);

-- anonymous_visits：允许插入（微信等来源记录）
ALTER TABLE anonymous_visits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert anonymous_visits" ON anonymous_visits;
CREATE POLICY "Allow insert anonymous_visits" ON anonymous_visits FOR INSERT WITH CHECK (true);
