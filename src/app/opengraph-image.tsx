import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

/**
 * Social share card.
 *
 * Generated rather than photographed so it always carries the current brand
 * line. Colours are hardcoded from the tokens in `globals.css`, because
 * ImageResponse renders outside the document and cannot read the stylesheet.
 *
 * Satori requires an explicit `display` on any element with more than one child,
 * so every nested element here sets it.
 */
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SANS = "Helvetica, Arial, sans-serif";
const SERIF = "Georgia, Times New Roman, serif";

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#14100d",
          backgroundImage:
            "radial-gradient(120% 90% at 15% 100%, rgba(184,118,58,0.22), transparent 62%)",
          padding: "72px 80px",
          fontFamily: SERIF,
          color: "#f0e9dd",
        }}
      >
        {/* Top rule: monogram dot plus location line. */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              width: 10,
              height: 10,
              borderRadius: 999,
              backgroundColor: "#d9994f",
            }}
          />
          <div
            style={{
              display: "flex",
              fontFamily: SANS,
              fontSize: 22,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#d9994f",
            }}
          >
            Toronto — Est. {siteConfig.founded}
          </div>
        </div>

        {/* Headline block. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 104,
              lineHeight: 1.02,
              letterSpacing: -3,
            }}
          >
            <div style={{ display: "flex" }}>Specialty coffee,</div>
            <div style={{ display: "flex", fontStyle: "italic", color: "#e2d6c2" }}>
              crafted with
            </div>
            <div style={{ display: "flex" }}>intention.</div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 44,
              width: 180,
              height: 1,
              backgroundColor: "rgba(240,233,221,0.24)",
            }}
          />

          <div
            style={{
              display: "flex",
              marginTop: 30,
              fontFamily: SANS,
              fontSize: 24,
              color: "#9c8d7c",
              maxWidth: 760,
            }}
          >
            One blend, roasted weekly on site. Queen Street West, seven days a week.
          </div>
        </div>
      </div>
    ),
    size,
  );
}