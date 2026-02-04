import Link from "next/link";
import { Radar, Activity, Lightbulb, BookOpen, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

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

export default async function DataboardPage() {
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, short_id, product_name")
    .order("created_at", { ascending: false })
    .limit(50);

  const quoteIds = (quotes || []).map((q) => q.id);
  const ipCountByQuote: Record<string, number> = {};
  let recentLogs: Array<{
    product_name: string;
    location_city: string | null;
    viewed_at: string;
    duration_seconds: number | null;
    quote_id: string;
  }> = [];

  if (quoteIds.length > 0) {
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
      .limit(30);

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
            quote_id: l.quote_id,
          };
        });
    }
  }

  const now = Date.now();
  const recentThresholdMs = 30 * 60 * 1000;
  const suggestedFollowUps = recentLogs.filter(
    (l) => now - new Date(l.viewed_at).getTime() < recentThresholdMs
  );
  const multiRegionQuotes = (quotes || []).filter((q) => (ipCountByQuote[q.id] ?? 0) >= 2);

  return (
    <main
      className="min-h-screen bg-white text-slate-800 px-3 py-4 sm:p-4 md:p-6 overflow-x-hidden"
      style={{ paddingBottom: "max(5.5rem, calc(5.5rem + env(safe-area-inset-bottom)))" }}
    >
      <div className="max-w-3xl mx-auto min-w-0">
        <header className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 min-h-[44px]">
            <Radar className="w-8 h-8 text-emerald-600" />
            <span className="text-lg sm:text-xl font-bold truncate">1039报价雷达</span>
          </Link>
        </header>

        <h1 className="text-xl font-semibold text-slate-900 mb-6">数据表盘</h1>

        {/* 建议动作 */}
        {(suggestedFollowUps.length > 0 || multiRegionQuotes.length > 0) && (
          <section className="mb-8 rounded-none border border-slate-200 bg-white shadow-sm p-4 sm:p-5">
            <div className="flex items-center gap-2 text-slate-700 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold">建议动作</span>
            </div>
            <ul className="space-y-3">
              {suggestedFollowUps.slice(0, 5).map((log, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-emerald-600 font-medium shrink-0">跟进</span>
                  <span>
                    「{log.product_name}」刚在 {log.location_city || "未知"} 被打开，建议立刻微信或电话跟进。
                  </span>
                </li>
              ))}
              {multiRegionQuotes.slice(0, 3).map((q) => (
                <li key={q.id} className="text-sm flex items-start gap-2">
                  <span className="text-amber-600 font-medium shrink-0">留意</span>
                  <span>
                    「{q.product_name}」被多地区打开，链接可能已转发比价，谈价时可适当保留空间。
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 实时动态 */}
        <section className="mb-8 rounded-none border border-slate-200 bg-white shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 text-slate-700 mb-3">
            <Activity className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold">实时动态</span>
          </div>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-slate-500">暂无访问记录，客户打开报价链接后会显示在这里。</p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto">
              {recentLogs.map((log, i) => (
                <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="text-slate-500 shrink-0">{formatTimeAgo(log.viewed_at)}</span>
                  <span>
                    你的「{log.product_name}」在{" "}
                    <span className="font-medium text-slate-800">{log.location_city || "未知"}</span> 被打开
                    {log.duration_seconds != null && log.duration_seconds > 0 && (
                      <span className="text-slate-500">，停留 {log.duration_seconds} 秒</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 使用引导 */}
        <section className="rounded-none border border-slate-200 bg-slate-50 shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 text-slate-700 mb-3">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-semibold">数据怎么用</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <strong className="text-slate-800">谁打开、何时打开</strong> → 最佳跟单时机，刚打开就微信/电话跟进，成单概率更高。
            </li>
            <li>
              <strong className="text-slate-800">来自多地区 / 多 IP</strong> → 链接可能被转发比价，报价和谈价时更谨慎。
            </li>
            <li>
              <strong className="text-slate-800">最近来自 [城市]</strong> → 确认是谁在看，对得上客户心里有数，对不上可能是别人转发的。
            </li>
            <li>
              <strong className="text-slate-800">停留时长</strong> → 看一眼就关 vs 看很久，优先跟进停留久的，或对秒关的换话术再推一次。
            </li>
          </ul>
        </section>

        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            去我的报价查看每条明细
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}
