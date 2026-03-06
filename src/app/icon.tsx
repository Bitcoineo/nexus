import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#007AFF",
          borderRadius: 6,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <line
            x1="5"
            y1="20"
            x2="5"
            y2="4"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="5"
            y1="4"
            x2="19"
            y2="20"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line
            x1="19"
            y1="20"
            x2="19"
            y2="4"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="5" cy="20" r="2.5" fill="white" />
          <circle cx="5" cy="4" r="2.5" fill="white" />
          <circle cx="19" cy="20" r="2.5" fill="white" />
          <circle cx="19" cy="4" r="2.5" fill="white" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
