"use client";

import { useRef, useState, useEffect } from "react";
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
  { icon: Zap, title: "智能粘贴，快速生成", desc: "粘贴微信聊天、产品描述或工厂清单，自动识别产品名、单价、客户名，几步即可生成报价链接" },
  { icon: Link2, title: "专业报价页，独立链接", desc: "每条报价独立页面展示产品与价格，公司名与 Logo 可自定义，发链接给客户即可" },
  { icon: Bell, title: "客户打开即提醒", desc: "客户一点开链接，你可通过飞书或企微收到通知，随时掌握谁在查看" },
  { icon: Eye, title: "可选受控查看", desc: "需要时可设为「客户申请、你同意后才显示价格」，适合敏感报价场景" },
  { icon: BarChart3, title: "锚定汇率与我的报价", desc: "报价页可展示你设定的汇率；我的报价可查看每条报价的打开次数、访问来源与待授权申请" },
];

const PANELS = 3;

export default function HomeMobileCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const width = el.clientWidth;
      const index = Math.round(el.scrollLeft / width);
      setCurrentIndex(Math.min(index, PANELS - 1));
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const width = el.clientWidth;
    el.scrollTo({ left: index * width, behavior: "smooth" });
  };

  return (
    <div className="h-full flex flex-col sm:hidden">
      {/* 横向滑动容器：三屏 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth flex w-full"
        style={{ WebkitOverflowScrolling: "touch" }}
        aria-label="产品介绍与功能"
      >
        {/* 第一屏：仅品牌 + 副标题 */}
        <section
          className="min-w-full w-full flex-shrink-0 snap-start flex flex-col items-center justify-center text-center px-4 py-12"
          aria-label="品牌"
        >
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
              <Radar className="h-6 w-6" aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              1039报价雷达
            </h1>
          </div>
          <p className="text-slate-600 text-base max-w-md leading-relaxed">
            专业报价链接，客户一点开你都知道
          </p>
        </section>

        {/* 第二屏：前三个功能卡片 */}
        <section
          className="min-w-full w-full flex-shrink-0 snap-start flex flex-col px-4 py-8 overflow-y-auto"
          aria-label="功能概览"
        >
          <ul className="w-full max-w-md mx-auto space-y-4">
            {valueItems.slice(0, 3).map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-3.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{title}</p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 第三屏：后两个功能卡片 + 主操作区域（底部留白避免被固定按钮遮挡） */}
        <section
          className="min-w-full w-full flex-shrink-0 snap-start flex flex-col px-4 py-8 pb-24 overflow-y-auto"
          aria-label="更多能力与操作"
        >
          <ul className="w-full max-w-md mx-auto space-y-4">
            {valueItems.slice(3, 5).map(({ icon: Icon, title, desc }) => (
              <li
                key={title}
                className="flex items-start gap-3 rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-3.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{title}</p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-slate-400 text-xs mt-6 text-center max-w-md mx-auto">
            支持「添加到主屏幕」，像 App 一样使用
          </p>
        </section>
      </div>

      {/* 小圆点指示：仅手机端 */}
      <div
        className="flex justify-center gap-2 py-3 sm:hidden"
        role="tablist"
        aria-label="第 1 至 3 屏"
      >
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            role="tab"
            aria-selected={currentIndex === i}
            aria-label={`第 ${i + 1} 屏`}
            className={`h-2 rounded-full transition-all ${
              currentIndex === i ? "w-6 bg-emerald-500" : "w-2 bg-slate-300"
            }`}
          />
        ))}
      </div>

      {/* 仅最后一屏显示：生成报价链接按钮（固定在底部导航上方） */}
      {currentIndex === 2 && (
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-8 py-4 min-h-[48px] text-white text-base font-medium shadow-sm hover:bg-emerald-500 active:bg-emerald-700 transition-colors w-full max-w-sm"
            >
              <FileText className="h-5 w-5 shrink-0" aria-hidden />
              生成报价链接
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
