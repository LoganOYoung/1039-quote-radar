"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { FileDown, Image } from "lucide-react";

type Props = { children: React.ReactNode };

export default function QuoteExportActions({ children }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState<"pdf" | "image" | null>(null);

  const handlePrint = () => {
    setSaving("pdf");
    window.print();
    setSaving(null);
  };

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setSaving("image");
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "quotation.png";
      a.click();
    } catch (e) {
      console.error(e);
    }
    setSaving(null);
  };

  return (
    <div className="relative">
      <div ref={cardRef} className="print:shadow-none">
        {children}
      </div>
      <div className="flex flex-wrap gap-2 mt-4 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          disabled={!!saving}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white shadow-sm px-4 py-3 min-h-[48px] text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50"
        >
          <FileDown className="w-4 h-4" aria-hidden />
          Save as PDF
        </button>
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={!!saving}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white shadow-sm px-4 py-3 min-h-[48px] text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50"
        >
          <Image className="w-4 h-4" aria-hidden />
          {saving === "image" ? "Saving…" : "Save as image"}
        </button>
      </div>
    </div>
  );
}
