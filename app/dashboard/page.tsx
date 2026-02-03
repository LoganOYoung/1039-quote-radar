import Link from "next/link";
import { Radar, FileText, ExternalLink, Eye, AlertTriangle, Activity, Image, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import GrantAccessButton from "@/components/GrantAccessButton";

export const dynamic = "force-dynamic";

function formatTimeAgo(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (sec < 60) return "刚刚";
  if (sec < 3600) return `${Math.floor(sec / 60)} 分钟前`;
  if (sec < 86400) return `${Math.floor(sec / 3600)} 小时前`;
  return d.toLocaleDateString("zh-CN");
}

export default async function DashboardPage() {
  const { data: quotes, error } = await supabase
    .from("quotes")
    .select("id, short_id, product_name, customer_name, views_count, created_at, access_controlled")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <p className="text-red-400">加载失败：{error.message}</p>
        <p className="text-slate-400 text-sm mt-2">请检查 Supabase 配置与 schema.sql 是否已执行。</p>
      </main>
    );
  }

  const quoteIds = (quotes || []).map((q) => q.id);
  const ipCountByQuote: Record<string, number> = {};
  let pendingAccessByQuote: Record<string, Array<{ id: string; session_token: string; location_city: string | null; created_at: string }>> = {};
  let recentLogs: Array<{
    product_name: string;
    location_city: string | null;
    viewed_at: string;
    duration_seconds: number | null;
  }> = [];

  if (quoteIds.length > 0) {
    const { data: pendingRequests } = await supabase
      .from("quote_access_requests")
      .select("id, quote_id, session_token, location_city, created_at")
      .in("quote_id", quoteIds)
      .eq("status", "pending");
    if (pendingRequests) {
      for (const r of pendingRequests) {
        if (!pendingAccessByQuote[r.quote_id]) pendingAccessByQuote[r.quote_id] = [];
        pendingAccessByQuote[r.quote_id].push({
          id: r.id,
          session_token: r.session_token,
          location_city: r.location_city,
          created_at: r.created_at,
        });
      }
    }
    const { data: logs } = await supabase
      .from("quote_logs")
      .select("quote_id, ip_address, location_city, viewed_at, duration_seconds")
      .in("quote_id", quoteIds);

    if (logs) {
      const distinctIpsByQuote: Record<string, Set<string>> = {};
      for (const log of logs) {
        if (!distinctIpsByQuote[log.quote_id]) distinctIpsByQuote[log.quote_id] = new Set();
        if (log.ip_address) distinctIpsByQuote[log.quote_id].add(log.ip_address);
      }
      for (const id of quoteIds) {
        ipCountByQuote[id] = distinctIpsByQuote[id]?.size ?? 0;
      }
    }

    const { data: feedLogs } = await supabase
      .from("quote_logs")
      .select("quote_id, location_city, viewed_at, duration_seconds, quotes(product_name)")
      .order("viewed_at", { ascending: false })
      .limit(20);

    if (feedLogs) {
      type Row = {
        quote_id: string;
        location_city: string | null;
        viewed_at: string;
        duration_seconds: number | null;
        quotes: { product_name: string } | { product_name: string }[] | null;
      };
      recentLogs = (feedLogs as unknown as Row[])
        .filter((l) => {
          const q = l.quotes;
          return Array.isArray(q) ? q[0]?.product_name : q?.product_name;
        })
        .map((l) => {
          const q = l.quotes;
          const name = Array.isArray(q) ? q[0]?.product_name : q?.product_name;
          return {
            product_name: name || "",
            location_city: l.location_city,
            viewed_at: l.viewed_at,
            duration_seconds: l.duration_seconds,
          };
        });
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white">
            <span className="relative inline-flex">
              <Radar className="w-8 h-8 text-emerald-400 animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            </span>
            <span className="text-xl font-bold">1039报价雷达</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-sm text-slate-500 hover:text-slate-300"
            >
              数据看板
            </Link>
            <Link
              href="/quote/new"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              <FileText className="w-4 h-4" />
              新建报价
            </Link>
          </div>
        </header>

        {/* Feed 流：刚刚 · 你的 xx 报价在 xx 被打开 */}
        {recentLogs.length > 0 && (
          <section className="mb-6 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-3">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">实时动态</span>
            </div>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {recentLogs.map((log, i) => (
                <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                  <span className="text-slate-500 shrink-0">{formatTimeAgo(log.viewed_at)}</span>
                  <span>
                    你的「{log.product_name}」报价在{" "}
                    <span className="text-emerald-400">{log.location_city || "未知"}</span> 被打开
                    {log.duration_seconds != null && log.duration_seconds > 0 && (
                      <span className="text-slate-500">，停留 {log.duration_seconds} 秒</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <h2 className="text-lg font-semibold text-slate-200 mb-4">报价列表</h2>

        {!quotes || quotes.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-8 text-center text-slate-400">
            <p>暂无报价单</p>
            <Link href="/quote/new" className="mt-3 inline-block text-emerald-400 hover:underline">
              去生成第一条报价链接 →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {quotes.map((q) => {
              const distinctIps = ipCountByQuote[q.id] ?? 0;
              const isMultiIp = distinctIps >= 2;
              return (
                <li
                  key={q.id}
                  className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3 ${
                    isMultiIp ? "border-red-500/50 bg-red-950/20" : "border-slate-700 bg-slate-900/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-200 truncate flex items-center gap-2">
                      {q.product_name}
                      {q.access_controlled && (
                        <span className="inline-flex items-center gap-0.5 text-xs text-slate-500">
                          <Lock className="w-3.5 h-3.5" /> 受控
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {q.customer_name || "—"} · {new Date(q.created_at).toLocaleString("zh-CN")}
                    </p>
                    {(pendingAccessByQuote[q.id]?.length ?? 0) > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-amber-400">待授权 ({pendingAccessByQuote[q.id].length})</p>
                        {pendingAccessByQuote[q.id].map((req) => (
                          <div key={req.id} className="flex items-center justify-between gap-2 text-xs text-slate-400">
                            <span>{req.location_city || "未知"} · {formatTimeAgo(req.created_at)}</span>
                            <GrantAccessButton requestId={req.session_token} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {isMultiIp && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-500/20 text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        可能已被转发比价
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        (q.views_count ?? 0) > 0
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-slate-600/50 text-slate-400"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {(q.views_count ?? 0) > 0 ? "已读" : "未读"} ({q.views_count ?? 0})
                    </span>
                    <a
                      href={`${baseUrl}/view/${q.short_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                      链接
                    </a>
                    <Link
                      href={`/share/${q.short_id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      <Image className="w-4 h-4" />
                      长图
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
