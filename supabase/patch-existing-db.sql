-- 已有数据库补丁：若报错 "Could not find the 'company_name' column"，
-- 在 Supabase 控制台 → SQL Editor 中执行本文件即可。

-- quotes 表补全列（早期建表时可能缺失）
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS exchange_rate_locked DECIMAL(10, 4),
  ADD COLUMN IF NOT EXISTS rate_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS access_controlled BOOLEAN DEFAULT false;

-- 受控访问表（若不存在则无影响）
CREATE TABLE IF NOT EXISTS quote_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  ip_address TEXT,
  location_city TEXT,
  session_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'rejected')),
  granted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_access_requests_quote_status ON quote_access_requests(quote_id, status);
CREATE INDEX IF NOT EXISTS idx_access_requests_session ON quote_access_requests(session_token);

ALTER TABLE quote_access_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all quote_access_requests" ON quote_access_requests;
CREATE POLICY "Allow all quote_access_requests" ON quote_access_requests FOR ALL USING (true) WITH CHECK (true);
