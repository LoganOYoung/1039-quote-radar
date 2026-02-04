/**
 * 老外打开报价链接后，通知企业微信/飞书机器人
 * 配置 FEISHU_WEBHOOK_URL 或 WECOM_WEBHOOK_URL 后生效
 */
type QuoteInfo = { product_name: string; short_id: string };

export async function notifyQuoteViewed(quote: QuoteInfo, city: string): Promise<void> {
  const feishu = process.env.FEISHU_WEBHOOK_URL;
  const wecom = process.env.WECOM_WEBHOOK_URL;
  const text = `您的报价单「${quote.product_name}」刚刚被来自 ${city} 的客户打开。`;

  if (feishu) {
    try {
      await fetch(feishu, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msg_type: "text",
          content: { text },
        }),
      });
    } catch {
      // ignore
    }
  }

  if (wecom) {
    try {
      await fetch(wecom, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msgtype: "text",
          text: { content: text },
        }),
      });
    } catch {
      // ignore
    }
  }
}

/** 买家请求解锁报价时通知供应商 */
export async function notifyAccessRequested(quote: QuoteInfo, city: string): Promise<void> {
  const feishu = process.env.FEISHU_WEBHOOK_URL;
  const wecom = process.env.WECOM_WEBHOOK_URL;
  const text = `来自 ${city} 的买家请求解锁报价「${quote.product_name}」。请到我的报价授权后，客户刷新即可看到价格。`;

  if (feishu) {
    try {
      await fetch(feishu, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msg_type: "text",
          content: { text },
        }),
      });
    } catch {
      // ignore
    }
  }
  if (wecom) {
    try {
      await fetch(wecom, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msgtype: "text",
          text: { content: text },
        }),
      });
    } catch {
      // ignore
    }
  }
}
