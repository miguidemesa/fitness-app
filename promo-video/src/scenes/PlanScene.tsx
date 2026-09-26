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
import { Phone } from "../Phone";

const MOVES = [
  ["Goblet squat", "2 sets × 8"],
  ["Wall push-up", "2 sets × 10"],
  ["Glute bridge", "2 sets × 12"],
  ["Plank", "2 × 20 seconds"],
];

const MoveRow: React.FC<{
  n: number;
  name: string;
  dose: string;
  start: number;
  current: boolean;
}> = ({ n, name, dose, start, current }) => {
  const frame = useCurrentFrame();
  const opts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 26,
        padding: "22px 26px",
        borderRadius: 24,
        background: current ? "rgba(61,75,255,0.09)" : "#FFFFFF",
        border: current ? "3px solid #3D4BFF" : "3px solid #E7E6E1",
        opacity: interpolate(frame, [start, start + 8], [0, 1], opts),
        translate: interpolate(
          frame,
          [start, start + 16],
          ["60px 0px", "0px 0px"],
          { ...opts, easing: Easing.bezier(0.16, 1, 0.3, 1) },
        ),
      }}
    >
      <span
        style={{
          fontFamily: display,
          fontStyle: "italic",
          fontWeight: 800,
          fontSize: 56,
          width: 40,
          color: current ? "#3D4BFF" : "#121212",
        }}
      >
        {n}
      </span>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flexGrow: 1,
        }}
      >
        <span
          style={{
            fontFamily: body,
            fontWeight: 700,
            fontSize: 38,
            color: "#121212",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: body,
            fontWeight: 500,
            fontSize: 30,
            color: "#5E5E5A",
          }}
        >
          {dose}
          {current ? (
            <span style={{ color: "#3D4BFF", fontWeight: 700 }}>
              {" "}
              · Up next
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
};

export const PlanScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Plan"
      style={{
        backgroundColor: "#F5F5F2",
        alignItems: "center",
        padding: "150px 90px 0",
      }}
    >
      <Interactive.Div
        name="Title"
        style={{
          alignSelf: "stretch",
          fontFamily: display,
          fontStyle: "italic",
          fontWeight: 800,
          fontSize: 140,
          lineHeight: 0.92,
          textTransform: "uppercase",
          color: "#121212",
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
        Get a plan made for you.
      </Interactive.Div>
      <Interactive.Div
        name="Phone"
        style={{
          marginTop: 70,
          translate: interpolate(
            frame,
            [0.3 * fps, 1.2 * fps],
            ["0px 900px", "0px 0px"],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        <Phone>
          <span
            style={{
              fontFamily: display,
              fontStyle: "italic",
              fontWeight: 800,
              fontSize: 72,
              textTransform: "uppercase",
              color: "#121212",
            }}
          >
            Today
          </span>
          <div
            style={{
              background: "#121212",
              borderRadius: 34,
              padding: "30px 32px",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <span
              style={{
                fontFamily: body,
                fontWeight: 500,
                fontSize: 26,
                color: "#BDBCB7",
              }}
            >
              Day 1 of 3
            </span>
            <span
              style={{
                fontFamily: display,
                fontStyle: "italic",
                fontWeight: 800,
                fontSize: 56,
                lineHeight: 0.95,
                textTransform: "uppercase",
                color: "#FFFFFF",
              }}
            >
              Full body, easy start
            </span>
            <span
              style={{
                fontFamily: body,
                fontWeight: 700,
                fontSize: 30,
                color: "#FFFFFF",
              }}
            >
              30 min · 4 moves · Beginner
            </span>
          </div>
          {MOVES.map(([name, dose], i) => (
            <MoveRow
              key={name}
              n={i + 1}
              name={name}
              dose={dose}
              current={i === 0}
              start={Math.round((1.3 + i * 0.25) * fps)}
            />
          ))}
          <div
            style={{
              display: "flex",
              gap: 20,
              alignItems: "center",
              background: "#FFFFFF",
              border: "3px solid #E7E6E1",
              borderRadius: 28,
              padding: "20px 24px",
              opacity: interpolate(frame, [2.8 * fps, 3.3 * fps], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 42,
                background: "#EFE7DD",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CapyFlat size={84} mood="hello" band="#3D4BFF" headOnly />
            </div>
            <span
              style={{
                fontFamily: body,
                fontWeight: 500,
                fontSize: 32,
                lineHeight: 1.35,
                color: "#121212",
              }}
            >
              Day one! Go slow. Good form beats speed.
            </span>
          </div>
        </Phone>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
