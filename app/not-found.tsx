import Link from "next/link";
import { Radar } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-white text-slate-800 flex flex-col items-center justify-center p-6">
      <Radar className="w-12 h-12 text-slate-300 mb-4" aria-hidden />
      <h1 className="text-xl font-bold text-slate-900 mb-2">Page not found</h1>
      <p className="text-slate-500 text-sm mb-6">This link may have expired or the address is incorrect.</p>
      <Link
        href="/"
        className="rounded-none bg-emerald-600 px-6 py-3 text-white font-medium shadow-sm hover:bg-emerald-500"
      >
        Back to home
      </Link>
    </main>
  );
}
