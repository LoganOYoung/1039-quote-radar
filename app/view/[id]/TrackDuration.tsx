"use client";

import { useEffect, useRef } from "react";

export default function TrackDuration({ quoteId }: { quoteId: string }) {
  const startRef = useRef<number>(Date.now() / 1000);

  useEffect(() => {
    const sendDuration = () => {
      const duration = Date.now() / 1000 - startRef.current;
      fetch("/api/log-duration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId, durationSeconds: duration }),
        keepalive: true,
      }).catch(() => {});
    };

    const onLeave = () => {
      sendDuration();
    };

    window.addEventListener("pagehide", onLeave);
    window.addEventListener("beforeunload", onLeave);
    const vis = () => {
      if (document.visibilityState === "hidden") sendDuration();
    };
    document.addEventListener("visibilitychange", vis);

    return () => {
      window.removeEventListener("pagehide", onLeave);
      window.removeEventListener("beforeunload", onLeave);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [quoteId]);

  return null;
}
