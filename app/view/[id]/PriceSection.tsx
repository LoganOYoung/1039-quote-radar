"use client";

import { useState, useEffect } from "react";
import { t, type ViewLang } from "@/lib/view-i18n";

type Props = {
  quoteId: string;
  productName: string;
  fobPriceUsd: number | null;
  customerName: string | null;
  initialAccessGranted: boolean;
  lang?: ViewLang;
  isExpired?: boolean;
};

export default function PriceSection({
  quoteId,
  productName,
  fobPriceUsd,
  customerName,
  initialAccessGranted,
  lang = "en",
  isExpired = false,
}: Props) {
  const [accessGranted, setAccessGranted] = useState(initialAccessGranted);
  const [requestSent, setRequestSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!requestSent || !requestId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/access-status?requestId=${encodeURIComponent(requestId)}`, { credentials: "include" });
        const data = await res.json().catch(() => ({}));
        if (data.granted) setAccessGranted(true);
      } catch {
        // ignore
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [requestSent, requestId]);

  const handleRequestAccess = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (data.requestId) {
        setRequestSent(true);
        setRequestId(data.requestId);
      }
    } catch {
      setRequestSent(true);
    }
    setLoading(false);
  };

  if (isExpired) {
    return (
      <div className="py-4">
        <p className="font-semibold text-neutral-700 dark:text-neutral-300">{t("quoteExpired", lang)}</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{t("quoteExpiredHint", lang)}</p>
      </div>
    );
  }

  if (accessGranted) {
    return (
      <>
        <div>
          <dt className="text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] text-[11px] font-medium mb-2">{t("unitPriceFobLabel", lang)}</dt>
          <dd className="font-semibold text-3xl sm:text-4xl text-neutral-900 dark:text-neutral-100 mt-0.5 tracking-tight tabular-nums font-serif">
            $ {fobPriceUsd != null ? Number(fobPriceUsd).toFixed(2) : "—"}
          </dd>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">{t("allAmountsUsd", lang)}</p>
        </div>
        {customerName && (
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em] text-[11px] font-medium mb-1">{t("billTo", lang)}</dt>
            <dd className="text-neutral-700 dark:text-neutral-300 font-medium mt-1">{customerName}</dd>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6 mt-6">
        <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.15em]">{t("unitPriceFobLabel", lang)}</p>
        <div className="text-3xl font-semibold text-neutral-400 dark:text-neutral-500 select-none blur-md mt-1 font-serif tabular-nums">
          $ {fobPriceUsd != null ? Number(fobPriceUsd).toFixed(2) : "—"}
        </div>
        {customerName && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2 select-none blur-sm">{customerName}</p>
        )}
        {!requestSent ? (
          <button
            type="button"
            onClick={handleRequestAccess}
            disabled={loading}
            className="mt-5 w-full rounded border border-neutral-800 dark:border-neutral-600 bg-neutral-900 dark:bg-neutral-700 text-white px-4 py-3 text-sm font-medium tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-600 active:bg-neutral-950 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? t("submitting", lang) : t("requestToViewPrice", lang)}
          </button>
        ) : (
          <p className="mt-5 text-xs text-neutral-500 dark:text-neutral-400">{t("requestSent", lang)}</p>
        )}
      </div>
    </>
  );
}
