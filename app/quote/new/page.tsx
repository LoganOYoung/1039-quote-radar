"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Radar, Copy, Check, Sparkles, ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
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
  const [companyName, setCompanyName] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [orderQuantity, setOrderQuantity] = useState("");
  const [pcsPerCarton, setPcsPerCarton] = useState("");
  const [agentFeeOverride, setAgentFeeOverride] = useState("80");
  const [settlementFactorOverride, setSettlementFactorOverride] = useState("0.998");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileStep, setMobileStep] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
    const subOrderQty = (() => {
      const v = parseFloat(orderQuantity);
      return !isNaN(v) && v >= 1 ? Math.floor(v) : 1;
    })();
    const subPcsPerCtn = (() => {
      const v = parseFloat(pcsPerCarton);
      return !isNaN(v) && v >= 1 ? Math.floor(v) : 0;
    })();
    const subCartons = subPcsPerCtn > 0 && subOrderQty >= 1 ? Math.ceil(subOrderQty / subPcsPerCtn) : 1;

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
          finalDomesticCny = calcDomesticCnyByWeight(ch, ypt) * subCartons;
        }
      } else if (domesticChargeType === "by_volume") {
        const l = parseFloat(boxL);
        const w = parseFloat(boxW);
        const h = parseFloat(boxH);
        const ypc = parseFloat(domesticYuanPerCbm);
        if (l > 0 && w > 0 && h > 0 && !isNaN(ypc) && ypc >= 0) {
          const cbm = calcVolumeCbmWithAllowance(l, w, h, boxAllowanceCm);
          finalDomesticCny = calcDomesticCnyByVolume(cbm, ypc) * subCartons;
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
      companyName: companyName.trim() || undefined,
      companyLogoUrl: companyLogoUrl.trim() || undefined,
      agentFee: (() => {
        const v = parseFloat(agentFeeOverride);
        return !isNaN(v) && v >= 0 ? v : undefined;
      })(),
      settlementFactor: (() => {
        const v = parseFloat(settlementFactorOverride);
        return !isNaN(v) && v > 0 && v <= 1 ? v : undefined;
      })(),
      orderQuantity: subOrderQty > 1 ? subOrderQty : undefined,
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

  const copyWithScript = () => {
    if (!generatedLink) return;
    const pricePart = fobPreview != null ? `，FOB $${fobPreview} USD` : "";
    const text = `【报价】${productName.trim() || "产品"}${pricePart}，详情点击：${generatedLink}`;
    navigator.clipboard.writeText(text);
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
  const orderQtyNum = (() => {
    const v = parseFloat(orderQuantity);
    return !isNaN(v) && v >= 1 ? Math.floor(v) : 1;
  })();
  const pcsPerCtnNum = (() => {
    const v = parseFloat(pcsPerCarton);
    return !isNaN(v) && v >= 1 ? Math.floor(v) : 0;
  })();
  const cartons = pcsPerCtnNum > 0 && orderQtyNum >= 1 ? Math.ceil(orderQtyNum / pcsPerCtnNum) : 1;

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
        domesticCnyForPreview = calcDomesticCnyByWeight(chargeableKg, ypt) * cartons;
    } else if (domesticChargeType === "by_volume") {
      const ypc = parseFloat(domesticYuanPerCbm);
      if (volumeCbm > 0 && !isNaN(ypc) && ypc >= 0)
        domesticCnyForPreview = calcDomesticCnyByVolume(volumeCbm, ypc) * cartons;
    } else if (domesticChargeType === "per_container") {
      const v = parseFloat(domesticYuanPerContainer);
      domesticCnyForPreview = !isNaN(v) && v >= 0 ? v : undefined;
    }
  }

  const effectiveDomesticCny =
    domesticChargeType !== "fixed" ? (domesticCnyForPreview ?? 0) : domesticCnyForPreview;
  const totalExw = exwNum * orderQtyNum;
  const agentFeeNum = (() => {
    const v = parseFloat(agentFeeOverride);
    return !isNaN(v) && v >= 0 ? v : 80;
  })();
  const settlementFactorNum = (() => {
    const v = parseFloat(settlementFactorOverride);
    return !isNaN(v) && v > 0 && v <= 1 ? v : 0.998;
  })();
  const breakdown =
    tradeMode === "1039" &&
    !isNaN(exwNum) &&
    exwNum > 0
      ? getCostBreakdown(totalExw, isNaN(marginNum) ? 15 : marginNum, isNaN(rateNum) ? 7.25 : rateNum, {
          shipFrom,
          domesticCny: effectiveDomesticCny,
          agentFee: agentFeeNum,
          settlementFactor: settlementFactorNum,
        })
      : null;

  const fobTotalUsd = breakdown?.fobUsd ?? (tradeMode === "general" && !isNaN(exwNum) && exwNum > 0 ? (exwNum * orderQtyNum) / (isNaN(rateNum) ? 7.25 : rateNum) : null);
  const fobPreview = fobTotalUsd != null && orderQtyNum > 1 ? Number((fobTotalUsd / orderQtyNum).toFixed(2)) : fobTotalUsd;

  const freightUsdNum = parseFloat(freightUsd);
  const insuranceUsdNum = parseFloat(insuranceUsd);
  const cfrPreview =
    fobPreview != null && !isNaN(freightUsdNum) && freightUsdNum >= 0 ? calcCfrUsd(fobPreview, freightUsdNum) : null;
  const cifPreview =
    fobPreview != null && !isNaN(freightUsdNum) && freightUsdNum >= 0
      ? calcCifUsd(fobPreview, freightUsdNum, !isNaN(insuranceUsdNum) && insuranceUsdNum >= 0 ? insuranceUsdNum : 0)
      : null;

  const totalVolumeCbm = volumeCbm * cartons;
  const totalGw = (gw >= 0 ? gw : 0) * cartons;
  const seaYuanPerTonNum = parseFloat(seaYuanPerTon);
  const seaChargeableTon =
    totalVolumeCbm > 0 || totalGw >= 0 ? getSeaChargeableTon(totalVolumeCbm, totalGw) : 0;
  const seaFreightCny =
    (totalVolumeCbm >= 0 || totalGw >= 0) && !isNaN(seaYuanPerTonNum) && seaYuanPerTonNum >= 0
      ? calcSeaFreightCny(totalVolumeCbm, totalGw, seaYuanPerTonNum)
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

  const totalSteps = 5;
  const canGoNext =
    mobileStep === 1 ? true :
    mobileStep === 2 ? !!(productName.trim() && exwPrice && !isNaN(parseFloat(exwPrice)) && parseFloat(exwPrice) > 0) :
    true;

  return (
    <main className="min-h-screen bg-white text-slate-800 px-3 py-4 sm:p-4 md:p-6 overflow-x-hidden" style={{ paddingBottom: isMobile ? "max(6rem, calc(6rem + env(safe-area-inset-bottom)))" : "max(5.5rem, calc(5.5rem + env(safe-area-inset-bottom)))" }}>
      <div className="max-w-2xl mx-auto min-w-0">
        <header className="flex items-center gap-2 mb-4 sm:mb-6">
          <Link href="/" className="p-1 -m-1 text-slate-500 hover:text-slate-900 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Radar className="w-8 h-8 text-emerald-600" aria-hidden />
          </Link>
          <h1 className="text-lg sm:text-xl font-bold truncate text-slate-900">生成报价链接</h1>
        </header>

        {/* 移动端：进度点 */}
        {isMobile && (
          <div className="flex justify-center gap-2 mb-4" aria-label={`第 ${mobileStep} 步，共 ${totalSteps} 步`}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`h-2 rounded-full transition-all ${s === mobileStep ? "w-6 bg-emerald-500" : s < mobileStep ? "w-2 bg-emerald-500/60" : "w-2 bg-slate-300"}`}
              />
            ))}
          </div>
        )}

        {/* Step 1: 贸易模式 */}
        <div className={isMobile && mobileStep !== 1 ? "hidden" : ""}>
        {/* 1. 贸易模式（最先选，决定后续展示哪些项） */}
        <section className="mb-4 sm:mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
          <h2 className="text-sm font-medium text-slate-700 mb-2">贸易模式</h2>
          <p className="text-xs text-slate-500 mb-3">根据您的出口方式选择，决定报价公式与需填项。</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setTradeMode("1039")}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-colors min-h-0 ${
                tradeMode === "1039"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <span className="font-medium block text-slate-900">义乌 1039</span>
              <span className="text-xs text-slate-500 mt-1 block leading-relaxed">
                市场采购贸易（海关监管代码 1039），适合义乌市场商户、小批量多品种出口，通过代理报关结汇。报价含代理费、国内段运费、结汇系数等。
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTradeMode("general")}
              className={`flex-1 rounded-xl border-2 px-4 py-3 text-left transition-colors min-h-0 ${
                tradeMode === "general"
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              <span className="font-medium block text-slate-900">一般贸易</span>
              <span className="text-xs text-slate-500 mt-1 block leading-relaxed">
                传统进出口贸易（如监管代码 0110），适合有自营出口资质的企业。FOB = EXW ÷ 汇率，无需代理费与国内段，报价更简单。
              </span>
            </button>
          </div>
        </section>
        </div>

        {/* Step 3 之一：成本计算公式（仅 1039，桌面与移动步进均显示） */}
        <div className={isMobile && mobileStep !== 3 ? "hidden" : ""}>
        {tradeMode === "1039" && (
          <section className="mb-4 sm:mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
            <h2 className="text-sm font-medium text-emerald-600 mb-2">成本计算公式</h2>
            <p className="text-slate-600 text-xs sm:text-sm font-mono mb-3 break-words">
              FOB (USD) = (EXW + 代理费 + 国内段 + 利润) ÷ (汇率 × 结汇系数)
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
              <div className="min-w-0">
                <label className="block text-xs text-slate-500 mb-0.5">代理费 (元)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={agentFeeOverride}
                  onChange={(e) => setAgentFeeOverride(e.target.value)}
                  className="w-full sm:w-20 rounded-lg bg-white border border-slate-200 text-slate-900 px-3 py-3 sm:py-2 text-base sm:text-sm min-h-[48px] sm:min-h-0 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-xs text-slate-500 mb-0.5">结汇系数</label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  max="1"
                  value={settlementFactorOverride}
                  onChange={(e) => setSettlementFactorOverride(e.target.value)}
                  className="w-full sm:w-20 rounded-lg bg-white border border-slate-200 text-slate-900 px-3 py-3 sm:py-2 text-base sm:text-sm min-h-[48px] sm:min-h-0 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1">结汇时扣掉的手续/损耗，默认 0.998，一般不用改</p>
              </div>
            </div>
          </section>
        )}
        {tradeMode === "general" && isMobile && (
          <section className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
            <p className="text-slate-500 text-sm">一般贸易无需填写成本与国内段，直接下一步</p>
          </section>
        )}
        </div>

        {/* 智能粘贴区 - Step 2 */}
        <div className={isMobile && mobileStep !== 2 ? "hidden" : ""}>
        <section className="mb-4 sm:mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-2 mb-2 text-emerald-600">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">智能粘贴</span>
          </div>
          <textarea
            placeholder="粘贴微信聊天、产品描述、工厂清单… 自动识别产品名、单价、客户名"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            className="w-full h-28 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 p-3 text-base sm:text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent min-h-[120px]"
          />
          <button
            type="button"
            onClick={handleParse}
            disabled={!paste.trim()}
            className="mt-2 rounded-xl bg-slate-100 px-4 py-3 min-h-[48px] text-base sm:text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            解析并填入下方
          </button>
        </section>
        </div>

        {/* 表单 */}
        <form id="quote-new-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Step 2 续：产品与报价基础 */}
          <div className={isMobile && mobileStep !== 2 ? "hidden" : ""}>
          <div>
            <label className="block text-sm text-slate-600 mb-1">产品名称 *</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              required
              className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 p-3 py-3 sm:py-2.5 text-base sm:text-sm min-h-[48px] sm:min-h-[44px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="如：筋膜枪 2000mAh"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">EXW 单价 (元) *</label>
              <p className="text-xs text-slate-500 mb-1.5">请填含税出厂价；若工厂给的是不含税价，请先按「含税价 = 不含税价 × (1 + 税率)」换算后再填。</p>
              <input
                type="number"
                step="0.01"
                min="0"
                value={exwPrice}
                onChange={(e) => setExwPrice(e.target.value)}
                required
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 p-3 py-3 sm:py-2 text-base sm:text-sm min-h-[48px] sm:min-h-[44px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="出厂价"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">利润率 (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={profitMargin}
                onChange={(e) => setProfitMargin(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 p-3 py-3 sm:py-2 text-base sm:text-sm min-h-[48px] sm:min-h-[44px] focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-600 mb-1">客户名（可选）</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 p-3 py-3 sm:py-2.5 text-base min-h-[48px] sm:min-h-0 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="用于备注"
            />
          </div>
          </div>

          {/* Step 3 之二：箱规与国内段（仅 1039） */}
          <div className={isMobile && mobileStep !== 3 ? "hidden" : ""}>
          {tradeMode === "1039" && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <h3 className="text-sm font-medium text-slate-700">箱规与重量（可选，用于按重/按方计国内段）</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-0.5">产品数量（件）</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    placeholder="不填按单价"
                    className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-0.5">每箱件数（件/箱）</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={pcsPerCarton}
                    onChange={(e) => setPcsPerCarton(e.target.value)}
                    placeholder="不填按单箱"
                    className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              {orderQtyNum > 1 && cartons > 0 && (
                <p className="text-xs text-slate-400">共 {orderQtyNum} 件 → {cartons} 箱（用于国内段/散货海运）</p>
              )}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-0.5">长 cm</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={boxL}
                    onChange={(e) => setBoxL(e.target.value)}
                    placeholder="—"
                    className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="w-24 rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-0.5">箱规加量 cm（体积保守报价，可选）</label>
                <select
                  value={boxAllowanceCm}
                  onChange={(e) => setBoxAllowanceCm(Number(e.target.value))}
                  className="rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer min-h-[44px] py-1 sm:py-0">
                  <input
                    type="radio"
                    name="domesticChargeType"
                    checked={domesticChargeType === "fixed"}
                    onChange={() => setDomesticChargeType("fixed")}
                    className="border-slate-300 bg-white text-emerald-600"
                  />
                  固定（发货地）
                </label>
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer min-h-[44px] py-1 sm:py-0">
                  <input
                    type="radio"
                    name="domesticChargeType"
                    checked={domesticChargeType === "by_weight"}
                    onChange={() => setDomesticChargeType("by_weight")}
                    className="border-slate-300 bg-white text-emerald-600"
                  />
                  按重
                </label>
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer min-h-[44px] py-1 sm:py-0">
                  <input
                    type="radio"
                    name="domesticChargeType"
                    checked={domesticChargeType === "by_volume"}
                    onChange={() => setDomesticChargeType("by_volume")}
                    className="border-slate-300 bg-white text-emerald-600"
                  />
                  按体积
                </label>
                <label className="flex items-center gap-2 text-slate-200 cursor-pointer min-h-[44px] py-1 sm:py-0">
                  <input
                    type="radio"
                    name="domesticChargeType"
                    checked={domesticChargeType === "per_container"}
                    onChange={() => setDomesticChargeType("per_container")}
                    className="border-slate-300 bg-white text-emerald-600"
                  />
                  按柜
                </label>
              </div>
              {domesticChargeType === "fixed" && (
                <>
                  <label className="block text-sm text-slate-400 mt-2">发货地</label>
                  <div className="flex flex-wrap gap-4 items-center">
                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer min-h-[44px] py-1 sm:py-0">
                      <input
                        type="radio"
                        name="shipFrom"
                        checked={shipFrom === "yiwu"}
                        onChange={() => setShipFrom("yiwu")}
                        className="border-slate-300 bg-white text-emerald-600"
                      />
                      外贸公司（义乌）发出（含义乌→港口拖车 120 元）
                    </label>
                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer min-h-[44px] py-1 sm:py-0">
                      <input
                        type="radio"
                        name="shipFrom"
                        checked={shipFrom === "factory"}
                        onChange={() => setShipFrom("factory")}
                        className="border-slate-300 bg-white text-emerald-600"
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
                        className="w-32 rounded-lg bg-white border border-slate-200 text-slate-900 px-3 py-2 text-sm"
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
                      className="rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                      className="w-28 rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm"
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
                      className="w-28 rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm"
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
                    className="w-32 rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm"
                  />
                </div>
              )}
            </div>
          )}
          </div>

          {/* Step 4：品牌、汇率与选项 */}
          <div className={isMobile && mobileStep !== 4 ? "hidden" : ""}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <h3 className="text-sm font-medium text-slate-300">品牌 / Logo（发给客户时显示）</h3>
            <div>
              <label className="block text-xs text-slate-500 mb-1">公司 / 品牌名（可选）</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 p-3 py-3 sm:p-2.5 text-base sm:text-sm min-h-[48px] sm:min-h-0 focus:ring-2 focus:ring-emerald-500"
                placeholder="如：ABC Trading Co."
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Logo 图片链接（可选）</label>
              <input
                type="url"
                value={companyLogoUrl}
                onChange={(e) => setCompanyLogoUrl(e.target.value)}
                className="w-full rounded-xl bg-white border border-slate-200 text-slate-900 p-3 py-3 sm:p-2.5 text-base sm:text-sm min-h-[48px] sm:min-h-0 focus:ring-2 focus:ring-emerald-500"
                placeholder="https://... 或上传到图床后粘贴链接"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 items-center mt-4">
            <div>
              <label className="text-sm text-slate-400 mr-2">汇率</label>
              <input
                type="number"
                step="0.01"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                className="w-20 rounded-xl bg-white border border-slate-200 text-slate-900 px-3 py-3 sm:py-2 min-h-[48px] sm:min-h-0"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer min-h-[44px] py-1 sm:py-0">
              <input
                type="checkbox"
                checked={lockRate}
                onChange={(e) => setLockRate(e.target.checked)}
                className="rounded border-slate-300 bg-white text-emerald-600"
              />
              锁定汇率（报价页展示锚定汇率）
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer min-h-[48px] sm:min-h-[44px] py-1 sm:py-0">
              <input
                type="checkbox"
                checked={accessControlled}
                onChange={(e) => setAccessControlled(e.target.checked)}
                className="rounded border-slate-300 bg-white text-emerald-600"
              />
              受控访问（客户申请后才显示价格）
            </label>
          </div>
          </div>

          {/* Step 5：到岸价、核查与提交 */}
          <div className={isMobile && mobileStep !== 5 ? "hidden" : ""}>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <button
              type="button"
              onClick={() => setShowCfrCif(!showCfrCif)}
              className="flex items-center gap-2 w-full text-left text-sm text-slate-400 hover:text-slate-200 min-h-[48px] sm:min-h-[44px]"
            >
              {showCfrCif ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              到岸价（可选）CFR / CIF
            </button>
            {showCfrCif && (
              <div className="mt-3 space-y-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium">海运方式</p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px] py-1 sm:py-0">
                    <input
                      type="radio"
                      name="freightType"
                      checked={freightType === "lcl"}
                      onChange={() => setFreightType("lcl")}
                      className="rounded-full border-slate-300 bg-white text-emerald-600"
                    />
                    <span className="text-sm text-slate-300">散货（LCL）</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px] py-1 sm:py-0">
                    <input
                      type="radio"
                      name="freightType"
                      checked={freightType === "fcl"}
                      onChange={() => setFreightType("fcl")}
                      className="rounded-full border-slate-300 bg-white text-emerald-600"
                    />
                    <span className="text-sm text-slate-300">整柜（FCL）</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer min-h-[44px] py-1 sm:py-0">
                    <input
                      type="radio"
                      name="freightType"
                      checked={freightType === "manual"}
                      onChange={() => setFreightType("manual")}
                      className="rounded-full border-slate-300 bg-white text-emerald-600"
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
                          className="w-28 rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm"
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
                          className="rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                          className="w-20 rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm"
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
                          className="w-28 rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm"
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
                        className="w-28 rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm"
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
                      className="w-24 rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm"
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
                      className="w-24 rounded-lg bg-white border border-slate-200 text-slate-900 px-2 py-1.5 text-sm"
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

          {/* 核查：成本明细 + 报价明细（提交前核对） */}
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4 space-y-4 min-w-0">
            <h2 className="text-sm font-medium text-slate-300">提交前核查</h2>

            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">成本明细</h3>
              {breakdown != null ? (
                <div className="text-sm text-slate-400 space-y-1">
                  {orderQtyNum > 1 && (
                    <p>数量 {orderQtyNum} 件{pcsPerCtnNum > 0 ? `，${cartons} 箱` : ""}；总 EXW {breakdown.exw} 元</p>
                  )}
                  <p>EXW {breakdown.exw} 元 + 代理费 {breakdown.agentFee} 元 + 国内段 {breakdown.domesticCny} 元 + 利润 {breakdown.profit.toFixed(0)} 元 = 总成本 {breakdown.totalCny.toFixed(0)} 元</p>
                  <p>汇率 {breakdown.exchangeRate} × 结汇系数 {breakdown.settlementFactor} → FOB {orderQtyNum > 1 ? `总价 $${breakdown.fobUsd} USD，单价 ` : ""}<span className="text-emerald-400 font-medium">${fobPreview} USD</span></p>
                </div>
              ) : tradeMode === "general" && !isNaN(exwNum) && exwNum > 0 ? (
                <p className="text-sm text-slate-400">一般贸易：FOB = EXW ÷ 汇率 = <span className="text-emerald-400 font-medium">${(exwNum / (isNaN(rateNum) ? 7.25 : rateNum)).toFixed(2)} USD</span>{orderQtyNum > 1 ? `（单价）；总 ${(exwNum * orderQtyNum / (isNaN(rateNum) ? 7.25 : rateNum)).toFixed(2)} USD` : ""}</p>
              ) : (
                <p className="text-sm text-slate-500">请填写产品名与有效出厂价后自动显示</p>
              )}
            </div>

            <div>
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">报价明细</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                <li>产品：{productName.trim() || "—"}</li>
                <li>客户：{customerName.trim() || "—"}</li>
                {orderQtyNum > 1 && <li>数量：{orderQtyNum} 件{pcsPerCtnNum > 0 ? `，${cartons} 箱` : ""}</li>}
                <li>贸易方式：{tradeMode === "1039" ? "1039" : "一般贸易"}</li>
                <li>FOB：{fobPreview != null ? <span className="text-emerald-400 font-medium">${fobPreview} USD</span> : "—"}{orderQtyNum > 1 && fobTotalUsd != null ? `（单价）；总 $${fobTotalUsd.toFixed(2)} USD` : ""}</li>
                {effectiveCfr != null && <li>CFR：<span className="text-emerald-400">${effectiveCfr} USD</span></li>}
                {effectiveCif != null && <li>CIF：<span className="text-emerald-400">${effectiveCif} USD</span></li>}
                <li>锁定汇率：{lockRate ? "是" : "否"}{lockRate && rateNum && ` (${rateNum})`}</li>
                <li>受控访问：{accessControlled ? "是" : "否"}</li>
              </ul>
            </div>
          </section>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 py-4 min-h-[48px] font-medium text-base text-white hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 sm:block"
            style={isMobile ? { display: "none" } : undefined}
          >
            {loading ? "生成中…" : "生成报价链接"}
          </button>
          </div>
        </form>

        {/* 移动端：固定底栏 上一步/下一步 或 生成报价链接 */}
        {isMobile && (
          <div
            className="fixed bottom-0 left-0 right-0 z-[60] flex items-center gap-3 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3"
            style={{
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
              paddingLeft: "max(1rem, env(safe-area-inset-left))",
              paddingRight: "max(1rem, env(safe-area-inset-right))",
            }}
          >
            {mobileStep > 1 ? (
              <button
                type="button"
                onClick={() => setMobileStep((s) => s - 1)}
                className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 min-h-[48px] text-slate-700 font-medium text-base flex-1 sm:flex-initial"
              >
                <ChevronLeft className="w-5 h-5" aria-hidden />
                上一步
              </button>
            ) : (
              <div className="flex-1" />
            )}
            {mobileStep < totalSteps ? (
              <button
                type="button"
                onClick={() => canGoNext && setMobileStep((s) => s + 1)}
                disabled={!canGoNext}
                className="rounded-xl bg-emerald-600 px-6 py-3 min-h-[48px] text-white font-medium text-base flex-1 sm:flex-initial hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步
              </button>
            ) : (
              <button
                type="submit"
                form="quote-new-form"
                disabled={loading}
                className="rounded-xl bg-emerald-600 px-6 py-3 min-h-[48px] text-white font-medium text-base flex-1 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "生成中…" : "生成报价链接"}
              </button>
            )}
          </div>
        )}

        {/* 生成结果 */}
        {generatedLink && (
          <section className="mt-6 rounded-xl border border-emerald-700 bg-emerald-950/30 p-4">
            <p className="text-sm text-slate-400 mb-2">专业报价链接（发给客户即可，打开即被记录）</p>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 min-w-0 rounded-lg bg-white border border-slate-200 text-slate-900 p-3 text-sm"
              />
              <button
                type="button"
                onClick={copyLink}
                className="rounded-lg bg-emerald-600 px-4 py-3 text-white hover:bg-emerald-500 flex items-center gap-2 min-h-[44px]"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "已复制" : "复制链接"}
              </button>
              <button
                type="button"
                onClick={copyWithScript}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-700 hover:bg-slate-100 flex items-center gap-2 min-h-[44px] text-sm"
              >
                <Copy className="w-4 h-4" />
                复制带话术
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">「复制带话术」可直接粘贴到微信/WhatsApp，含产品名、价格与链接</p>
            <Link href="/dashboard" className="inline-block mt-3 text-sm text-emerald-400 hover:underline">
              去我的报价查看动态 →
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
