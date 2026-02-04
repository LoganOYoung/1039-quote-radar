"use client";

import { useState, useEffect } from "react";

type Props = {
  quoteId: string;
  productName: string;
  fobPriceUsd: number | null;
  customerName: string | null;
  initialAccessGranted: boolean;
};

export default function PriceSection({
  quoteId,
  productName,
  fobPriceUsd,
  customerName,
  initialAccessGranted,
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

  if (accessGranted) {
    return (
      <>
        <div>
          <dt className="text-gray-500 uppercase tracking-wide">FOB Price (USD)</dt>
          <dd className="font-medium text-lg text-gray-900">
            $ {fobPriceUsd != null ? Number(fobPriceUsd).toFixed(2) : "—"}
          </dd>
        </div>
        {customerName && (
          <div>
            <dt className="text-gray-500 uppercase tracking-wide">Prepared for</dt>
            <dd className="text-gray-700">{customerName}</dd>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="border-t pt-4 mt-4">
        <p className="text-sm text-gray-500">Unit Price (FOB USD)</p>
        <div className="text-3xl font-bold text-gray-400 select-none blur-md mt-1">
          $ {fobPriceUsd != null ? Number(fobPriceUsd).toFixed(2) : "—"}
        </div>
        {customerName && (
          <p className="text-sm text-gray-400 mt-2 select-none blur-sm">{customerName}</p>
        )}
        {!requestSent ? (
          <button
            type="button"
            onClick={handleRequestAccess}
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-blue-600 text-white px-4 py-3 font-medium hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? "Submitting…" : "Request to View Price"}
          </button>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            Request sent. Price will show once the supplier approves. You may refresh this page.
          </p>
        )}
      </div>
    </>
  );
}
