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
  const description = `FOB Price: $${quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : "—"} USD · 1039 Quote Radar`;
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
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 text-gray-900 overflow-x-hidden print:bg-white">
      <div className="print:hidden"><TrackDuration quoteId={quote.id} /></div>
      <div className="max-w-lg mx-auto px-3 sm:px-6 py-6 sm:py-12 min-w-0">
        <QuoteExportActions>
        {/* Header: gradient band + logo & company */}
        <header className="rounded-t-2xl overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 shadow-lg print:rounded-t-xl">
          <div className="px-6 py-6 sm:py-8 flex flex-col items-center text-center">
            {companyLogoUrl ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/95 shadow-md flex items-center justify-center overflow-hidden mb-3 shrink-0">
                <img
                  src={companyLogoUrl}
                  alt={companyName || "Company logo"}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : null}
            {(companyName || !companyLogoUrl) && (
              <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
                {companyName || "Quotation"}
              </h1>
            )}
            <p className="mt-1 text-teal-100 text-sm font-medium">Price Quotation</p>
          </div>
        </header>

        {/* Card: content */}
        <article className="bg-white rounded-b-2xl sm:rounded-b-2xl shadow-xl shadow-slate-200/50 border border-slate-100 -mt-px overflow-hidden">
          <div className="px-6 sm:px-8 py-6 sm:py-8">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-5">
              <span className="font-medium text-teal-600">Ref: {quote.short_id}</span>
              {quoteDate && <span>Date: {quoteDate}</span>}
            </div>
            {rateLocked && (
              <p className="text-xs text-slate-500 mb-4 pb-4 border-b border-slate-100">
                Exchange rate (locked): 1 USD = {Number(quote.exchange_rate_locked).toFixed(2)} CNY
                {rateUpdatedAt && (
                  <span> (as of {new Date(quote.rate_updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})</span>
                )}
              </p>
            )}

            <dl className="space-y-5 text-sm">
              <div>
                <dt className="text-slate-500 uppercase tracking-wide text-xs font-medium">Product</dt>
                <dd className="font-semibold text-gray-900 mt-1 text-base">{quote.product_name}</dd>
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
                    <dt className="text-slate-500 uppercase tracking-wide text-xs font-medium">FOB Price (USD)</dt>
                    <dd className="font-bold text-2xl text-teal-600 mt-1">
                      $ {quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : "—"}
                    </dd>
                  </div>
                  {quote.customer_name && (
                    <div>
                      <dt className="text-slate-500 uppercase tracking-wide text-xs font-medium">Prepared for</dt>
                      <dd className="text-gray-700 mt-1">{quote.customer_name}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>

            <p className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
              Prices subject to confirmation. Valid for 7 days from date of issue.
            </p>
          </div>
        </article>
        </QuoteExportActions>

        <footer className="mt-8 text-center text-xs text-slate-400 space-y-1 print:mt-4">
          <p>Viewing of this page may be recorded for security.</p>
          <p>Powered by 1039 Quote Radar</p>
        </footer>
      </div>
    </main>
  );
}
