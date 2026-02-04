import Link from "next/link";
import { Radar, BarChart3, MapPin, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { data: quotes, error: qErr } = await supabase
    .from("quotes")
    .select("id, product_name, fob_price_usd, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  const { data: logs, error: lErr } = await supabase
    .from("quote_logs")
    .select("quote_id, location_city")
    .limit(2000);

  if (qErr || lErr) {
    return (
      <main className="min-h-screen bg-white text-slate-800 p-6">
        <p className="text-red-600">加载失败：{qErr?.message || lErr?.message}</p>
      </main>
    );
  }

  // 品类 × 报价数 × 平均 FOB 价（按 product_name 聚合）
  const byProduct: Record<
    string,
    { count: number; totalFob: number; fobCount: number }
  > = {};
  for (const q of quotes || []) {
    const name = (q.product_name || "").trim() || "未命名";
    if (!byProduct[name]) byProduct[name] = { count: 0, totalFob: 0, fobCount: 0 };
    byProduct[name].count += 1;
    if (q.fob_price_usd != null && !isNaN(Number(q.fob_price_usd))) {
      byProduct[name].totalFob += Number(q.fob_price_usd);
      byProduct[name].fobCount += 1;
    }
  }
  const productRows = Object.entries(byProduct)
    .map(([name, v]) => ({
      name,
      count: v.count,
      avgFob: v.fobCount > 0 ? v.totalFob / v.fobCount : null,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  // 地域 × 访问次数（按 location_city 聚合）
  const byCity: Record<string, number> = {};
  for (const log of logs || []) {
    const city = (log.location_city || "").trim() || "未知";
    byCity[city] = (byCity[city] || 0) + 1;
  }
  const cityRows = Object.entries(byCity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  return (
    <main className="min-h-screen bg-white text-slate-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-900">
            <Radar className="w-8 h-8 text-slate-600" />
            <span className="text-xl font-bold">1039报价雷达</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            返回我的报价
          </Link>
        </header>

        <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-slate-500" />
          后台数据看板
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          品类×价格×地域聚合（脱敏，仅作趋势参考）
        </p>

        <section className="mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-500" />
            品类 × 报价数 × 平均 FOB 价
          </h2>
          <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="p-3 font-medium">产品/品类</th>
                  <th className="p-3 font-medium">报价数</th>
                  <th className="p-3 font-medium">平均 FOB (USD)</th>
                </tr>
              </thead>
              <tbody>
                {productRows.map((row) => (
                  <tr key={row.name} className="border-b border-slate-100">
                    <td className="p-3 text-slate-800 truncate max-w-[200px]" title={row.name}>
                      {row.name}
                    </td>
                    <td className="p-3 text-slate-600">{row.count}</td>
                    <td className="p-3 text-slate-800 font-medium">
                      {row.avgFob != null ? row.avgFob.toFixed(2) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-500" />
            访问地域分布
          </h2>
          <div className="rounded-none border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="p-3 font-medium">地域</th>
                  <th className="p-3 font-medium">访问次数</th>
                </tr>
              </thead>
              <tbody>
                {cityRows.map(([city, count]) => (
                  <tr key={city} className="border-b border-slate-100">
                    <td className="p-3 text-slate-800">{city}</td>
                    <td className="p-3 text-slate-600">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
