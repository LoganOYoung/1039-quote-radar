"use client";

import { useState } from "react";
import { Unlock } from "lucide-react";

type Props = { requestId: string; onGranted?: () => void };

export default function GrantAccessButton({ requestId, onGranted }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleGrant = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/access-grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDone(true);
        onGranted?.();
        if (typeof window !== "undefined") window.location.reload();
      }
    } catch {
      setLoading(false);
    }
  };

  if (done) return <span className="text-xs text-emerald-600">已授权</span>;
  return (
    <button
      type="button"
      onClick={handleGrant}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
    >
      <Unlock className="w-3.5 h-3.5" />
      {loading ? "授权中…" : "授权"}
    </button>
  );
}
