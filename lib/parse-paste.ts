/**
 * 从粘贴文字中解析出产品名、单价、数量、客户名等
 * 支持：微信聊天、工厂清单、产品描述等常见格式
 */
export type ParsedQuote = {
  productName: string;
  unitPrice: number | null;
  qty: number | null;
  customerName: string | null;
  rawLines: string[];
};

// 常见价格模式：数字+元/$/USD、小数点
const PRICE_PATTERNS = [
  /(\d+\.?\d*)\s*(?:元|RMB|CNY|USD|\$|usd)/i,
  /(?:price|单价|报价|FOB|EXW)[:\s]*(\d+\.?\d*)/i,
  /(\d+\.?\d*)\s*\/\s*(?:pcs|pc|set|piece)/i,
];

// 数量模式
const QTY_PATTERNS = [
  /(?:qty|数量|quantity)[:\s]*(\d+)/i,
  /(\d+)\s*(?:pcs|pc|set|piece|个|件)/i,
];

export function parsePasteText(text: string): ParsedQuote {
  const rawLines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  let productName = "";
  let unitPrice: number | null = null;
  let qty: number | null = null;
  let customerName: string | null = null;

  // 第一行非空常为产品名或标题
  if (rawLines.length > 0) {
    const first = rawLines[0];
    if (!/\d+\.?\d*/.test(first) || first.length > 30) {
      productName = first.slice(0, 200);
    }
  }

  const fullText = rawLines.join("\n");

  // 找单价
  for (const re of PRICE_PATTERNS) {
    const m = fullText.match(re);
    if (m) {
      const v = parseFloat(m[1]);
      if (!isNaN(v) && v > 0 && v < 1e6) {
        unitPrice = v;
        break;
      }
    }
  }
  if (unitPrice === null) {
    const anyNum = fullText.match(/(\d+\.?\d*)\s*(?:元|USD|\$|RMB)/i) ?? fullText.match(/\b(\d+\.\d{1,4})\b/);
    if (anyNum) unitPrice = parseFloat(anyNum[1]);
  }

  // 找数量
  for (const re of QTY_PATTERNS) {
    const m = fullText.match(re);
    if (m) {
      const v = parseInt(m[1], 10);
      if (!isNaN(v) && v > 0) {
        qty = v;
        break;
      }
    }
  }

  // 客户名：常见 "客户：xxx" 或 "Customer: xxx"
  const customerMatch = fullText.match(/(?:客户|customer|buyer)[:\s]*([^\n,，]+)/i);
  if (customerMatch) customerName = customerMatch[1].trim().slice(0, 100);

  if (!productName && rawLines.length > 0) {
    productName = rawLines[0].slice(0, 200) || "Product";
  }

  return {
    productName: productName || "Product",
    unitPrice,
    qty,
    customerName,
    rawLines,
  };
}
