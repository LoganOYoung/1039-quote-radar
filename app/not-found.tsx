import Link from "next/link";
import { Radar } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <Radar className="w-12 h-12 text-emerald-400 mb-4" />
      <h1 className="text-xl font-bold mb-2">页面不存在</h1>
      <p className="text-slate-400 text-sm mb-6">报价链接可能已失效或地址有误。</p>
      <Link
        href="/"
        className="rounded-lg bg-emerald-600 px-6 py-3 text-white font-medium hover:bg-emerald-500"
      >
        返回首页
      </Link>
    </main>
  );
}
