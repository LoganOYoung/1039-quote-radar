/**
 * 首页「已有 XX 位商户在用」：基数 + 按日增长
 * 按「上线日」起算，每天增加 GROWTH_PER_DAY，便于后续替换为真实统计
 */

/** 上线日（以此为起点累加天数） */
const LAUNCH_DATE = new Date("2025-02-01T00:00:00.000Z");

/** 上线当天的展示基数 */
const BASE_MERCHANTS = 28;

/** 每天增加人数（可为小数，展示时取整） */
const GROWTH_PER_DAY = 1.2;

/**
 * 根据当前日期计算展示的商户数：基数 + 自上线日起累计增长
 */
export function getMerchantCount(now: Date = new Date()): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.max(0, (now.getTime() - LAUNCH_DATE.getTime()) / msPerDay);
  const growth = Math.floor(days * GROWTH_PER_DAY);
  return BASE_MERCHANTS + growth;
}
