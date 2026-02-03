import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/** 供应商在仪表盘点击「授权」：将申请状态设为 granted */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestId = body?.requestId as string | undefined;
    if (!requestId) return new Response(JSON.stringify({ error: "requestId required" }), { status: 400 });

    const { error } = await supabase
      .from("quote_access_requests")
      .update({ status: "granted", granted_at: new Date().toISOString() })
      .eq("session_token", requestId)
      .eq("status", "pending");

    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
