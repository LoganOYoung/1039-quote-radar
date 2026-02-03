"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Radar, Copy, Check, Sparkles } from "lucide-react";
import { parsePasteText } from "@/lib/parse-paste";
import { createQuote } from "@/lib/quote-actions";
import { calcFobUsd } from "@/lib/calc";

export default function QuoteNewPage() {
  const [paste, setPaste] = useState("");
  const [productName, setProductName] = useState("");
  const [exwPrice, setExwPrice] = useState("");
  const [profitMargin, setProfitMargin] = useState("15");
  const [customerName, setCustomerName] = useState("");
  const [tradeMode, setTradeMode] = useState<"1039" | "general">("1039");
  const [exchangeRate, setExchangeRate] = useState("7.25");
  const [lockRate, setLockRate] = useState(true);
  const [accessControlled, setAccessControlled] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleParse = useCallback(() => {
    if (!paste.trim()) return;
    const parsed = parsePasteText(paste);
    setProductName(parsed.productName);
    if (parsed.unitPrice != null) setExwPrice(String(parsed.unitPrice));
    if (parsed.customerName) setCustomerName(parsed.customerName);
  }, [paste]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const exw = parseFloat(exwPrice);
    const margin = parseFloat(profitMargin);
    const rate = parseFloat(exchangeRate);
    if (isNaN(exw) || exw <= 0 || !productName.trim()) {
      setError("请填写产品名和有效出厂价");
      setLoading(false);
      return;
    }
    const res = await createQuote({
      productName: productName.trim(),
      exwPrice: exw,
      profitMargin: isNaN(margin) ? 15 : margin,
      customerName: customerName.trim() || undefined,
      tradeMode,
      exchangeRate: isNaN(rate) ? 7.25 : rate,
      exchangeRateLocked: lockRate ? (isNaN(rate) ? 7.25 : rate) : undefined,
      accessControlled: accessControlled || undefined,
    });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    const base = typeof window !== "undefined" ? window.location.origin : "";
    setGeneratedLink(`${base}/view/${res.shortId}`);
  };

  const copyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exwNum = parseFloat(exwPrice);
  const marginNum = parseFloat(profitMargin);
  const rateNum = parseFloat(exchangeRate);
  const fobPreview =
    !isNaN(exwNum) && exwNum > 0
      ? calcFobUsd(exwNum, isNaN(marginNum) ? 15 : marginNum, isNaN(rateNum) ? 7.25 : rateNum)
      : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-2 mb-6">
          <Link href="/" className="text-slate-400 hover:text-white">
            <Radar className="w-8 h-8 text-emerald-400" />
          </Link>
          <h1 className="text-xl font-bold">生成报价链接</h1>
        </header>

        {/* 智能粘贴区 */}
        <section className="mb-6 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">智能粘贴</span>
          </div>
          <textarea
            placeholder="粘贴微信聊天、产品描述、工厂清单… 自动识别产品名、单价、客户名"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            className="w-full h-28 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 placeholder-slate-500 p-3 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleParse}
            disabled={!paste.trim()}
            className="mt-2 rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            解析并填入下方
          </button>
        </section>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">产品名称 *</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-emerald-500"
              placeholder="如：筋膜枪 2000mAh"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">EXW 单价 (元) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={exwPrice}
                onChange={(e) => setExwPrice(e.target.value)}
                required
                className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-emerald-500"
                placeholder="出厂价"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">利润率 (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">客户名（可选）</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white p-3 focus:ring-2 focus:ring-emerald-500"
              placeholder="用于备注"
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">贸易模式</span>
              <select
                value={tradeMode}
                onChange={(e) => setTradeMode(e.target.value as "1039" | "general")}
                className="rounded-lg bg-slate-800 border border-slate-600 text-white px-3 py-2"
              >
                <option value="1039">1039 模式</option>
                <option value="general">一般贸易</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mr-2">汇率</label>
              <input
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-20 rounded-lg bg-slate-800 border border-slate-600 text-white px-3 py-2"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={lockRate}
                onChange={(e) => setLockRate(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-emerald-500"
              />
              锁定汇率（报价页展示锚定汇率）
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={accessControlled}
                onChange={(e) => setAccessControlled(e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-emerald-500"
              />
              受控访问（客户申请后才显示价格）
            </label>
          </div>
          {fobPreview != null && (
            <p className="text-sm text-slate-400">
              预估 FOB 价：<span className="text-emerald-400 font-medium">${fobPreview} USD</span>
            </p>
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-3 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? "生成中…" : "生成报价链接"}
          </button>
        </form>

        {/* 生成结果 */}
        {generatedLink && (
          <section className="mt-6 rounded-xl border border-emerald-700 bg-emerald-950/30 p-4">
            <p className="text-sm text-slate-400 mb-2">专业报价链接（发给客户即可，打开即被记录）</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 p-3 text-sm"
              />
              <button
                type="button"
                onClick={copyLink}
                className="rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-500 flex items-center gap-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <Link href="/dashboard" className="inline-block mt-3 text-sm text-emerald-400 hover:underline">
              去仪表盘查看动态 →
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
