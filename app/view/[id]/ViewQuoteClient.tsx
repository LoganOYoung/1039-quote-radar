"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, Mail, Phone, Languages } from "lucide-react";
import { t, getViewLang, viewLangLabels, type ViewLang } from "@/lib/view-i18n";
import TrackDuration from "./TrackDuration";
import PriceSection from "./PriceSection";
import QuoteExportActions from "./QuoteExportActions";

export type QuoteForView = {
  id: string;
  short_id: string;
  product_name: string;
  fob_price_usd: number | null;
  customer_name: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  exchange_rate_locked: number | null;
  rate_updated_at: string | null;
  access_controlled: boolean | null;
  created_at: string;
  expires_at: string | null;
  order_quantity: number | null;
  port_of_loading: string | null;
  payment_terms: string | null;
  company_email: string | null;
  company_phone: string | null;
  remarks: string | null;
};

type Props = {
  quote: QuoteForView;
  initialAccessGranted: boolean;
  initialLang: ViewLang;
};

const dateLocales: Record<ViewLang, string> = { en: "en-US", fr: "fr-FR", ar: "ar", de: "de-DE", ja: "ja-JP" };
function formatDate(iso: string, lang: ViewLang) {
  return new Date(iso).toLocaleDateString(dateLocales[lang] ?? "en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ViewQuoteClient({ quote, initialAccessGranted, initialLang }: Props) {
  const [lang, setLang] = useState<ViewLang>(initialLang);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("quote-view-theme") as "light" | "dark" | null;
    const preferDark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(preferDark);
    document.documentElement.classList.toggle("dark", preferDark);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("quote-view-theme", next ? "dark" : "light");
  };

  const setLangAndPersist = (l: ViewLang) => {
    setLang(l);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", l);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const companyName = quote.company_name?.trim() || null;
  const companyLogoUrl = quote.company_logo_url?.trim() || null;
  const companyEmail = quote.company_email?.trim() || null;
  const companyPhone = quote.company_phone?.trim() || null;
  const rateLocked = quote.exchange_rate_locked != null;
  const orderQty = quote.order_quantity != null && quote.order_quantity >= 1 ? quote.order_quantity : 0;
  const unitPrice = quote.fob_price_usd != null ? Number(quote.fob_price_usd) : null;
  const totalUsd = unitPrice != null && orderQty > 1 ? Number((unitPrice * orderQty).toFixed(2)) : null;
  const quoteDate = quote.created_at ? formatDate(quote.created_at, lang) : null;
  const validUntil = quote.created_at
    ? (() => {
        const d = new Date(quote.created_at);
        d.setDate(d.getDate() + 7);
        return formatDate(d.toISOString(), lang);
      })()
    : null;
  const isExpired = quote.expires_at ? new Date(quote.expires_at) < new Date() : false;
  const isRtl = lang === "ar";

  return (
    <main
      className="min-h-screen bg-neutral-100 text-neutral-900 overflow-x-hidden print:bg-white dark:bg-neutral-950 dark:text-neutral-100"
      dir={isRtl ? "rtl" : "ltr"}
      lang={lang}
    >
      <div className="print:hidden"><TrackDuration quoteId={quote.id} /></div>

      <header className="bg-white border-b border-neutral-200 print:border-b print:bg-white dark:bg-neutral-900 dark:border-neutral-700">
        <div className="max-w-2xl mx-auto px-5 sm:px-8 h-14 sm:h-16 flex items-center gap-4 min-w-0">
          {companyLogoUrl ? (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0 border border-neutral-100 dark:bg-neutral-800 dark:border-neutral-700">
              <img src={companyLogoUrl} alt={companyName || "Logo"} className="w-full h-full object-contain" />
            </div>
          ) : (
            <span className="w-px h-6 bg-neutral-300 dark:bg-neutral-600 shrink-0" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
              {companyName || t("quotation", lang)}
            </h1>
            {!companyName && !companyLogoUrl && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 font-normal tracking-wide hidden sm:inline">
                {t("priceQuotation", lang)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 print:hidden">
            <span className="text-neutral-400 dark:text-neutral-500 p-1" aria-hidden>
              <Languages className="w-4 h-4" />
            </span>
            {(["en", "fr", "de", "ja", "ar"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLangAndPersist(l)}
                className={`px-2 py-1 text-xs font-medium rounded ${lang === l ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100" : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"}`}
                aria-label={l === "en" ? "English" : l === "fr" ? "Français" : l === "ar" ? "العربية" : l === "de" ? "Deutsch" : "日本語"}
              >
                {viewLangLabels[l]}
              </button>
            ))}
            <button
              type="button"
              onClick={toggleDark}
              className="p-2 rounded text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              aria-label={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-10 sm:py-16 min-w-0">
        <QuoteExportActions lang={lang}>
          <article className="bg-white border border-neutral-200 overflow-hidden print:rounded-none print:shadow-none print:border-neutral-300 dark:bg-neutral-900 dark:border-neutral-700">
            <div className="px-6 sm:px-10 py-8 sm:py-12">
              <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-[0.2em] mb-4">
                {t("docTitle", lang)}
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-0.5 text-xs text-neutral-500 dark:text-neutral-400 mb-6">
                <span className="font-medium text-neutral-600 dark:text-neutral-300">{t("ref", lang)} {quote.short_id}</span>
                {quoteDate && <span>{t("dateOfIssue", lang)} {quoteDate}</span>}
                {validUntil && <span>{t("validUntil", lang)} {validUntil}</span>}
              </div>
              {rateLocked && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
                  {t("exchangeRateLocked", lang)} {Number(quote.exchange_rate_locked).toFixed(2)} CNY
                  {quote.rate_updated_at && (
                    <span className="text-neutral-400 dark:text-neutral-500"> — {t("asOf", lang)} {formatDate(quote.rate_updated_at, lang)}</span>
                  )}
                </p>
              )}

              <dl className="space-y-8 text-sm">
                <div>
                  <dt className="text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] text-[11px] font-medium mb-2">{t("goodsDescription", lang)}</dt>
                  <dd className="font-semibold text-neutral-900 dark:text-neutral-100 text-xl sm:text-2xl leading-snug tracking-tight">{quote.product_name}</dd>
                </div>
                {orderQty > 1 && (
                  <div>
                    <dt className="text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] text-[11px] font-medium mb-1">{t("quantity", lang)}</dt>
                    <dd className="text-neutral-700 dark:text-neutral-300 font-medium">{orderQty.toLocaleString()} pcs</dd>
                  </div>
                )}
                {quote.access_controlled ? (
                  <PriceSection
                    quoteId={quote.id}
                    productName={quote.product_name}
                    fobPriceUsd={unitPrice}
                    customerName={quote.customer_name}
                    initialAccessGranted={initialAccessGranted}
                    lang={lang}
                    isExpired={isExpired}
                  />
                ) : (
                  <>
                    {!isExpired && (
                      <div>
                        <dt className="text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] text-[11px] font-medium mb-2">{t("unitPriceFob", lang)}</dt>
                        <dd className="font-semibold text-3xl sm:text-4xl text-neutral-900 dark:text-neutral-100 mt-0.5 tracking-tight tabular-nums font-serif">
                          $ {unitPrice != null ? Number(unitPrice).toFixed(2) : "—"}
                        </dd>
                        {orderQty > 1 && totalUsd != null && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">{t("totalAmount", lang)}: $ {totalUsd.toFixed(2)} USD</p>
                        )}
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">{t("allAmountsUsd", lang)}</p>
                      </div>
                    )}
                    {isExpired && (
                      <div className="py-4">
                        <p className="font-semibold text-neutral-700 dark:text-neutral-300">{t("quoteExpired", lang)}</p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t("quoteExpiredHint", lang)}</p>
                      </div>
                    )}
                    {quote.customer_name && (
                      <div>
                        <dt className="text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] text-[11px] font-medium mb-1">{t("billTo", lang)}</dt>
                        <dd className="text-neutral-700 dark:text-neutral-300 font-medium">{quote.customer_name}</dd>
                      </div>
                    )}
                    {quote.port_of_loading?.trim() && (
                      <div>
                        <dt className="text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] text-[11px] font-medium mb-1">{t("portOfLoading", lang)}</dt>
                        <dd className="text-neutral-700 dark:text-neutral-300">{quote.port_of_loading.trim()}</dd>
                      </div>
                    )}
                    {quote.payment_terms?.trim() && (
                      <div>
                        <dt className="text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] text-[11px] font-medium mb-1">{t("paymentTerms", lang)}</dt>
                        <dd className="text-neutral-700 dark:text-neutral-300">{quote.payment_terms.trim()}</dd>
                      </div>
                    )}
                    {quote.remarks?.trim() && (
                      <div>
                        <dt className="text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] text-[11px] font-medium mb-1">{t("remarks", lang)}</dt>
                        <dd className="text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap">{quote.remarks.trim()}</dd>
                      </div>
                    )}
                  </>
                )}
              </dl>

              <div className="mt-10 pt-6 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                <p>{t("terms1", lang)}</p>
                <p>{t("terms2", lang)}</p>
              </div>
            </div>
          </article>
        </QuoteExportActions>

        {(companyEmail || companyPhone) && (
          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">{t("contactSeller", lang)}</span>
            {companyEmail && (
              <a
                href={`mailto:${companyEmail}`}
                className="inline-flex items-center gap-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              >
                <Mail className="w-3.5 h-3.5" />
                {t("email", lang)}
              </a>
            )}
            {companyPhone && (
              <a
                href={`tel:${companyPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
              >
                <Phone className="w-3.5 h-3.5" />
                {t("call", lang)}
              </a>
            )}
          </div>
        )}

        <footer className="mt-12 text-center text-[11px] text-neutral-400 dark:text-neutral-500 tracking-wide space-y-1 print:mt-8">
          <p>{t("viewingRecorded", lang)}</p>
          {!(companyName || companyLogoUrl) && <p>{t("poweredBy", lang)}</p>}
        </footer>
      </div>
    </main>
  );
}
