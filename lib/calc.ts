/** 1039 公式: FOB_USD = (EXW + Agent费 + 拖车 + 利润) / (汇率 × 0.998) */
const AGENT_FEE = 80;
const TRUCKING = 120;

export function calcFobUsd(
  exwPrice: number,
  profitMarginPercent: number,
  exchangeRate: number = 7.25
): number {
  const profit = exwPrice * (profitMarginPercent / 100);
  const totalCny = exwPrice + AGENT_FEE + TRUCKING + profit;
  return Number((totalCny / (exchangeRate * 0.998)).toFixed(2));
}
