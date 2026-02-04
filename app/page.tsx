import Link from "next/link";
import {
  Radar,
  FileText,
  Zap,
  Link2,
  Bell,
  Eye,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import HomeMobileCarousel from "@/components/HomeMobileCarousel";

const valueItems: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: Zap,
    title: "智能粘贴，快速生成",
    desc: "粘贴微信聊天、产品描述或工厂清单，自动识别产品名、单价、客户名，几步即可生成报价链接",
  },
  {
    icon: Link2,
    title: "专业报价页，独立链接",
    desc: "每条报价独立页面展示产品与价格，公司名与 Logo 可自定义，发链接给客户即可",
  },
  {
    icon: Bell,
    title: "客户打开即提醒",
    desc: "客户一点开链接，你可通过飞书或企微收到通知，随时掌握谁在查看",
  },
  {
    icon: Eye,
    title: "可选受控查看",
    desc: "需要时可设为「客户申请、你同意后才显示价格」，适合敏感报价场景",
  },
  {
    icon: BarChart3,
    title: "锚定汇率与我的报价",
    desc: "报价页可展示你设定的汇率；我的报价可查看每条报价的打开次数、访问来源与待授权申请",
  },
];

export default function HomePage() {
  return (
    <>
      {/* 手机端：左滑三屏 + 小圆点 + 仅最后一屏显示底部按钮 */}
      <main
        className="sm:hidden w-full h-dvh bg-white text-slate-800 flex flex-col overflow-hidden"
        style={{
          paddingBottom: "max(10rem, calc(10rem + env(safe-area-inset-bottom)))",
        }}
      >
        <HomeMobileCarousel />
      </main>

      {/* 桌面端：保持单页滚动，不做左滑 */}
      <main
        className="hidden sm:flex w-full bg-white flex-col items-center px-4 sm:px-6 pt-12 sm:pt-16 pb-24 text-slate-800"
        style={{
          paddingBottom: "max(5.5rem, calc(5.5rem + env(safe-area-inset-bottom)))",
          minHeight: "100dvh",
        }}
      >
        <div className="w-full max-w-xl flex flex-col items-center flex-1">
          <section
            className="w-full flex flex-col items-center text-center mb-10 sm:mb-12"
            aria-label="产品介绍"
          >
            <div className="flex items-center justify-center gap-2.5 mb-3">
              <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                <Radar className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                1039报价雷达
              </h1>
            </div>
            <p className="text-slate-600 text-base sm:text-lg max-w-md mb-6 sm:mb-8 leading-relaxed">
              专业报价链接，客户一点开你都知道
            </p>
            <p className="text-slate-400 text-xs sm:block hidden">
              支持「添加到主屏幕」，像 App 一样使用
            </p>
          </section>

          <section className="w-full sm:mb-10" aria-label="工具与价值">
            <ul className="w-full space-y-4 text-left">
              {valueItems.map(({ icon: Icon, title, desc }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 sm:gap-4 rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-3.5 sm:px-5 sm:py-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm sm:text-base">{title}</p>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="w-full flex justify-center mt-8 sm:mt-10 pb-4">
            <Link
              href="/quote/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 min-h-[48px] text-white text-base font-medium shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition-colors w-full sm:w-auto"
            >
              <FileText className="h-5 w-5 shrink-0" aria-hidden />
              生成报价链接
            </Link>
          </div>
          <p className="text-slate-400 text-xs mt-4 pb-6">
            支持「添加到主屏幕」，像 App 一样使用
          </p>
        </div>
      </main>
    </>
  );
}
