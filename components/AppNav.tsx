"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, FileText } from "lucide-react";

const navItems = [
  { href: "/", label: "首页", icon: Home },
  { href: "/dashboard", label: "仪表盘", icon: LayoutDashboard },
  { href: "/quote/new", label: "新建报价", icon: FileText },
] as const;

export default function AppNav() {
  const pathname = usePathname();
  const showNav =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname === "/quote/new";

  if (!showNav) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom), 8px)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
      aria-label="主导航"
    >
      <div className="flex items-center justify-around h-14 min-h-[56px]">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] rounded-lg transition-colors ${
                isActive
                  ? "text-emerald-400"
                  : "text-slate-400 hover:text-slate-200 active:bg-slate-800/50"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="w-6 h-6 shrink-0" aria-hidden />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
