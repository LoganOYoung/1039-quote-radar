-- 外贸公司品牌：报价页展示公司名与 Logo
-- 在 Supabase SQL Editor 中执行，或 supabase db push

ALTER TABLE quotes
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT;
