import { notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ShareCardDownload from "./ShareCardDownload";

type Props = { params: Promise<{ id: string }> };

export default async function SharePage({ params }: Props) {
  const { id: shortId } = await params;
  const { data: quote, error } = await supabase
    .from("quotes")
    .select("product_name, fob_price_usd, customer_name")
    .eq("short_id", shortId)
    .single();

  if (error || !quote) notFound();

  return (
    <main className="min-h-screen bg-slate-100 py-8 px-4">
      <div className="max-w-md mx-auto">
        <p className="text-center text-slate-500 text-sm mb-4">
          分享到微信 / 朋友圈：保存为图片后直接发送
        </p>
        <ShareCardDownload
          productName={quote.product_name}
          fobPriceUsd={quote.fob_price_usd != null ? Number(quote.fob_price_usd) : null}
          customerName={quote.customer_name}
        />
        <p className="mt-6 text-center">
          <Link href="/dashboard" className="text-sm text-emerald-600 hover:underline">
            返回仪表盘
          </Link>
        </p>
      </div>
    </main>
  );
}
