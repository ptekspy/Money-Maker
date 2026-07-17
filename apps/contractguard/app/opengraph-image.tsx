import { ImageResponse } from "next/og";

export const alt =
  "API Contract Guard — block breaking OpenAPI changes before merge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "70px 76px",
        background:
          "linear-gradient(135deg, #08111f 0%, #10233c 58%, #123a49 100%)",
        color: "#f8fbff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 16,
            background: "#52e0a4",
            color: "#08111f",
            fontSize: 25,
          }}
        >
          CG
        </div>
        API Contract Guard
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div
          style={{
            display: "flex",
            color: "#52e0a4",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          GitHub-native OpenAPI protection
        </div>
        <div
          style={{
            display: "flex",
            maxWidth: 980,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.06,
            letterSpacing: -2,
          }}
        >
          Block breaking API changes before merge.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 25,
        }}
      >
        <span style={{ color: "#b9c9da" }}>
          Native pull-request checks · OpenAPI JSON &amp; YAML
        </span>
        <span
          style={{
            padding: "14px 22px",
            borderRadius: 999,
            background: "#52e0a4",
            color: "#08111f",
            fontWeight: 800,
          }}
        >
          First month £1
        </span>
      </div>
    </div>,
    size,
  );
}
