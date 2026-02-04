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
          background: "linear-gradient(135deg, #0d9488 0%, #059669 50%, #0891b2 100%)",
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
            padding: "40px 48px",
            width: "90%",
            maxWidth: 1000,
          }}
        >
          {companyName && (
            <div
              style={{
                fontSize: 24,
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              {companyName}
            </div>
          )}
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#0f172a",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            {productName}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#0d9488",
            }}
          >
            FOB {price}
          </div>
          <div
            style={{
              fontSize: 18,
              color: "#94a3b8",
              marginTop: 24,
            }}
          >
            Price Quotation · 1039 Quote Radar
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
