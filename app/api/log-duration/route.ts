import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/** 客户端离开报价页时上报停留时长（sendBeacon 调用） */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const quoteId = body?.quoteId as string | undefined;
    const durationSeconds = typeof body?.durationSeconds === "number" ? body.durationSeconds : 0;
    if (!quoteId || durationSeconds < 0) return new Response(null, { status: 400 });

    const { data: latest } = await supabase
      .from("quote_logs")
      .select("id")
      .eq("quote_id", quoteId)
      .order("viewed_at", { ascending: false })
      .limit(1)
      .single();
    if (!latest) return new Response(null, { status: 200 });

    await supabase
      .from("quote_logs")
      .update({ duration_seconds: Math.round(durationSeconds) })
      .eq("id", latest.id);
    return new Response(null, { status: 200 });
  } catch {
    return new Response(null, { status: 500 });
  }
}
