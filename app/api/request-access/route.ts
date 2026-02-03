import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";
import { notifyAccessRequested } from "@/lib/notify";

const COOKIE_NAME = "quote_access_request";

/** 买家点击 Unlock Full Quote 时调用：创建申请、设 cookie、通知供应商 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const quoteId = body?.quoteId as string | undefined;
    if (!quoteId) return new Response(JSON.stringify({ error: "quoteId required" }), { status: 400 });

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const city = req.headers.get("x-vercel-ip-city") || "Unknown";
    const userAgent = req.headers.get("user-agent") || "";

    const sessionToken = nanoid(24);
    const { error } = await supabase.from("quote_access_requests").insert({
      quote_id: quoteId,
      ip_address: ip,
      location_city: city,
      user_agent: userAgent,
      session_token: sessionToken,
      status: "pending",
    });
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

    const { data: quote } = await supabase
      .from("quotes")
      .select("product_name, short_id")
      .eq("id", quoteId)
      .single();
    if (quote) await notifyAccessRequested(quote, city);

    const maxAge = 60 * 60 * 24 * 30;
    const setCookie = `${COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`;
    return new Response(JSON.stringify({ requestId: sessionToken }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": setCookie,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
