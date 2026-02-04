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
      <main
        className="w-full bg-white flex flex-col items-center px-4 sm:px-6 pt-12 sm:pt-16 pb-24 text-slate-800"
        style={{
          paddingBottom: "max(11rem, calc(11rem + env(safe-area-inset-bottom)))",
          minHeight: "100dvh",
        }}
      >
        <div className="w-full max-w-xl flex flex-col items-center flex-1">
          {/* 第一屏：品牌 + 一句话价值 */}
          <section
            className="w-full flex flex-col items-center text-center mb-10 sm:mb-14 min-h-[50dvh] sm:min-h-0 justify-center sm:justify-start"
            aria-label="产品介绍"
          >
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                <Radar className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                1039报价雷达
              </h1>
            </div>
            <p className="text-slate-600 text-base sm:text-lg font-medium max-w-md mb-6 sm:mb-8">
              专业报价链接，客户一点开你都知道
            </p>
            <p className="text-slate-400 text-xs sm:block hidden">
              支持「添加到主屏幕」，像 App 一样使用
            </p>
          </section>

          {/* 第二屏：工具、功能与价值（正向表述，不引起顾虑） */}
          <section className="w-full sm:mb-8" aria-label="工具与价值">
            <ul className="w-full space-y-4 sm:space-y-5 text-left">
              {valueItems.map(({ icon: Icon, title, desc }) => (
                <li
                  key={title}
                  className="flex items-start gap-3 sm:gap-4 rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 sm:px-5 sm:py-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{title}</p>
                    <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* 桌面端：按钮在流式布局内 */}
          <div className="w-full flex justify-center mt-8 sm:mt-10 pb-4 hidden sm:flex">
            <Link
              href="/quote/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 min-h-[48px] text-white text-base font-medium shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 active:bg-emerald-700 transition-colors w-full sm:w-auto"
            >
              <FileText className="h-5 w-5 shrink-0" aria-hidden />
              生成报价链接
            </Link>
          </div>
          <p className="text-slate-400 text-xs mt-4 pb-6 hidden sm:block">
            支持「添加到主屏幕」，像 App 一样使用
          </p>
        </div>
      </main>

      {/* 手机端：生成报价按钮固定在底部导航上方，不遮挡导航 */}
      <div
        className="fixed left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur sm:hidden"
        style={{
          bottom: "max(3.5rem, calc(3.5rem + env(safe-area-inset-bottom)))",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
          paddingTop: "8px",
          paddingBottom: "8px",
        }}
      >
        <div className="px-4 py-3 flex justify-center">
          <Link
            href="/quote/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 min-h-[48px] text-white text-base font-medium shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 active:bg-emerald-700 transition-colors w-full max-w-sm"
          >
            <FileText className="h-5 w-5 shrink-0" aria-hidden />
            生成报价链接
          </Link>
        </div>
      </div>
    </>
  );
}
