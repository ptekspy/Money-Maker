import { ImageResponse } from "next/og";

export const alt = "LetDue — Know what expires next";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function Mark() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 9,
        width: 116,
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: "#18220d",
          borderRadius: 17,
          display: "flex",
          height: 48,
          paddingLeft: 18,
          width: 116,
        }}
      >
        <div
          style={{
            background: "#f4f5ef",
            borderRadius: 3,
            height: 7,
            width: 35,
          }}
        />
      </div>
      <div
        style={{
          alignItems: "center",
          background: "#d5dbc9",
          borderRadius: 17,
          display: "flex",
          height: 48,
          justifyContent: "space-between",
          padding: "0 15px 0 18px",
          width: 116,
        }}
      >
        <div
          style={{
            background: "#f4f5ef",
            borderRadius: 3,
            height: 7,
            width: 25,
          }}
        />
        <div
          style={{
            background: "#d9ff73",
            borderRadius: 999,
            height: 28,
            width: 28,
          }}
        />
      </div>
    </div>
  );
}

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#f4f5ef",
        color: "#18220d",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "70px 78px",
        width: "100%",
      }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: 28 }}>
        <Mark />
        <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -4 }}>
          LetDue
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            fontSize: 74,
            fontWeight: 800,
            letterSpacing: -4,
            lineHeight: 0.95,
            maxWidth: 900,
          }}
        >
          Know what expires next.
        </div>
        <div style={{ color: "#687260", fontSize: 28 }}>
          Certificate storage and deadline reminders for self-managing
          landlords.
        </div>
      </div>
      <div
        style={{
          borderTop: "2px solid #d5dbc9",
          color: "#687260",
          display: "flex",
          fontSize: 18,
          fontWeight: 700,
          justifyContent: "space-between",
          letterSpacing: 2,
          paddingTop: 24,
          textTransform: "uppercase",
        }}
      >
        <span>letdue.com</span>
        <span>A Paddy Systems company</span>
      </div>
    </div>,
    size,
  );
}
