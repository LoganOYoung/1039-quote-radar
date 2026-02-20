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
      <div className="flex flex-wrap gap-3 mt-8 print:hidden" role="toolbar" aria-label="Document actions">
        <button
          type="button"
          onClick={handlePrint}
          disabled={!!saving}
          className="inline-flex items-center gap-2 rounded border border-neutral-300 bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 tracking-wide uppercase hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50 transition-colors"
        >
          <FileDown className="w-3.5 h-3.5 shrink-0" aria-hidden />
          Save as PDF
        </button>
        <button
          type="button"
          onClick={handleSaveImage}
          disabled={!!saving}
          className="inline-flex items-center gap-2 rounded border border-neutral-300 bg-white px-4 py-2.5 text-xs font-medium text-neutral-700 tracking-wide uppercase hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50 transition-colors"
        >
          <Image className="w-3.5 h-3.5 shrink-0" aria-hidden />
          {saving === "image" ? "Saving…" : "Save as image"}
        </button>
      </div>
    </div>
  );
}
