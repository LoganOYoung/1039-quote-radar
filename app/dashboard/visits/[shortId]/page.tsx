import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ shortId: string }> };

function maskIp(ip: string | null): string {
  if (!ip || ip === "127.0.0.1") return "—";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.***`;
  return "***";
}

export default async function QuoteVisitsPage({ params }: Props) {
  const { shortId } = await params;

  const { data: quote, error: quoteError } = await supabase
    .from("quotes")
    .select("id, short_id, product_name")
    .eq("short_id", shortId)
    .single();

  if (quoteError || !quote) notFound();

  const { data: logs, error: logsError } = await supabase
    .from("quote_logs")
    .select("viewed_at, location_city, duration_seconds, ip_address")
    .eq("quote_id", quote.id)
    .order("viewed_at", { ascending: false })
    .limit(100);

  if (logsError) {
    return (
      <main className="min-h-screen bg-white text-slate-800 p-6">
        <p className="text-red-600">加载访问记录失败</p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-white text-slate-800 px-3 py-4 sm:p-4 md:p-6"
      style={{ paddingBottom: "max(5.5rem, calc(5.5rem + env(safe-area-inset-bottom)))" }}
    >
      <div className="max-w-2xl mx-auto min-w-0">
        <header className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </Link>
        </header>

        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-slate-500" />
          <h1 className="text-lg font-semibold text-slate-900">访问明细</h1>
        </div>
        <p className="text-sm text-slate-500 mb-6 truncate">报价：{quote.product_name || "—"}</p>

        {!logs || logs.length === 0 ? (
          <div className="rounded-none border border-slate-200 bg-white shadow-sm p-8 text-center text-slate-500">
            <p>暂无访问记录</p>
            <p className="text-xs mt-1">客户打开报价链接后会显示在这里</p>
          </div>
        ) : (
          <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-left">
                    <th className="p-3 font-medium">时间</th>
                    <th className="p-3 font-medium">地区</th>
                    <th className="p-3 font-medium">停留</th>
                    <th className="p-3 font-medium">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="p-3 text-slate-700 whitespace-nowrap">
                        {new Date(log.viewed_at).toLocaleString("zh-CN")}
                      </td>
                      <td className="p-3 text-slate-800 font-medium">
                        {log.location_city?.trim() || "未知"}
                      </td>
                      <td className="p-3 text-slate-600">
                        {log.duration_seconds != null && log.duration_seconds > 0
                          ? `${log.duration_seconds} 秒`
                          : "—"}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-xs">
                        {maskIp(log.ip_address)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
