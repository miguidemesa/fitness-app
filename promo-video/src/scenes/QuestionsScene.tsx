import React from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CapyFlat } from "../CapyFlat";
import { body, display } from "../fonts";

const Answer: React.FC<{ label: string; value: string; start: number }> = ({
  label,
  value,
  start,
}) => {
  const frame = useCurrentFrame();
  const t = (s: number) => start + s;
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  const tick = interpolate(frame, [t(12), t(24)], [0, 1], {
    ...opts,
    easing: Easing.spring({ damping: 11 }),
  });
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 36,
        padding: "38px 44px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 30,
        boxShadow: "0 24px 60px rgba(10,14,80,0.28)",
        opacity: interpolate(frame, [t(0), t(8)], [0, 1], opts),
        translate: interpolate(frame, [t(0), t(18)], ["0px 120px", "0px 0px"], {
          ...opts,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          style={{
            fontFamily: body,
            fontWeight: 700,
            fontSize: 36,
            color: "#5E5E5A",
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: body,
            fontWeight: 700,
            fontSize: 62,
            color: "#121212",
          }}
        >
          {value}
        </span>
      </div>
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 46,
          background: "#3D4BFF",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: `${tick}`,
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>
    </div>
  );
};

export const QuestionsScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Questions"
      style={{
        backgroundColor: "#3D4BFF",
        padding: "170px 90px 150px",
        gap: 34,
      }}
    >
      <Interactive.Div
        name="Title"
        style={{
          fontFamily: display,
          fontStyle: "italic",
          fontWeight: 800,
          fontSize: 150,
          lineHeight: 0.92,
          textTransform: "uppercase",
          color: "#FFFFFF",
          marginBottom: 40,
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 0.7 * fps],
            ["0px 60px", "0px 0px"],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        Answer a few easy questions.
      </Interactive.Div>
      <Answer
        label="Your goal"
        value="Get stronger"
        start={Math.round(0.6 * fps)}
      />
      <Answer
        label="Your time"
        value="3 days · 30 min"
        start={Math.round(1.3 * fps)}
      />
      <Answer
        label="Your equipment"
        value="Dumbbells, mat"
        start={Math.round(2 * fps)}
      />
      <Interactive.Div
        name="Capy note"
        style={{
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          gap: 28,
          opacity: interpolate(frame, [3.1 * fps, 3.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [3.1 * fps, 3.8 * fps],
            ["0px 40px", "0px 0px"],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            background: "#FFFFFF",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <CapyFlat size={140} mood="hello" band="#3D4BFF" headOnly />
        </div>
        <span
          style={{
            fontFamily: body,
            fontWeight: 700,
            fontSize: 54,
            lineHeight: 1.25,
            color: "#FFFFFF",
          }}
        >
          No gym jargon. Plus a quick health check first.
        </span>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
