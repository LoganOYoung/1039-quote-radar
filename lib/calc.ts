/**
 * 1039 公式: FOB_USD = (EXW + Agent费 + 国内段运费 + 利润) / (汇率 × 结汇系数)
 * 参数可从环境变量覆盖（服务端）；前端构建时无 env 则用默认值。
 */
const AGENT_FEE =
  typeof process !== "undefined" && process.env?.AGENT_FEE != null
    ? parseFloat(process.env.AGENT_FEE)
    : 80;
const TRUCKING_YIWU =
  typeof process !== "undefined" && process.env?.TRUCKING_YIWU != null
    ? parseFloat(process.env.TRUCKING_YIWU)
    : 120;
const VOLUMETRIC_DIVISOR =
  typeof process !== "undefined" && process.env?.VOLUMETRIC_DIVISOR != null
    ? parseFloat(process.env.VOLUMETRIC_DIVISOR)
    : 6000;
const SETTLEMENT_FACTOR =
  typeof process !== "undefined" && process.env?.SETTLEMENT_FACTOR != null
    ? parseFloat(process.env.SETTLEMENT_FACTOR)
    : 0.998;

export type ShipFrom = "yiwu" | "factory";

/**
 * 国内段运费（人民币）：
 * - yiwu：货从外贸公司（义乌）发出，默认 TRUCKING_YIWU 元
 * - factory：工厂/供应商直发港口，默认 0（或由调用方传入 customDomesticCny）
 */
export function getDomesticCny(shipFrom: ShipFrom, customDomesticCny?: number): number {
  if (shipFrom === "factory") return customDomesticCny ?? 0;
  return customDomesticCny ?? TRUCKING_YIWU;
}

/** 体积 CBM = 长×宽×高(cm) / 1,000,000（单位须为 cm） */
export function calcVolumeCbm(lengthCm: number, widthCm: number, heightCm: number): number {
  if (lengthCm <= 0 || widthCm <= 0 || heightCm <= 0) return 0;
  return Number(((lengthCm * widthCm * heightCm) / 1_000_000).toFixed(6));
}

/**
 * 体积 CBM（可选箱规加量）：长宽高各加 allowanceCm 再算体积，用于保守报价。
 * 加量 = 0 时与 calcVolumeCbm 一致。
 */
export function calcVolumeCbmWithAllowance(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  allowanceCm: number = 0
): number {
  const L = lengthCm + allowanceCm;
  const W = widthCm + allowanceCm;
  const H = heightCm + allowanceCm;
  if (L <= 0 || W <= 0 || H <= 0) return 0;
  return Number(((L * W * H) / 1_000_000).toFixed(6));
}

/**
 * 散货海运计费数(吨) = max(体积(CBM), 毛重(kg)/1000)。
 * 海运常按 1 CBM = 1 吨，实重(吨) = 毛重(kg)/1000。
 */
export function getSeaChargeableTon(volumeCbm: number, grossWeightKg: number): number {
  const vol = volumeCbm >= 0 ? volumeCbm : 0;
  const wtTon = grossWeightKg >= 0 ? grossWeightKg / 1000 : 0;
  return Number(Math.max(vol, wtTon).toFixed(4));
}

/** 散货海运费(元) = 单价(元/吨或元/CBM) × 计费数(吨) */
export function calcSeaFreightCny(
  volumeCbm: number,
  grossWeightKg: number,
  yuanPerTon: number
): number {
  if (yuanPerTon < 0) return 0;
  const chargeableTon = getSeaChargeableTon(volumeCbm, grossWeightKg);
  return Number((chargeableTon * yuanPerTon).toFixed(2));
}

/** 体积重 kg = 长×宽×高(cm) / 系数（空运常用 6000，海运 5000） */
export function calcVolumetricWeight(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  divisor: number = VOLUMETRIC_DIVISOR
): number {
  if (lengthCm <= 0 || widthCm <= 0 || heightCm <= 0 || divisor <= 0) return 0;
  return Number(((lengthCm * widthCm * heightCm) / divisor).toFixed(2));
}

/** 计费重 kg = max(实重, 体积重) */
export function getChargeableWeight(actualKg: number, volumetricKg: number): number {
  const a = actualKg >= 0 ? actualKg : 0;
  const v = volumetricKg >= 0 ? volumetricKg : 0;
  return Number(Math.max(a, v).toFixed(2));
}

/** 重货：实重 ≥ 体积重；抛货：体积重 > 实重 */
export function getCargoType(actualKg: number, volumetricKg: number): "heavy" | "volume" | null {
  if (actualKg <= 0 && volumetricKg <= 0) return null;
  if (actualKg >= volumetricKg) return "heavy";
  return "volume";
}

/** 国内段运费（按重）：元/吨 × 计费重(kg)/1000 */
export function calcDomesticCnyByWeight(chargeableKg: number, yuanPerTon: number): number {
  if (chargeableKg <= 0 || yuanPerTon < 0) return 0;
  return Number(((yuanPerTon * chargeableKg) / 1000).toFixed(2));
}

/** 国内段运费（按体积）：元/CBM × 体积(CBM) */
export function calcDomesticCnyByVolume(cbm: number, yuanPerCbm: number): number {
  if (cbm <= 0 || yuanPerCbm < 0) return 0;
  return Number((cbm * yuanPerCbm).toFixed(2));
}

export type CostBreakdown = {
  exw: number;
  agentFee: number;
  domesticCny: number;
  profit: number;
  totalCny: number;
  exchangeRate: number;
  settlementFactor: number;
  fobUsd: number;
};

/**
 * 成本明细（1039 模式），用于展示与校验。
 * 可选覆盖：agentFee、settlementFactor（不传则用环境变量或默认值）。
 */
export function getCostBreakdown(
  exwPrice: number,
  profitMarginPercent: number,
  exchangeRate: number = 7.25,
  options?: {
    shipFrom?: ShipFrom;
    domesticCny?: number;
    agentFee?: number;
    settlementFactor?: number;
  }
): CostBreakdown {
  const profit = exwPrice * (profitMarginPercent / 100);
  const domesticCny = options?.domesticCny ?? getDomesticCny(options?.shipFrom ?? "yiwu");
  const agentFee = options?.agentFee ?? AGENT_FEE;
  const settlementFactor = options?.settlementFactor ?? SETTLEMENT_FACTOR;
  const totalCny = exwPrice + agentFee + domesticCny + profit;
  const fobUsd = Number((totalCny / (exchangeRate * settlementFactor)).toFixed(2));
  return {
    exw: exwPrice,
    agentFee,
    domesticCny,
    profit,
    totalCny,
    exchangeRate,
    settlementFactor,
    fobUsd,
  };
}

export function calcFobUsd(
  exwPrice: number,
  profitMarginPercent: number,
  exchangeRate: number = 7.25,
  options?: {
    shipFrom?: ShipFrom;
    domesticCny?: number;
    agentFee?: number;
    settlementFactor?: number;
  }
): number {
  return getCostBreakdown(exwPrice, profitMarginPercent, exchangeRate, options).fobUsd;
}

/** CFR USD = FOB + 到港运费(USD) */
export function calcCfrUsd(fobUsd: number, freightUsd: number): number {
  return Number((fobUsd + (freightUsd >= 0 ? freightUsd : 0)).toFixed(2));
}

/** CIF USD = FOB + 到港运费(USD) + 保险费(USD) */
export function calcCifUsd(fobUsd: number, freightUsd: number, insuranceUsd: number = 0): number {
  return Number((fobUsd + Math.max(0, freightUsd) + Math.max(0, insuranceUsd)).toFixed(2));
}
