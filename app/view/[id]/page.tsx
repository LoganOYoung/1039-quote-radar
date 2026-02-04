import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { logQuoteView, getVisitorInfo } from "@/lib/quote-actions";
import { notifyQuoteViewed } from "@/lib/notify";
import TrackDuration from "./TrackDuration";
import PriceSection from "./PriceSection";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: shortId } = await params;
  const { data: quote } = await supabase
    .from("quotes")
    .select("product_name, fob_price_usd")
    .eq("short_id", shortId)
    .single();
  if (!quote) return { title: "Quotation" };
  const title = `${quote.product_name} - $${quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : ""} USD`;
  const description = `FOB Price: $${quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : "—"} USD · 1039 Quote Radar`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: { card: "summary", title, description },
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

  const quoteDate = quote.created_at
    ? new Date(quote.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6 md:p-10">
      <TrackDuration quoteId={quote.id} />
      <div className="max-w-md mx-auto">
        {/* Card: formal quotation document */}
        <article className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <header className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Quotation</h1>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
              <span>Ref: {quote.short_id}</span>
              {quoteDate && <span>Date: {quoteDate}</span>}
            </div>
            {rateLocked && (
              <p className="mt-2 text-xs text-gray-500">
                Exchange rate (locked): 1 USD = {Number(quote.exchange_rate_locked).toFixed(2)} CNY
                {rateUpdatedAt && (
                  <span> (as of {new Date(quote.rate_updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})</span>
                )}
              </p>
            )}
          </header>

          <div className="px-5 sm:px-6 py-5 sm:py-6">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-gray-500 uppercase tracking-wide text-xs">Product</dt>
                <dd className="font-medium text-gray-900 mt-0.5 text-base">{quote.product_name}</dd>
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
                    <dt className="text-gray-500 uppercase tracking-wide text-xs">FOB Price (USD)</dt>
                    <dd className="font-semibold text-xl text-gray-900 mt-0.5">
                      $ {quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : "—"}
                    </dd>
                  </div>
                  {quote.customer_name && (
                    <div>
                      <dt className="text-gray-500 uppercase tracking-wide text-xs">Prepared for</dt>
                      <dd className="text-gray-700 mt-0.5">{quote.customer_name}</dd>
                    </div>
                  )}
                </>
              )}
            </dl>

            <p className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
              Prices subject to confirmation. Valid for 7 days from date of issue.
            </p>
          </div>
        </article>

        <footer className="mt-6 text-center text-xs text-gray-400 space-y-1">
          <p>Viewing of this page may be recorded for security.</p>
          <p>Powered by 1039 Quote Radar</p>
        </footer>
      </div>
    </main>
  );
}
