import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/** 客户端轮询：该申请是否已被授权 */
export async function GET(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get("requestId");
  if (!requestId) return new Response(JSON.stringify({ granted: false }), { status: 200, headers: { "Content-Type": "application/json" } });

  const { data } = await supabase
    .from("quote_access_requests")
    .select("status")
    .eq("session_token", requestId)
    .single();

  return new Response(
    JSON.stringify({ granted: data?.status === "granted" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
