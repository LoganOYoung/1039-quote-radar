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
  const description = `FOB Price: $${quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : "—"} USD · 1039报价雷达`;
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

  return (
    <main className="min-h-screen bg-white text-gray-900 p-6 md:p-10">
      <TrackDuration quoteId={quote.id} />
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-6">
          Quotation
        </h1>
        {rateLocked && (
          <p className="text-xs text-gray-500 mb-4">
            Base Exchange Rate: 1 USD = {Number(quote.exchange_rate_locked).toFixed(2)} CNY
            {rateUpdatedAt && (
              <span> (Locked {new Date(quote.rate_updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })})</span>
            )}
          </p>
        )}
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-gray-500 uppercase tracking-wide">Product</dt>
            <dd className="font-medium text-gray-900 mt-0.5">{quote.product_name}</dd>
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
                <dt className="text-gray-500 uppercase tracking-wide">FOB Price (USD)</dt>
                <dd className="font-medium text-lg text-gray-900">
                  $ {quote.fob_price_usd != null ? Number(quote.fob_price_usd).toFixed(2) : "—"}
                </dd>
              </div>
              {quote.customer_name && (
                <div>
                  <dt className="text-gray-500 uppercase tracking-wide">Prepared for</dt>
                  <dd className="text-gray-700">{quote.customer_name}</dd>
                </div>
              )}
            </>
          )}
        </dl>
        <p className="mt-8 text-xs text-gray-400">
          Access to this page may be recorded for security and analytics.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Powered by 1039报价雷达
        </p>
      </div>
    </main>
  );
}
