import React from "react";

type Mood = "hello" | "proud" | "caring";

const FACE: Record<
  Mood,
  {
    eyesFill: string;
    eyesLine: string;
    brows: string;
    mouth: string;
    blush: boolean;
  }
> = {
  hello: {
    eyesFill:
      "M72.5 84 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 M116.5 84 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0",
    eyesLine: "",
    brows: "",
    mouth: "M90 118 q10 8 20 0",
    blush: true,
  },
  proud: {
    eyesFill: "",
    eyesLine: "M71 87 q7 -8 14 0 M115 87 q7 -8 14 0",
    brows: "",
    mouth: "M88 116 q12 11 24 0",
    blush: true,
  },
  caring: {
    eyesFill:
      "M73 86 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M117 86 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0",
    eyesLine: "",
    brows: "M70 77 L84 72 M130 77 L116 72",
    mouth: "M93 121 q7 -3 14 0",
    blush: false,
  },
};

/** The flat 2D Capy from the design canvas. `wave` is the arm angle in degrees; `blink` 0..1 closes the eyes. */
export const CapyFlat: React.FC<{
  size: number;
  mood: Mood;
  band: string;
  wave?: number;
  blink?: number;
  headOnly?: boolean;
}> = ({ size, mood, band, wave, blink = 0, headOnly = false }) => {
  const f = FACE[mood];
  return (
    <svg
      width={size}
      height={size}
      viewBox={headOnly ? "40 30 120 112" : "0 0 200 200"}
      aria-hidden="true"
    >
      {!headOnly && (
        <>
          <ellipse cx="100" cy="186" rx="62" ry="7" fill="rgba(0,0,0,0.12)" />
          <ellipse cx="100" cy="150" rx="64" ry="40" fill="#8E5F3C" />
          <ellipse cx="72" cy="182" rx="14" ry="7" fill="#7A5033" />
          <ellipse cx="128" cy="182" rx="14" ry="7" fill="#7A5033" />
          {wave !== undefined && (
            <g transform={`rotate(${wave} 148 140)`}>
              <path
                d="M148 140 q20 -12 22 -40"
                stroke="#8E5F3C"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}
        </>
      )}
      <circle cx="60" cy="48" r="11" fill="#7A5033" />
      <circle cx="140" cy="48" r="11" fill="#7A5033" />
      <rect x="44" y="38" width="112" height="96" rx="42" fill="#A8754F" />
      <rect x="44" y="56" width="112" height="13" fill={band} />
      <rect x="66" y="92" width="68" height="40" rx="20" fill="#C99B72" />
      <ellipse cx="88" cy="102" rx="3.4" ry="2.4" fill="#2B1D15" />
      <ellipse cx="112" cy="102" rx="3.4" ry="2.4" fill="#2B1D15" />
      {/* scale the eyes vertically around y=84 */}
      <g
        transform={`translate(0 ${84 * 0.9 * blink}) scale(1 ${1 - 0.9 * blink})`}
      >
        <path d={f.eyesFill} fill="#2B1D15" />
      </g>
      <path
        d={f.eyesLine}
        stroke="#2B1D15"
        strokeWidth="3.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={f.brows}
        stroke="#2B1D15"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={f.mouth}
        stroke="#2B1D15"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {f.blush && (
        <>
          <circle cx="62" cy="98" r="6" fill="#E98A7A" opacity="0.55" />
          <circle cx="138" cy="98" r="6" fill="#E98A7A" opacity="0.55" />
        </>
      )}
    </svg>
  );
};
