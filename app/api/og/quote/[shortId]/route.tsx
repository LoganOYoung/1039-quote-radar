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
          background: "#f5f5f5",
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
            padding: "56px 64px",
            width: "90%",
            maxWidth: 1000,
            border: "1px solid #e5e5e5",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          {companyName && (
            <div
              style={{
                fontSize: 20,
                color: "#525252",
                marginBottom: 12,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {companyName}
            </div>
          )}
          <div
            style={{
              fontSize: 11,
              color: "#a3a3a3",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              fontWeight: 500,
            }}
          >
            Price Quotation
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#171717",
              textAlign: "center",
              marginBottom: 24,
              lineHeight: 1.25,
              letterSpacing: "-0.02em",
            }}
          >
            {productName}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#171717",
              letterSpacing: "-0.02em",
            }}
          >
            FOB {price}
          </div>
          {!hasBrand && (
            <div
              style={{
                fontSize: 14,
                color: "#a3a3a3",
                marginTop: 32,
                letterSpacing: "0.02em",
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
