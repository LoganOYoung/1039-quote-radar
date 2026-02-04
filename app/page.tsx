import Link from "next/link";
import { Radar, FileText, LayoutDashboard, Lock, TrendingUp, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* 首屏：移动端优先，主 CTA 一屏内可见 */}
      <div className="w-full max-w-lg flex flex-col items-center text-center space-y-6 sm:space-y-8">
        <div className="flex items-center justify-center gap-2">
          <Radar className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 shrink-0" aria-hidden />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100">1039报价雷达</h1>
        </div>

        <p className="text-slate-300 text-base sm:text-sm font-medium leading-relaxed">
          怕报价发出去就成了同行的参照物？
        </p>
        <p className="text-slate-400 text-base sm:text-sm leading-relaxed">
          1039报价雷达为您加装：
        </p>

        <ul className="w-full text-left space-y-4 text-base sm:text-sm text-slate-300">
          <li className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
            <span>
              <strong className="text-slate-200">价格防护锁：</strong>
              客户点申请，你点同意，价格才显示。
            </span>
          </li>
          <li className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
            <span>
              <strong className="text-slate-200">汇率平衡器：</strong>
              汇率大跌？系统锚定汇率，再也不怕结汇亏损。
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
            <span>
              <strong className="text-slate-200">同行防火墙：</strong>
              自动拦截异常访问，保护您的商业机密。
            </span>
          </li>
        </ul>

        <p className="text-slate-500 text-sm sm:text-xs">
          粘贴截图或文字，一键生成专业报价链接；客户点开，你秒知道。
        </p>

        {/* 双 CTA：移动端大按钮、全宽、≥44px 高，间距防误触 */}
        <div className="w-full flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 pt-2">
          <Link
            href="/quote/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 min-h-[48px] text-white text-base font-medium hover:bg-emerald-500 active:bg-emerald-700 transition-colors w-full sm:w-auto"
          >
            <FileText className="w-5 h-5 shrink-0" aria-hidden />
            生成报价链接
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-6 py-4 min-h-[48px] text-slate-300 text-base font-medium hover:bg-slate-800 active:bg-slate-700 transition-colors w-full sm:w-auto"
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" aria-hidden />
            仪表盘
          </Link>
        </div>
      </div>
    </main>
  );
}
