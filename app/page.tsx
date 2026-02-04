import Link from "next/link";
import { Radar, FileText, Lock, TrendingUp, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <main
      className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16 text-slate-800"
      style={{ paddingBottom: "max(5.5rem, calc(5.5rem + env(safe-area-inset-bottom)))" }}
    >
      <div className="w-full max-w-xl flex flex-col items-center text-center">
        {/* Logo + 品牌 */}
        <div className="flex items-center justify-center gap-2.5 mb-2">
          <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
            <Radar className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            1039报价雷达
          </h1>
        </div>
        <p className="text-slate-500 text-sm sm:text-base mb-10 sm:mb-12">
          报价可防、可追踪，客户一点开你都知道
        </p>

        {/* 三个能力：卡片式，浅色背景 */}
        <ul className="w-full space-y-3 sm:space-y-4 mb-10 sm:mb-12 text-left">
          {[
            {
              icon: Lock,
              title: "价格防护锁",
              desc: "客户申请、你同意后才显示价格，避免被转发比价",
            },
            {
              icon: TrendingUp,
              title: "汇率平衡器",
              desc: "锚定汇率展示，结汇不心慌",
            },
            {
              icon: Shield,
              title: "同行防火墙",
              desc: "异常访问提醒，保护商业机密",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="flex items-start gap-3 sm:gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 sm:px-5 sm:py-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              </span>
              <div>
                <p className="font-medium text-slate-900">{title}</p>
                <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* CTA：底栏已有「仪表盘」「新建报价」，入口只保留主操作 */}
        <div className="w-full flex justify-center">
          <Link
            href="/quote/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 min-h-[48px] text-white text-base font-medium shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 active:bg-emerald-700 transition-colors w-full sm:w-auto"
          >
            <FileText className="h-5 w-5 shrink-0" aria-hidden />
            生成报价链接
          </Link>
        </div>

        <p className="text-slate-400 text-xs mt-8 sm:mt-10">
          支持「添加到主屏幕」，像 App 一样使用
        </p>
      </div>
    </main>
  );
}
