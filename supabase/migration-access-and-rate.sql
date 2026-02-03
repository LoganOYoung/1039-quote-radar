-- 受控访问 + 动态锚定汇率 - 在 Supabase SQL Editor 中执行

-- 1. quotes 表新增字段
ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS exchange_rate_locked DECIMAL(10, 4),
  ADD COLUMN IF NOT EXISTS rate_updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS access_controlled BOOLEAN DEFAULT false;

-- 2. 报价访问申请（受控访问）
CREATE TABLE IF NOT EXISTS quote_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  ip_address TEXT,
  location_city TEXT,
  user_agent TEXT,
  session_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'granted', 'rejected')),
  granted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_requests_quote_status ON quote_access_requests(quote_id, status);
CREATE INDEX IF NOT EXISTS idx_access_requests_session ON quote_access_requests(session_token);

-- RLS
ALTER TABLE quote_access_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all quote_access_requests" ON quote_access_requests;
CREATE POLICY "Allow all quote_access_requests" ON quote_access_requests FOR ALL USING (true) WITH CHECK (true);
