import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #064e3b 0%, #022c22 100%)",
          borderRadius: "22%",
        }}
      >
        {/* Radar / scope style: circle + crosshair */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            border: "4px solid #34d399",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              width: 4,
              height: 40,
              background: "#34d399",
              position: "absolute",
              transform: "rotate(-45deg)",
            }}
          />
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#34d399",
            }}
          />
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
