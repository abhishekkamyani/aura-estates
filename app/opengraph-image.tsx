import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded 1200×630 share card, used wherever a page doesn't set its own image. */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #1c1c1e 0%, #2b2b2f 100%)",
          color: "#fcfbf9",
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, color: "#c9a96e", fontSize: 28, letterSpacing: 8 }}>
          <div style={{ width: 64, height: 2, background: "#c9a96e" }} />
          LUXURY REAL ESTATE
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, lineHeight: 1, fontWeight: 600 }}>{siteConfig.name}</div>
          <div style={{ marginTop: 28, fontSize: 40, color: "#d9d4ca", maxWidth: 900 }}>{siteConfig.tagline}</div>
        </div>
        <div style={{ fontSize: 26, color: "#9a968e" }}>
          {new URL(siteConfig.url).host}
        </div>
      </div>
    ),
    size,
  );
}
