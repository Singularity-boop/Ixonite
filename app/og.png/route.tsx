import { ImageResponse } from "next/og";

// Social share card, rendered once at build time to out/og.png so shared
// hosting serves it with a proper image/png type.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f2f3ef",
          color: "#121316",
          padding: "56px 64px 0",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 44, height: 44, background: "#121316", display: "flex" }} />
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 4 }}>IXONITE</div>
          <div
            style={{
              marginLeft: "auto",
              background: "#ffc20e",
              padding: "10px 22px",
              fontSize: 26,
              fontWeight: 800,
              border: "3px solid #121316",
            }}
          >
            ixonit.com
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 104, fontWeight: 900, lineHeight: 0.95, letterSpacing: -2 }}>
          <div>WE BREAK IN.</div>
          <div>YOU GET THE EVIDENCE.</div>
        </div>
        <div style={{ fontSize: 30, color: "#444a54", display: "flex" }}>
          Web app, network and mobile penetration testing · SOC services
        </div>
        <div
          style={{
            display: "flex",
            background: "#cf2a1f",
            color: "#fff",
            height: 64,
            margin: "24px -80px 0",
            alignItems: "center",
            gap: 48,
            paddingLeft: 80,
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 6,
            transform: "rotate(-1.5deg)",
          }}
        >
          <span>EVIDENCE</span>
          <span>SEALED</span>
          <span>DO NOT TAMPER</span>
          <span>IXONITE</span>
          <span>EVIDENCE</span>
          <span>SEALED</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
