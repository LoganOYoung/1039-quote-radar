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
    <main className="min-h-screen bg-slate-50/80 text-slate-900 overflow-x-hidden print:bg-white">
      <div className="print:hidden"><TrackDuration quoteId={quote.id} /></div>

      {/* Portal-style top bar: logo + company name */}
      <header className="bg-white border-b border-slate-200/80 print:border-b print:bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 sm:h-[4.5rem] flex items-center justify-between gap-4 min-w-0">
          {companyLogoUrl ? (
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 border border-slate-100">
              <img
                src={companyLogoUrl}
                alt={companyName || "Logo"}
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <span className="w-10 shrink-0" aria-hidden />
          )}
          <h1 className="flex-1 text-center text-lg sm:text-xl font-semibold text-slate-800 truncate">
            {companyName || "Quotation"}
          </h1>
          <span className={companyLogoUrl ? "w-10 shrink-0" : "hidden"} aria-hidden />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-6 sm:py-10 min-w-0">
        <QuoteExportActions>
          {/* Document card */}
          <article
            className="bg-white rounded-xl shadow-sm border border-slate-200/90 overflow-hidden print:rounded-none print:shadow-none"
            style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)" }}
          >
            <div className="px-6 sm:px-8 py-6 sm:py-8">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Price Quotation</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-6">
                <span className="font-medium text-teal-600">Ref: {quote.short_id}</span>
                {quoteDate && <span>Date: {quoteDate}</span>}
              </div>
              {rateLocked && (
                <p className="text-xs text-slate-500 mb-5 pb-5 border-b border-slate-100">
                  Exchange rate (locked): 1 USD = {Number(quote.exchange_rate_locked).toFixed(2)} CNY
                  {rateUpdatedAt && (
                    <span> (as of {new Date(quote.rate_updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})</span>
                  )}
                </p>
              )}

              <dl className="space-y-6 text-sm">
                <div>
                  <dt className="text-slate-500 uppercase tracking-wide text-xs font-medium mb-1">Product</dt>
                  <dd className="font-semibold text-slate-900 text-lg leading-snug">{quote.product_name}</dd>
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
                      <dt className="text-slate-500 uppercase tracking-wide text-xs font-medium mb-1">FOB Price (USD)</dt>
                      <dd className="font-bold text-2xl sm:text-3xl text-teal-600 mt-0.5 tracking-tight">
                        $ {quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : "—"}
                      </dd>
                    </div>
                    {quote.customer_name && (
                      <div>
                        <dt className="text-slate-500 uppercase tracking-wide text-xs font-medium">Prepared for</dt>
                        <dd className="text-slate-700 mt-1 font-medium">{quote.customer_name}</dd>
                      </div>
                    )}
                  </>
                )}
              </dl>

              <p className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500">
                Prices subject to confirmation. Valid for 7 days from date of issue.
              </p>
            </div>
          </article>
        </QuoteExportActions>

        <footer className="mt-10 text-center text-xs text-slate-400 space-y-1 print:mt-6">
          <p>Viewing of this page may be recorded for security.</p>
          {!(companyName || companyLogoUrl) && <p>Powered by 1039 Quote Radar</p>}
        </footer>
      </div>
    </main>
  );
}
