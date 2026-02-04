"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Radar, Copy, Check, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { parsePasteText } from "@/lib/parse-paste";
import { createQuote } from "@/lib/quote-actions";
import {
  getCostBreakdown,
  calcVolumeCbm,
  calcVolumeCbmWithAllowance,
  calcVolumetricWeight,
  getChargeableWeight,
  getCargoType,
  calcDomesticCnyByWeight,
  calcDomesticCnyByVolume,
  calcCfrUsd,
  calcCifUsd,
  getSeaChargeableTon,
  calcSeaFreightCny,
} from "@/lib/calc";

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
  const [shipFrom, setShipFrom] = useState<"yiwu" | "factory">("yiwu");
  const [domesticCny, setDomesticCny] = useState("");
  const [boxL, setBoxL] = useState("");
  const [boxW, setBoxW] = useState("");
  const [boxH, setBoxH] = useState("");
  const [grossWeight, setGrossWeight] = useState("");
  const [domesticChargeType, setDomesticChargeType] = useState<"fixed" | "by_weight" | "by_volume" | "per_container">("fixed");
  const [domesticYuanPerTon, setDomesticYuanPerTon] = useState("");
  const [domesticYuanPerCbm, setDomesticYuanPerCbm] = useState("");
  const [domesticYuanPerContainer, setDomesticYuanPerContainer] = useState("");
  const [volumetricDivisor, setVolumetricDivisor] = useState(6000);
  const [boxAllowanceCm, setBoxAllowanceCm] = useState(0);
  const [showCfrCif, setShowCfrCif] = useState(false);
  const [freightType, setFreightType] = useState<"manual" | "lcl" | "fcl">("manual");
  const [freightUsd, setFreightUsd] = useState("");
  const [surchargeUsd, setSurchargeUsd] = useState("");
  const [insuranceUsd, setInsuranceUsd] = useState("");
  const [seaYuanPerTon, setSeaYuanPerTon] = useState("");
  const [containerType, setContainerType] = useState<"20GP" | "40GP" | "40HQ">("20GP");
  const [containerCount, setContainerCount] = useState("");
  const [yuanPerContainer, setYuanPerContainer] = useState("");
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
    let finalDomesticCny: number | undefined;
    if (tradeMode === "1039") {
      if (domesticChargeType === "fixed") {
        if (shipFrom === "factory") {
          const v = parseFloat(domesticCny);
          finalDomesticCny = !isNaN(v) && v >= 0 ? v : undefined;
        }
      } else if (domesticChargeType === "by_weight") {
        const l = parseFloat(boxL);
        const w = parseFloat(boxW);
        const h = parseFloat(boxH);
        const gw = parseFloat(grossWeight);
        const ypt = parseFloat(domesticYuanPerTon);
        if (l > 0 && w > 0 && h > 0 && gw >= 0 && !isNaN(ypt) && ypt >= 0) {
          const volKg = calcVolumetricWeight(l, w, h, volumetricDivisor);
          const ch = getChargeableWeight(gw, volKg);
          finalDomesticCny = calcDomesticCnyByWeight(ch, ypt);
        }
      } else if (domesticChargeType === "by_volume") {
        const l = parseFloat(boxL);
        const w = parseFloat(boxW);
        const h = parseFloat(boxH);
        const ypc = parseFloat(domesticYuanPerCbm);
        if (l > 0 && w > 0 && h > 0 && !isNaN(ypc) && ypc >= 0) {
          const cbm = calcVolumeCbmWithAllowance(l, w, h, boxAllowanceCm);
          finalDomesticCny = calcDomesticCnyByVolume(cbm, ypc);
        }
      } else if (domesticChargeType === "per_container") {
        const v = parseFloat(domesticYuanPerContainer);
        finalDomesticCny = !isNaN(v) && v >= 0 ? v : undefined;
      }
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
      shipFrom: tradeMode === "1039" ? shipFrom : undefined,
      domesticCny: finalDomesticCny,
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
  const l = parseFloat(boxL);
  const w = parseFloat(boxW);
  const h = parseFloat(boxH);
  const gw = parseFloat(grossWeight);
  const volumeCbm =
    l > 0 && w > 0 && h > 0 ? calcVolumeCbmWithAllowance(l, w, h, boxAllowanceCm) : 0;
  const volumetricKg = l > 0 && w > 0 && h > 0 ? calcVolumetricWeight(l, w, h, volumetricDivisor) : 0;
  const chargeableKg = getChargeableWeight(gw >= 0 ? gw : 0, volumetricKg);
  const cargoType = getCargoType(gw >= 0 ? gw : 0, volumetricKg);

  let domesticCnyForPreview: number | undefined;
  if (tradeMode === "1039") {
    if (domesticChargeType === "fixed") {
      domesticCnyForPreview =
        shipFrom === "factory"
          ? (() => {
              const v = parseFloat(domesticCny);
              return !isNaN(v) && v >= 0 ? v : undefined;
            })()
          : undefined;
    } else if (domesticChargeType === "by_weight") {
      const ypt = parseFloat(domesticYuanPerTon);
      if (chargeableKg > 0 && !isNaN(ypt) && ypt >= 0)
        domesticCnyForPreview = calcDomesticCnyByWeight(chargeableKg, ypt);
    } else if (domesticChargeType === "by_volume") {
      const ypc = parseFloat(domesticYuanPerCbm);
      if (volumeCbm > 0 && !isNaN(ypc) && ypc >= 0)
        domesticCnyForPreview = calcDomesticCnyByVolume(volumeCbm, ypc);
    } else if (domesticChargeType === "per_container") {
      const v = parseFloat(domesticYuanPerContainer);
      domesticCnyForPreview = !isNaN(v) && v >= 0 ? v : undefined;
    }
  }

  const effectiveDomesticCny =
    domesticChargeType !== "fixed" ? (domesticCnyForPreview ?? 0) : domesticCnyForPreview;
  const breakdown =
    tradeMode === "1039" &&
    !isNaN(exwNum) &&
    exwNum > 0
      ? getCostBreakdown(exwNum, isNaN(marginNum) ? 15 : marginNum, isNaN(rateNum) ? 7.25 : rateNum, {
          shipFrom,
          domesticCny: effectiveDomesticCny,
        })
      : null;

  const fobPreview =
    breakdown?.fobUsd ??
    (tradeMode === "general" && !isNaN(exwNum) && exwNum > 0 ? exwNum / (isNaN(rateNum) ? 7.25 : rateNum) : null);

  const freightUsdNum = parseFloat(freightUsd);
  const insuranceUsdNum = parseFloat(insuranceUsd);
  const cfrPreview =
    fobPreview != null && !isNaN(freightUsdNum) && freightUsdNum >= 0 ? calcCfrUsd(fobPreview, freightUsdNum) : null;
  const cifPreview =
    fobPreview != null && !isNaN(freightUsdNum) && freightUsdNum >= 0
      ? calcCifUsd(fobPreview, freightUsdNum, !isNaN(insuranceUsdNum) && insuranceUsdNum >= 0 ? insuranceUsdNum : 0)
      : null;

  const seaYuanPerTonNum = parseFloat(seaYuanPerTon);
  const seaChargeableTon =
    volumeCbm > 0 && gw >= 0 ? getSeaChargeableTon(volumeCbm, gw) : 0;
  const seaFreightCny =
    volumeCbm >= 0 && gw >= 0 && !isNaN(seaYuanPerTonNum) && seaYuanPerTonNum >= 0
      ? calcSeaFreightCny(volumeCbm, gw, seaYuanPerTonNum)
      : 0;
  const seaFreightUsd =
    seaFreightCny > 0 && rateNum > 0 ? Number((seaFreightCny / rateNum).toFixed(2)) : 0;
  const cfrFromSea =
    fobPreview != null && seaFreightUsd > 0 ? calcCfrUsd(fobPreview, seaFreightUsd) : null;

  const containerCountNum = parseFloat(containerCount);
  const yuanPerContainerNum = parseFloat(yuanPerContainer);
  const seaFreightCnyFcl =
    !isNaN(containerCountNum) && containerCountNum > 0 && !isNaN(yuanPerContainerNum) && yuanPerContainerNum >= 0
      ? Number((yuanPerContainerNum * containerCountNum).toFixed(2))
      : 0;
  const seaFreightUsdFcl =
    seaFreightCnyFcl > 0 && rateNum > 0 ? Number((seaFreightCnyFcl / rateNum).toFixed(2)) : 0;
  const cfrFromFcl =
    fobPreview != null && seaFreightUsdFcl > 0 ? calcCfrUsd(fobPreview, seaFreightUsdFcl) : null;

  const surchargeUsdNum = parseFloat(surchargeUsd);
  const surchargeUsdVal =
    !isNaN(surchargeUsdNum) && surchargeUsdNum >= 0 ? surchargeUsdNum : 0;
  const baseFreightUsd =
    freightType === "lcl"
      ? seaFreightUsd
      : freightType === "fcl"
        ? seaFreightUsdFcl
        : !isNaN(freightUsdNum) && freightUsdNum >= 0 ? freightUsdNum : 0;
  const totalFreightSurchargeUsd = baseFreightUsd + surchargeUsdVal;
  const effectiveCfr =
    fobPreview != null
      ? Number(calcCfrUsd(fobPreview, totalFreightSurchargeUsd).toFixed(2))
      : null;
  const effectiveCif =
    effectiveCfr != null
      ? Number((effectiveCfr + Math.max(0, isNaN(insuranceUsdNum) ? 0 : insuranceUsdNum)).toFixed(2))
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
              <p className="text-xs text-slate-500 mb-1.5">请填含税出厂价；若工厂给的是不含税价，请先按「含税价 = 不含税价 × (1 + 税率)」换算后再填。</p>
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

          {tradeMode === "1039" && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-300">箱规与重量（可选，用于按重/按方计国内段）</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-0.5">长 cm</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={boxL}
                    onChange={(e) => setBoxL(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-0.5">宽 cm</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={boxW}
                    onChange={(e) => setBoxW(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-0.5">高 cm</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={boxH}
                    onChange={(e) => setBoxH(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">毛重 kg（计费用毛重）</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  placeholder="—"
                  className="w-24 rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">箱规加量 cm（体积保守报价，可选）</label>
                <select
                  value={boxAllowanceCm}
                  onChange={(e) => setBoxAllowanceCm(Number(e.target.value))}
                  className="rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                >
                  <option value={0}>不加</option>
                  <option value={1}>各加 1 cm</option>
                  <option value={2}>各加 2 cm</option>
                  <option value={3}>各加 3 cm</option>
                </select>
              </div>
              {(volumeCbm > 0 || volumetricKg > 0 || chargeableKg > 0) && (
                <p className="text-xs text-slate-400">
                  体积 {volumeCbm > 0 ? volumeCbm.toFixed(4) : "—"} CBM，体积重 {volumetricKg > 0 ? volumetricKg : "—"} kg，
                  计费重 {chargeableKg > 0 ? chargeableKg : "—"} kg
                  {cargoType === "heavy" && "（重货）"}
                  {cargoType === "volume" && "（抛货）"}
                </p>
              )}
            </div>
          )}

          {tradeMode === "1039" && (
            <div className="space-y-2">
              <label className="block text-sm text-slate-400">国内段计费</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="domesticChargeType"
                    checked={domesticChargeType === "fixed"}
                    onChange={() => setDomesticChargeType("fixed")}
                    className="border-slate-600 bg-slate-800 text-emerald-500"
                  />
                  固定（发货地）
                </label>
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="domesticChargeType"
                    checked={domesticChargeType === "by_weight"}
                    onChange={() => setDomesticChargeType("by_weight")}
                    className="border-slate-600 bg-slate-800 text-emerald-500"
                  />
                  按重
                </label>
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="domesticChargeType"
                    checked={domesticChargeType === "by_volume"}
                    onChange={() => setDomesticChargeType("by_volume")}
                    className="border-slate-600 bg-slate-800 text-emerald-500"
                  />
                  按体积
                </label>
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="domesticChargeType"
                    checked={domesticChargeType === "per_container"}
                    onChange={() => setDomesticChargeType("per_container")}
                    className="border-slate-600 bg-slate-800 text-emerald-500"
                  />
                  按柜
                </label>
              </div>
              {domesticChargeType === "fixed" && (
                <>
                  <label className="block text-sm text-slate-400 mt-2">发货地</label>
                  <div className="flex flex-wrap gap-4 items-center">
                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="shipFrom"
                        checked={shipFrom === "yiwu"}
                        onChange={() => setShipFrom("yiwu")}
                        className="border-slate-600 bg-slate-800 text-emerald-500"
                      />
                      外贸公司（义乌）发出（含义乌→港口拖车 120 元）
                    </label>
                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                      <input
                        type="radio"
                        name="shipFrom"
                        checked={shipFrom === "factory"}
                        onChange={() => setShipFrom("factory")}
                        className="border-slate-600 bg-slate-800 text-emerald-500"
                      />
                      工厂/供应商直发港口
                    </label>
                  </div>
                  {shipFrom === "factory" && (
                    <div className="mt-2">
                      <label className="block text-sm text-slate-400 mb-1">
                        国内段运费（元，可选）工厂→港口
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={domesticCny}
                        onChange={(e) => setDomesticCny(e.target.value)}
                        placeholder="不填则按 0 元计"
                        className="w-32 rounded-lg bg-slate-800 border border-slate-600 text-white px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </>
              )}
              {domesticChargeType === "by_weight" && (
                <div className="mt-2 flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">体积重系数</label>
                    <select
                      value={volumetricDivisor}
                      onChange={(e) => setVolumetricDivisor(Number(e.target.value))}
                      className="rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                    >
                      <option value={6000}>6000（空运）</option>
                      <option value={5000}>5000（海运）</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">元/吨</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={domesticYuanPerTon}
                      onChange={(e) => setDomesticYuanPerTon(e.target.value)}
                      placeholder="国内段单价"
                      className="w-28 rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                    />
                  </div>
                  {domesticCnyForPreview != null && domesticCnyForPreview > 0 && (
                    <span className="text-xs text-slate-400">国内段 ≈ {domesticCnyForPreview.toFixed(0)} 元</span>
                  )}
                </div>
              )}
              {domesticChargeType === "by_volume" && (
                <div className="mt-2 flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">元/CBM</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={domesticYuanPerCbm}
                      onChange={(e) => setDomesticYuanPerCbm(e.target.value)}
                      placeholder="国内段单价"
                      className="w-28 rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                    />
                  </div>
                  {domesticCnyForPreview != null && domesticCnyForPreview > 0 && (
                    <span className="text-xs text-slate-400">国内段 ≈ {domesticCnyForPreview.toFixed(0)} 元</span>
                  )}
                </div>
              )}
              {domesticChargeType === "per_container" && (
                <div className="mt-2">
                  <label className="block text-xs text-slate-500 mb-0.5">元/柜</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={domesticYuanPerContainer}
                    onChange={(e) => setDomesticYuanPerContainer(e.target.value)}
                    placeholder="国内段一柜价"
                    className="w-32 rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                  />
                </div>
              )}
            </div>
          )}
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
          {breakdown != null && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-4 space-y-1 text-sm">
              <h3 className="text-slate-300 font-medium mb-2">成本明细</h3>
              <p className="text-slate-400">
                EXW {breakdown.exw} 元 + 代理费 {breakdown.agentFee} 元 + 国内段 {breakdown.domesticCny} 元 + 利润{" "}
                {breakdown.profit.toFixed(0)} 元 = 总成本 {breakdown.totalCny.toFixed(0)} 元
              </p>
              <p className="text-slate-400">
                汇率 {breakdown.exchangeRate} × 结汇系数 {breakdown.settlementFactor} → FOB{" "}
                <span className="text-emerald-400 font-medium">${breakdown.fobUsd} USD</span>
              </p>
            </div>
          )}
          {fobPreview != null && !breakdown && (
            <p className="text-sm text-slate-400">
              预估 FOB 价：<span className="text-emerald-400 font-medium">${fobPreview} USD</span>
            </p>
          )}

          <div className="rounded-xl border border-slate-700 bg-slate-900/30 p-3">
            <button
              type="button"
              onClick={() => setShowCfrCif(!showCfrCif)}
              className="flex items-center gap-2 w-full text-left text-sm text-slate-400 hover:text-slate-200"
            >
              {showCfrCif ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              到岸价（可选）CFR / CIF
            </button>
            {showCfrCif && (
              <div className="mt-3 space-y-3 pt-3 border-t border-slate-700">
                <p className="text-xs text-slate-500 font-medium">海运方式</p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="freightType"
                      checked={freightType === "lcl"}
                      onChange={() => setFreightType("lcl")}
                      className="rounded-full border-slate-600 bg-slate-800 text-emerald-500"
                    />
                    <span className="text-sm text-slate-300">散货（LCL）</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="freightType"
                      checked={freightType === "fcl"}
                      onChange={() => setFreightType("fcl")}
                      className="rounded-full border-slate-600 bg-slate-800 text-emerald-500"
                    />
                    <span className="text-sm text-slate-300">整柜（FCL）</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="freightType"
                      checked={freightType === "manual"}
                      onChange={() => setFreightType("manual")}
                      className="rounded-full border-slate-600 bg-slate-800 text-emerald-500"
                    />
                    <span className="text-sm text-slate-300">直接填运费</span>
                  </label>
                </div>

                {freightType === "lcl" && (
                  <>
                    <p className="text-xs text-slate-500">
                      计费数(吨) = max(体积 CBM, 毛重 kg/1000)，海运费 = 单价 × 计费数
                    </p>
                    <div className="flex flex-wrap gap-4 items-end">
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">海运单价 元/吨（或元/CBM）</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={seaYuanPerTon}
                          onChange={(e) => setSeaYuanPerTon(e.target.value)}
                          placeholder="货代价格表"
                          className="w-28 rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                        />
                      </div>
                      {seaChargeableTon > 0 && seaFreightCny > 0 && (
                        <span className="text-xs text-slate-400">
                          计费数 {seaChargeableTon} 吨，海运费 {seaFreightCny.toFixed(0)} 元
                          {seaFreightUsd > 0 && ` ≈ $${seaFreightUsd} USD`}
                          {cfrFromSea != null && ` → CFR ≈ $${cfrFromSea} USD`}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {freightType === "fcl" && (
                  <>
                    <p className="text-xs text-slate-500">整柜海运费 = 元/柜 × 柜数（按货代报价）</p>
                    <div className="flex flex-wrap gap-4 items-end">
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">柜型</label>
                        <select
                          value={containerType}
                          onChange={(e) => setContainerType(e.target.value as "20GP" | "40GP" | "40HQ")}
                          className="rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                        >
                          <option value="20GP">20GP</option>
                          <option value="40GP">40GP</option>
                          <option value="40HQ">40HQ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">柜数</label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={containerCount}
                          onChange={(e) => setContainerCount(e.target.value)}
                          placeholder="1"
                          className="w-20 rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 mb-0.5">元/柜</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={yuanPerContainer}
                          onChange={(e) => setYuanPerContainer(e.target.value)}
                          placeholder="货代报价"
                          className="w-28 rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                        />
                      </div>
                      {seaFreightCnyFcl > 0 && (
                        <span className="text-xs text-slate-400">
                          海运费 {seaFreightCnyFcl.toFixed(0)} 元
                          {seaFreightUsdFcl > 0 && ` ≈ $${seaFreightUsdFcl} USD`}
                          {cfrFromFcl != null && ` → CFR ≈ $${cfrFromFcl} USD`}
                        </span>
                      )}
                    </div>
                  </>
                )}

                {freightType === "manual" && (
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-xs text-slate-500 mb-0.5">到港运费 USD</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={freightUsd}
                        onChange={(e) => setFreightUsd(e.target.value)}
                        placeholder="货代报价"
                        className="w-28 rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500 font-medium mt-3">常见附加费（询盘/报价可算上）</p>
                <p className="text-xs text-slate-500">THC、DOC、BAF、CAF 等，货代常按 USD 报，可填合计</p>
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">附加费 USD</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={surchargeUsd}
                      onChange={(e) => setSurchargeUsd(e.target.value)}
                      placeholder="0"
                      className="w-24 rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium mt-3">保险费（CIF 可选）</p>
                <div className="flex flex-wrap gap-4 items-end">
                  <div>
                    <label className="block text-xs text-slate-500 mb-0.5">保险费 USD</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={insuranceUsd}
                      onChange={(e) => setInsuranceUsd(e.target.value)}
                      placeholder="0"
                      className="w-24 rounded-lg bg-slate-800 border border-slate-600 text-white px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
                {effectiveCfr != null && (
                  <p className="text-xs text-slate-400">
                    CFR ≈ <span className="text-emerald-400 font-medium">${effectiveCfr} USD</span>
                    {effectiveCif != null && (
                      <> &nbsp; CIF ≈ <span className="text-emerald-400 font-medium">${effectiveCif} USD</span></>
                    )}
                  </p>
                )}
                <p className="text-xs text-slate-500">国际段运费请以货代报价为准，此处仅作汇总展示。</p>
              </div>
            )}
          </div>

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
