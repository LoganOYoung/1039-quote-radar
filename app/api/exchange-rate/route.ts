import { NextResponse } from "next/server";

/** 实时汇率：USD → CNY，数据来自 Frankfurter（ECB 源），无需 API Key */
export async function GET() {
  try {
    const res = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=CNY",
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = (await res.json()) as { rates?: { CNY?: number }; date?: string };
    const rate = data?.rates?.CNY;
    if (typeof rate !== "number" || rate <= 0) throw new Error("Invalid rate");
    return NextResponse.json({ rate: Number(rate.toFixed(4)), date: data.date ?? null });
  } catch (e) {
    console.error("Exchange rate fetch error:", e);
    return NextResponse.json(
      { error: "Failed to fetch exchange rate" },
      { status: 502 }
    );
  }
}
