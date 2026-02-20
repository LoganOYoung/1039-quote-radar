"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { calcFobUsd, type ShipFrom } from "@/lib/calc";

const DEFAULT_RATE = parseFloat(process.env.DEFAULT_EXCHANGE_RATE || "7.25");

export type CreateQuoteInput = {
  productName: string;
  exwPrice: number;
  profitMargin: number;
  customerName?: string;
  tradeMode?: "1039" | "general";
  exchangeRate?: number;
  /** 锁定汇率：报价页展示锚定汇率，保护结汇 */
  exchangeRateLocked?: number;
  /** 受控访问：买家需申请解锁后才可见价格 */
  accessControlled?: boolean;
  /** 发货地：义乌发出 vs 工厂/供应商直发港口（影响国内段运费） */
  shipFrom?: ShipFrom;
  /** 国内段运费（元），不传则按 shipFrom 用默认值：义乌 120，工厂直发 0 */
  domesticCny?: number;
  /** 公司/品牌名（发给客户的报价页头部展示） */
  companyName?: string;
  /** 公司 Logo 图片链接（发给客户的报价页头部展示） */
  companyLogoUrl?: string;
  /** 代理费（元），不传则用环境变量或默认 80 */
  agentFee?: number;
  /** 结汇系数，不传则用环境变量或默认 0.998 */
  settlementFactor?: number;
  /** 产品数量（件），不传则按单价报价；传则按整单算总成本后存单价 FOB */
  orderQuantity?: number;
};

export async function createQuote(input: CreateQuoteInput): Promise<{ shortId: string; error?: string }> {
  const shortId = nanoid(10);
  const rate = input.exchangeRate ?? DEFAULT_RATE;
  const qty = input.orderQuantity != null && input.orderQuantity >= 1 ? input.orderQuantity : 1;
  let fobUsd: number;
  if (input.tradeMode === "general") {
    fobUsd = Number((input.exwPrice / rate).toFixed(2));
  } else if (qty > 1) {
    const totalExw = input.exwPrice * qty;
    const profit = totalExw * (input.profitMargin / 100);
    const domesticCny = input.domesticCny ?? (input.shipFrom === "factory" ? 0 : 120);
    const agentFee = input.agentFee ?? 80;
    const settlementFactor = input.settlementFactor ?? 0.998;
    const totalCny = totalExw + agentFee + domesticCny + profit;
    const totalFobUsd = totalCny / (rate * settlementFactor);
    fobUsd = Number((totalFobUsd / qty).toFixed(2));
  } else {
    fobUsd = calcFobUsd(input.exwPrice, input.profitMargin, rate, {
      shipFrom: input.shipFrom,
      domesticCny: input.domesticCny,
      agentFee: input.agentFee,
      settlementFactor: input.settlementFactor,
    });
  }

  const row: Record<string, unknown> = {
    short_id: shortId,
    product_name: input.productName,
    exw_price: input.exwPrice,
    profit_margin: input.profitMargin,
    fob_price_usd: fobUsd,
    customer_name: input.customerName || null,
    trade_mode: input.tradeMode ?? "1039",
  };
  if (input.exchangeRateLocked != null) {
    row.exchange_rate_locked = input.exchangeRateLocked;
    row.rate_updated_at = new Date().toISOString();
  }
  if (input.accessControlled === true) row.access_controlled = true;
  if (input.companyName?.trim()) row.company_name = input.companyName.trim();
  if (input.companyLogoUrl?.trim()) row.company_logo_url = input.companyLogoUrl.trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!supabaseUrl || supabaseUrl.includes("placeholder")) {
    return {
      shortId: "",
      error: "未配置 Supabase：请在项目根目录 .env.local 中填写 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY",
    };
  }

  try {
    const { error } = await supabase.from("quotes").insert(row);
    if (error) return { shortId: "", error: error.message };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isNetwork =
      msg.includes("fetch failed") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("ENOTFOUND") ||
      (err instanceof Error && err.cause != null);
    if (isNetwork) {
      return {
        shortId: "",
        error:
          "数据库连接失败，请检查：1) .env.local 中 Supabase 地址与 Key 是否正确 2) 网络能否访问 Supabase 3) Supabase 项目是否已暂停（控制台 Resume）",
      };
    }
    return { shortId: "", error: msg || "保存报价失败，请重试" };
  }

  revalidatePath("/dashboard");
  return { shortId };
}

export async function logQuoteView(quoteId: string, ip: string, city: string, userAgent: string) {
  await supabase.from("quote_logs").insert({
    quote_id: quoteId,
    ip_address: ip,
    location_city: city,
    user_agent: userAgent,
  });
  await supabase.rpc("increment_views", { quote_row_id: quoteId });
}

export async function getVisitorInfo() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "127.0.0.1",
    city: h.get("x-vercel-ip-city") || "Unknown",
    userAgent: h.get("user-agent") || "Unknown",
  };
}

/** 更新最近一条访问记录的停留时长（离开页时由客户端调用） */
export async function updateQuoteLogDuration(quoteId: string, durationSeconds: number) {
  const { data: latest } = await supabase
    .from("quote_logs")
    .select("id")
    .eq("quote_id", quoteId)
    .order("viewed_at", { ascending: false })
    .limit(1)
    .single();
  if (!latest) return;
  await supabase
    .from("quote_logs")
    .update({ duration_seconds: Math.round(durationSeconds) })
    .eq("id", latest.id);
}
