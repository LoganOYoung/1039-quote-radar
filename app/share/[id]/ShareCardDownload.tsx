"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";

type Props = {
  productName: string;
  fobPriceUsd: number | null;
  customerName: string | null;
};

export default function ShareCardDownload({ productName, fobPriceUsd, customerName }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `quotation-${productName.slice(0, 20)}.png`;
      a.click();
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto">
      <div
        ref={cardRef}
        className="rounded-none overflow-hidden bg-white shadow-lg border border-slate-100"
        style={{ width: 375 }}
      >
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 px-6 py-5">
          <p className="text-teal-100 text-xs font-medium uppercase tracking-wide">Price Quotation</p>
          <h2 className="text-xl font-bold text-white mt-1 truncate">{productName}</h2>
        </div>
        <div className="p-6">
          <div className="flex items-baseline gap-2">
            <span className="text-slate-500 text-sm">FOB</span>
            <span className="text-2xl font-bold text-teal-600">
              $ {fobPriceUsd != null ? Number(fobPriceUsd).toFixed(2) : "—"}
            </span>
            <span className="text-slate-500 text-sm">USD</span>
          </div>
          {customerName && (
            <p className="mt-3 text-sm text-slate-500">
              Prepared for <span className="text-slate-700 font-medium">{customerName}</span>
            </p>
          )}
          <p className="mt-4 text-xs text-slate-400">View details at link · Powered by 1039 Quote Radar</p>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="mt-4 w-full rounded-none bg-emerald-600 py-3 px-4 min-h-[48px] text-white font-medium hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        {loading ? "Saving…" : "Save as image"}
      </button>
    </div>
  );
}
