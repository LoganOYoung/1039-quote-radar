"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

type Props = {
  productName: string;
  fobPriceUsd: number | null;
  link: string;
  className?: string;
};

export default function CopyShareScriptButton({ productName, fobPriceUsd, link, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const pricePart = fobPriceUsd != null ? `, FOB $${Number(fobPriceUsd).toFixed(2)} USD` : "";
    const text = `Quote: ${(productName || "Product").trim()}${pricePart}. View details: ${link}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={className}
      title="Copy with message (paste to WeChat/WhatsApp)"
    >
      {copied ? (
        <span className="text-emerald-400 text-xs">Copied</span>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 inline-block mr-0.5" aria-hidden />
          <span className="text-xs">Copy message</span>
        </>
      )}
    </button>
  );
}
