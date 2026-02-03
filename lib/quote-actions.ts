"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { calcFobUsd } from "@/lib/calc";

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
};

export async function createQuote(input: CreateQuoteInput): Promise<{ shortId: string; error?: string }> {
  const shortId = nanoid(10);
  const rate = input.exchangeRate ?? DEFAULT_RATE;
  const fobUsd =
    input.tradeMode === "general"
      ? input.exwPrice / rate
      : calcFobUsd(input.exwPrice, input.profitMargin, rate);

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

  const { error } = await supabase.from("quotes").insert(row);

  if (error) return { shortId: "", error: error.message };
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
