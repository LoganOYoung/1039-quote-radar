import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: quote } = await supabase
    .from("quotes")
    .select("product_name, fob_price_usd, company_name")
    .eq("short_id", shortId)
    .single();

  if (!quote) {
    return new Response("Not found", { status: 404 });
  }

  const productName = (quote.product_name || "Quotation").slice(0, 40);
  const companyName = quote.company_name?.trim()?.slice(0, 30) || "";
  const hasBrand = !!companyName;
  const price =
    quote.fob_price_usd != null
      ? `$${Number(quote.fob_price_usd).toFixed(2)} USD`
      : "—";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          padding: 48,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            borderRadius: 16,
            padding: "48px 56px",
            width: "90%",
            maxWidth: 1000,
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
          }}
        >
          {companyName && (
            <div
              style={{
                fontSize: 22,
                color: "#475569",
                marginBottom: 12,
                fontWeight: 600,
              }}
            >
              {companyName}
            </div>
          )}
          <div
            style={{
              fontSize: 14,
              color: "#94a3b8",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Price Quotation
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "#0f172a",
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 1.2,
            }}
          >
            {productName}
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: "#0d9488",
            }}
          >
            FOB {price}
          </div>
          {!hasBrand && (
            <div
              style={{
                fontSize: 16,
                color: "#94a3b8",
                marginTop: 28,
              }}
            >
              1039 Quote Radar
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
