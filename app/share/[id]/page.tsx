import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ShareCardDownload from "./ShareCardDownload";
import CopyShareScriptButton from "@/components/CopyShareScriptButton";

type Props = { params: Promise<{ id: string }> };

export default async function SharePage({ params }: Props) {
  const { id: shortId } = await params;
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("product_name, fob_price_usd, customer_name")
    .eq("short_id", shortId)
    .single();

  if (error || !quote) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://1039-quote-radar.vercel.app";
  const viewLink = `${baseUrl.replace(/\/$/, "")}/view/${shortId}`;

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <p className="text-center text-slate-600 text-sm mb-4">
          分享到微信 / 朋友圈：保存为图片后直接发送，或复制带话术粘贴到聊天
        </p>
        <ShareCardDownload
          productName={quote.product_name}
          fobPriceUsd={quote.fob_price_usd != null ? Number(quote.fob_price_usd) : null}
          customerName={quote.customer_name}
        />
        <div className="mt-4 flex justify-center">
          <CopyShareScriptButton
            productName={quote.product_name}
            fobPriceUsd={quote.fob_price_usd != null ? Number(quote.fob_price_usd) : null}
            link={viewLink}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 min-h-[48px] text-sm text-slate-700 hover:bg-slate-50"
          />
        </div>
        <p className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm text-emerald-600 hover:underline">
            返回我的报价
          </Link>
        </p>
      </div>
    </main>
  );
}
