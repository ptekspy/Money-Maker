import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 96,
        background:
          "linear-gradient(145deg, #08111f 0%, #123a49 72%, #175a61 100%)",
        color: "#52e0a4",
        fontFamily: "Arial, sans-serif",
        fontSize: 190,
        fontWeight: 900,
        letterSpacing: -16,
      }}
    >
      CG
    </div>,
    size,
  );
}
