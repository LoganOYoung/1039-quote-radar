import Link from "next/link";
import { Radar, FileText, ExternalLink, Eye, AlertTriangle, Activity, Image, Lock, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import GrantAccessButton from "@/components/GrantAccessButton";
import CopyShareScriptButton from "@/components/CopyShareScriptButton";

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
    .select("id, short_id, product_name, customer_name, fob_price_usd, views_count, created_at, access_controlled")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <main className="min-h-screen bg-white text-slate-800 p-6">
        <p className="text-red-600">加载失败：{error.message}</p>
        <p className="text-slate-500 text-sm mt-2">请检查 Supabase 配置与 schema.sql 是否已执行。</p>
      </main>
    );
  }

  const quoteIds = (quotes || []).map((q) => q.id);
  const ipCountByQuote: Record<string, number> = {};
  const cityCountByQuote: Record<string, number> = {};
  const latestCityByQuote: Record<string, string | null> = {};
  const latestDurationByQuote: Record<string, number | null> = {};
  let pendingAccessByQuote: Record<string, Array<{ id: string; session_token: string; location_city: string | null; created_at: string }>> = {};

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
      const distinctCitiesByQuote: Record<string, Set<string>> = {};
      for (const log of logs) {
        if (!distinctIpsByQuote[log.quote_id]) distinctIpsByQuote[log.quote_id] = new Set();
        if (log.ip_address) distinctIpsByQuote[log.quote_id].add(log.ip_address);
        if (!distinctCitiesByQuote[log.quote_id]) distinctCitiesByQuote[log.quote_id] = new Set();
        const city = (log.location_city || "").trim() || "未知";
        distinctCitiesByQuote[log.quote_id].add(city);
      }
      for (const id of quoteIds) {
        ipCountByQuote[id] = distinctIpsByQuote[id]?.size ?? 0;
        cityCountByQuote[id] = distinctCitiesByQuote[id]?.size ?? 0;
      }
      // 每条报价最近一次访问的停留时长与地区
      const sortedByViewed = [...logs].sort(
        (a, b) => new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime()
      );
      for (const log of sortedByViewed) {
        if (latestDurationByQuote[log.quote_id] == null && log.duration_seconds != null && log.duration_seconds > 0) {
          latestDurationByQuote[log.quote_id] = log.duration_seconds;
        }
        if (latestCityByQuote[log.quote_id] == null && log.location_city?.trim()) {
          latestCityByQuote[log.quote_id] = log.location_city.trim();
        }
      }
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";

  return (
    <main className="min-h-screen bg-white text-slate-800 px-3 py-4 sm:p-4 md:p-6 overflow-x-hidden" style={{ paddingBottom: "max(5.5rem, calc(5.5rem + env(safe-area-inset-bottom)))" }}>
      <div className="max-w-3xl mx-auto min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 min-h-[44px]">
            <span className="relative inline-flex shrink-0">
              <Radar className="w-8 h-8 text-emerald-600" />
            </span>
            <span className="text-lg sm:text-xl font-bold truncate">1039报价雷达</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-sm text-slate-500 hover:text-slate-700 py-2 px-2 min-h-[44px] flex items-center"
            >
              数据看板
            </Link>
            <Link
              href="/quote/new"
              className="inline-flex items-center justify-center gap-2 rounded-none bg-emerald-600 px-4 py-3 min-h-[48px] text-sm font-medium text-white shadow-sm hover:bg-emerald-500 active:bg-emerald-700"
            >
              <FileText className="w-4 h-4 shrink-0" />
              新建报价
            </Link>
          </div>
        </header>

        <div className="mb-4">
          <Link
            href="/databoard"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <Activity className="w-4 h-4" />
            查看数据表盘：动态、建议动作与使用引导
          </Link>
        </div>

        <h2 className="text-lg font-semibold text-slate-900 mb-4">报价列表</h2>

        {!quotes || quotes.length === 0 ? (
          <div className="rounded-none border border-slate-200 bg-white shadow-sm p-10 text-center">
            <p className="text-slate-500 mb-1">暂无报价单</p>
            <p className="text-sm text-slate-400 mb-4">生成一条报价链接，发给我客户即可追踪查看</p>
            <Link href="/quote/new" className="inline-flex items-center justify-center gap-2 rounded-none bg-emerald-600 px-6 py-3 text-white text-sm font-medium shadow-sm hover:bg-emerald-500">
              去生成第一条报价链接
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
                  className={`rounded-none border p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm ${
                    isMultiIp ? "border-red-200 bg-red-50/50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-800 truncate flex items-center gap-2">
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
                    {/* 客户行为：已读/次数、独立人数、地区、最近阅读时长 */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
                      <span className={((q.views_count ?? 0) > 0 ? "text-emerald-600" : "") + " font-medium"}>
                        {(q.views_count ?? 0) > 0 ? "已读" : "未读"} ({q.views_count ?? 0} 次)
                      </span>
                      {distinctIps > 0 && (
                        <span>
                          {distinctIps} 人查看
                          {isMultiIp && (
                            <span className="text-red-600 ml-0.5">（可能转发）</span>
                          )}
                        </span>
                      )}
                      {(cityCountByQuote[q.id] ?? 0) > 0 && (
                        <span>来自 {cityCountByQuote[q.id]} 个地区</span>
                      )}
                      {latestCityByQuote[q.id] && (
                        <span>最近来自 {latestCityByQuote[q.id]}</span>
                      )}
                      {latestDurationByQuote[q.id] != null && latestDurationByQuote[q.id]! > 0 && (
                        <span>停留 {latestDurationByQuote[q.id]} 秒</span>
                      )}
                    </div>
                    {(pendingAccessByQuote[q.id]?.length ?? 0) > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-amber-600">待授权 ({pendingAccessByQuote[q.id].length})</p>
                        {pendingAccessByQuote[q.id].map((req) => (
                          <div key={req.id} className="flex items-center justify-between gap-2 text-xs text-slate-500">
                            <span>{req.location_city || "未知"} · {formatTimeAgo(req.created_at)}</span>
                            <GrantAccessButton requestId={req.session_token} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {isMultiIp && (
                      <span className="inline-flex items-center gap-1 rounded-none px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-600">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        可能已被转发比价
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 rounded-none px-2.5 py-0.5 text-xs font-medium ${
                        (q.views_count ?? 0) > 0
                          ? "bg-emerald-100 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {(q.views_count ?? 0) > 0 ? "已读" : "未读"} ({q.views_count ?? 0})
                    </span>
                    <Link
                      href={`/dashboard/visits/${q.short_id}`}
                      className="inline-flex items-center gap-1 rounded-none border border-slate-200 px-3 py-2 min-h-[44px] text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <MapPin className="w-4 h-4" />
                      访问明细
                    </Link>
                    <a
                      href={`${baseUrl}/view/${q.short_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-none border border-slate-200 px-3 py-2 min-h-[44px] text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <ExternalLink className="w-4 h-4" />
                      链接
                    </a>
                    <Link
                      href={`/share/${q.short_id}`}
                      className="inline-flex items-center gap-1 rounded-none border border-slate-200 px-3 py-2 min-h-[44px] text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Image className="w-4 h-4" />
                      长图
                    </Link>
                    <CopyShareScriptButton
                      productName={q.product_name}
                      fobPriceUsd={q.fob_price_usd != null ? Number(q.fob_price_usd) : null}
                      link={`${baseUrl}/view/${q.short_id}`}
                      className="inline-flex items-center gap-1 rounded-none border border-slate-200 px-3 py-2 min-h-[44px] text-sm text-slate-700 hover:bg-slate-100"
                    />
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
