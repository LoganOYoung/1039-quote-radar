import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { logQuoteView, getVisitorInfo } from "@/lib/quote-actions";
import { notifyQuoteViewed } from "@/lib/notify";
import TrackDuration from "./TrackDuration";
import PriceSection from "./PriceSection";
import QuoteExportActions from "./QuoteExportActions";

type Props = { params: Promise<{ id: string }> };

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

export default async function ViewQuotePage({ params }: Props) {
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

  const rateLocked = quote.exchange_rate_locked != null;
  const rateUpdatedAt = quote.rate_updated_at;
  const companyName = quote.company_name?.trim() || null;
  const companyLogoUrl = quote.company_logo_url?.trim() || null;

  const quoteDate = quote.created_at
    ? new Date(quote.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900 overflow-x-hidden print:bg-white">
      <div className="print:hidden"><TrackDuration quoteId={quote.id} /></div>

      {/* 简洁欧美顶栏：白底、细线、左 logo/竖线 + 标题 */}
      <header className="bg-white border-b border-neutral-200/90 print:border-b print:bg-white">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 h-14 sm:h-16 flex items-center gap-4 min-w-0">
          {companyLogoUrl ? (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0 border border-neutral-100">
              <img
                src={companyLogoUrl}
                alt={companyName || "Logo"}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <span className="w-px h-6 bg-neutral-300 shrink-0" aria-hidden />
          )}
          <h1 className="text-base sm:text-lg font-semibold text-neutral-900 tracking-tight truncate">
            {companyName || "Quotation"}
          </h1>
          {!companyName && !companyLogoUrl && (
            <span className="text-xs text-neutral-500 font-normal tracking-wide hidden sm:inline">Price Quotation</span>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 sm:py-16 min-w-0">
        <QuoteExportActions>
          {/* 欧美风白卡：大量留白、中性色、无彩色装饰 */}
          <article className="bg-white border border-neutral-200/80 overflow-hidden print:rounded-none print:shadow-none print:border-neutral-300">
            <div className="px-6 sm:px-10 py-8 sm:py-12">
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-[0.2em] mb-4">Price Quotation</p>
              <div className="flex flex-wrap gap-x-6 gap-y-0.5 text-xs text-neutral-500 mb-8">
                <span className="font-medium text-neutral-600">Ref. {quote.short_id}</span>
                {quoteDate && <span>Date {quoteDate}</span>}
              </div>
              {rateLocked && (
                <p className="text-xs text-neutral-500 mb-6 pb-6 border-b border-neutral-100">
                  Exchange rate (locked): 1 USD = {Number(quote.exchange_rate_locked).toFixed(2)} CNY
                  {rateUpdatedAt && (
                    <span className="text-neutral-400"> — as of {new Date(quote.rate_updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  )}
                </p>
              )}

              <dl className="space-y-8 text-sm">
                <div>
                  <dt className="text-neutral-500 uppercase tracking-[0.15em] text-[11px] font-medium mb-2">Product</dt>
                  <dd className="font-semibold text-neutral-900 text-xl sm:text-2xl leading-snug tracking-tight">{quote.product_name}</dd>
                </div>
                {quote.access_controlled ? (
                  <PriceSection
                    quoteId={quote.id}
                    productName={quote.product_name}
                    fobPriceUsd={quote.fob_price_usd != null ? Number(quote.fob_price_usd) : null}
                    customerName={quote.customer_name}
                    initialAccessGranted={initialAccessGranted}
                  />
                ) : (
                  <>
                    <div>
                      <dt className="text-neutral-500 uppercase tracking-[0.15em] text-[11px] font-medium mb-2">FOB Price (USD)</dt>
                      <dd className="font-semibold text-3xl sm:text-4xl text-neutral-900 mt-0.5 tracking-tight tabular-nums font-serif">
                        $ {quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : "—"}
                      </dd>
                    </div>
                    {quote.customer_name && (
                      <div>
                        <dt className="text-neutral-500 uppercase tracking-[0.15em] text-[11px] font-medium mb-1">Prepared for</dt>
                        <dd className="text-neutral-700 font-medium">{quote.customer_name}</dd>
                      </div>
                    )}
                  </>
                )}
              </dl>

              <p className="mt-10 pt-6 border-t border-neutral-100 text-xs text-neutral-500">
                Prices subject to confirmation. Valid for 7 days from date of issue.
              </p>
            </div>
          </article>
        </QuoteExportActions>

        <footer className="mt-12 text-center text-[11px] text-neutral-400 tracking-wide space-y-1 print:mt-8">
          <p>Viewing of this page may be recorded for security.</p>
          {!(companyName || companyLogoUrl) && <p>Powered by 1039 Quote Radar</p>}
        </footer>
      </div>
    </main>
  );
}
