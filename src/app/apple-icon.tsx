import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/* Values mirror the --color-accent / --color-on-accent tokens; ImageResponse can't read CSS variables */
const ACCENT = "#A970FF";
const ON_ACCENT = "#0b0b0c";

/** Home-screen icon: the 2a mark on the app background (iOS doesn't support transparency) */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ON_ACCENT,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="136" height="136">
          <rect x="21" y="8" width="22" height="5" rx="2.5" fill={ACCENT} />
          <rect x="21" y="8" width="5" height="15" rx="2.5" fill={ACCENT} />
          <rect x="38" y="8" width="5" height="15" rx="2.5" fill={ACCENT} />
          <rect x="5" y="20" width="54" height="38" rx="10" fill={ACCENT} />
          <polygon points="15,31 28,39 15,47 15,41.5 19.5,39 15,36.5" fill={ON_ACCENT} />
          <rect x="31" y="43" width="14" height="4.5" rx="2" fill={ON_ACCENT} />
        </svg>
      </div>
    ),
    size,
  );
}
