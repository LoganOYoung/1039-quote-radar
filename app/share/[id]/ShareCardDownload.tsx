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
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        style={{ width: 375 }}
      >
        <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
          Quotation
        </h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-gray-500 uppercase tracking-wide text-xs">Product</dt>
            <dd className="font-medium text-gray-900">{productName}</dd>
          </div>
          <div>
            <dt className="text-gray-500 uppercase tracking-wide text-xs">FOB Price (USD)</dt>
            <dd className="font-medium text-lg text-gray-900">
              $ {fobPriceUsd != null ? Number(fobPriceUsd).toFixed(2) : "—"}
            </dd>
          </div>
          {customerName && (
            <div>
              <dt className="text-gray-500 uppercase tracking-wide text-xs">Prepared for</dt>
              <dd className="text-gray-700">{customerName}</dd>
            </div>
          )}
        </dl>
        <p className="mt-4 text-xs text-gray-400">Powered by 1039 Quote Radar</p>
      </div>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-emerald-600 py-3 px-4 text-white font-medium hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        {loading ? "生成中…" : "保存为图片"}
      </button>
    </div>
  );
}
