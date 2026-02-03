import Link from "next/link";
import { Radar, FileText, LayoutDashboard, Lock, TrendingUp, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="flex items-center justify-center gap-2">
          <Radar className="w-10 h-10 text-emerald-400" />
          <h1 className="text-2xl font-bold">1039报价雷达</h1>
        </div>
        <p className="text-slate-300 text-sm font-medium">
          怕报价发出去就成了同行的参照物？
        </p>
        <p className="text-slate-400 text-sm">
          1039报价雷达为您加装：
        </p>
        <ul className="text-left space-y-3 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-200">价格防护锁：</strong>客户点申请，你点同意，价格才显示。</span>
          </li>
          <li className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-200">汇率平衡器：</strong>汇率大跌？系统锚定汇率，再也不怕结汇亏损。</span>
          </li>
          <li className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong className="text-slate-200">同行防火墙：</strong>自动拦截异常访问，保护您的商业机密。</span>
          </li>
        </ul>
        <p className="text-slate-500 text-xs">
          粘贴截图或文字，一键生成专业报价链接；客户点开，你秒知道。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/quote/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-white font-medium hover:bg-emerald-500 transition"
          >
            <FileText className="w-5 h-5" />
            生成报价链接
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-600 px-6 py-3 text-slate-300 font-medium hover:bg-slate-800 transition"
          >
            <LayoutDashboard className="w-5 h-5" />
            仪表盘
          </Link>
        </div>
      </div>
    </main>
  );
}
