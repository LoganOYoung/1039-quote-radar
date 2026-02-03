"use client";

import { useEffect, useRef } from "react";

export default function WechatVisitLogger() {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    if (!/MicroMessenger/i.test(ua)) return;
    sent.current = true;
    fetch("/api/anon-visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: "Wechat",
        referrer: typeof document !== "undefined" ? document.referrer : "",
      }),
    }).catch(() => {});
  }, []);

  return null;
}
