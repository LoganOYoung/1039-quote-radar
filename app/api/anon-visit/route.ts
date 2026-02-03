import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/** 微信等环境访问时记录到 anonymous_visits（客户端 POST） */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const platform = (body?.platform as string) || "unknown";
    const referrer = (body?.referrer as string) || "";

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";

    await supabase.from("anonymous_visits").insert({
      platform,
      referrer: referrer.slice(0, 500),
      ip_address: ip || null,
    });

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 500 });
  }
}
