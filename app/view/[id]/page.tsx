import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies, headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { logQuoteView, getVisitorInfo } from "@/lib/quote-actions";
import { notifyQuoteViewed } from "@/lib/notify";
import { getViewLang } from "@/lib/view-i18n";
import ViewQuoteClient from "./ViewQuoteClient";

type Props = { params: Promise<{ id: string }>; searchParams?: Promise<{ lang?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: shortId } = await params;
  const { data: quote } = await supabase
    .from("quotes")
    .select("product_name, fob_price_usd, company_name")
    .eq("short_id", shortId)
    .single();
  if (!quote) return { title: "Quotation" };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://1039-quote-radar.vercel.app";
  const title = quote.company_name
    ? `${quote.product_name} - ${quote.company_name}`
    : `${quote.product_name} - $${quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : ""} USD`;
  const hasBrand = !!(quote.company_name?.trim());
  const description = hasBrand
    ? `FOB Price: $${quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : "—"} USD`
    : `FOB Price: $${quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : "—"} USD · 1039 Quote Radar`;
  const ogImageUrl = `${siteUrl.replace(/\/$/, "")}/api/og/quote/${shortId}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
  };
}

export default async function ViewQuotePage({ params, searchParams }: Props) {
  const { id: shortId } = await params;
  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("*")
    .eq("short_id", shortId)
    .single();

  if (quoteError || !quote) notFound();

  const { ip, city, userAgent } = await getVisitorInfo();
  await logQuoteView(quote.id, ip, city, userAgent);
  await notifyQuoteViewed(
    { product_name: quote.product_name, short_id: quote.short_id },
    city
  );

  const cookieStore = await cookies();
  const requestId = cookieStore.get("quote_access_request")?.value;
  let initialAccessGranted = false;
  if (quote.access_controlled && requestId) {
    const { data: grant } = await supabase
      .from("quote_access_requests")
      .select("id")
      .eq("quote_id", quote.id)
      .eq("session_token", requestId)
      .eq("status", "granted")
      .single();
    initialAccessGranted = !!grant;
  } else if (!quote.access_controlled) {
    initialAccessGranted = true;
  }

  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialLang = getViewLang(resolvedSearchParams?.lang, acceptLanguage);

  const quoteForView = {
    id: quote.id,
    short_id: quote.short_id,
    product_name: quote.product_name,
    fob_price_usd: quote.fob_price_usd,
    customer_name: quote.customer_name,
    company_name: quote.company_name,
    company_logo_url: quote.company_logo_url,
    exchange_rate_locked: quote.exchange_rate_locked,
    rate_updated_at: quote.rate_updated_at,
    access_controlled: quote.access_controlled,
    created_at: quote.created_at,
    expires_at: quote.expires_at,
    order_quantity: (quote as { order_quantity?: number }).order_quantity ?? null,
    port_of_loading: (quote as { port_of_loading?: string }).port_of_loading ?? null,
    payment_terms: (quote as { payment_terms?: string }).payment_terms ?? null,
    company_email: (quote as { company_email?: string }).company_email ?? null,
    company_phone: (quote as { company_phone?: string }).company_phone ?? null,
    remarks: (quote as { remarks?: string }).remarks ?? null,
  };

  return (
    <ViewQuoteClient
      quote={quoteForView}
      initialAccessGranted={initialAccessGranted}
      initialLang={initialLang}
    />
  );
}
