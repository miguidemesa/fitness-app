import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CapyFlat } from "../CapyFlat";
import { body, display } from "../fonts";

export const AdaptScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Adapt"
      style={{
        backgroundColor: "#121212",
        padding: "170px 90px 150px",
        gap: 40,
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
        It adapts to how you feel.
      </Interactive.Div>

      <Interactive.Div
        name="Log card"
        style={{
          background: "#FFFFFF",
          borderRadius: 40,
          padding: "40px 44px",
          display: "flex",
          flexDirection: "column",
          gap: 26,
          opacity: interpolate(frame, [0.6 * fps, 0.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.6 * fps, 1.3 * fps],
            ["0px 100px", "0px 0px"],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        <span
          style={{
            fontFamily: body,
            fontWeight: 700,
            fontSize: 36,
            color: "#5E5E5A",
          }}
        >
          After your squats
        </span>
        <span
          style={{
            fontFamily: body,
            fontWeight: 700,
            fontSize: 56,
            color: "#121212",
          }}
        >
          Any pain?
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          <div
            style={{
              flexGrow: 1,
              flexBasis: 0,
              borderRadius: 26,
              border: "4px solid #E7E6E1",
              padding: "26px 0",
              textAlign: "center",
              fontFamily: body,
              fontWeight: 700,
              fontSize: 44,
              color: "#121212",
            }}
          >
            No
          </div>
          <Interactive.Div
            name="Pain answer"
            style={{
              flexGrow: 1,
              flexBasis: 0,
              borderRadius: 26,
              padding: "26px 0",
              textAlign: "center",
              fontFamily: body,
              fontWeight: 700,
              fontSize: 44,
              border: "4px solid #B3261E",
              color: "#8C1D18",
              backgroundColor: interpolateColors(
                frame,
                [1.5 * fps, 1.7 * fps],
                ["#FFFFFF", "#FDECEA"],
              ),
              scale: interpolate(
                frame,
                [1.5 * fps, 1.6 * fps, 1.8 * fps],
                [1, 0.94, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              ),
            }}
          >
            Yes · Knee
          </Interactive.Div>
        </div>
      </Interactive.Div>

      <Interactive.Svg
        name="Arrow"
        width={900}
        height={90}
        viewBox="0 0 900 90"
        style={{
          opacity: interpolate(frame, [2 * fps, 2.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Interactive.Path
          name="Arrow path"
          d="M450 6 V 70 M 424 46 L 450 74 L 476 46"
          stroke="#7C87FF"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Interactive.Svg>

      <Interactive.Div
        name="Change card"
        style={{
          background: "#3D4BFF",
          borderRadius: 40,
          padding: "40px 44px",
          display: "flex",
          gap: 32,
          alignItems: "center",
          opacity: interpolate(frame, [2.3 * fps, 2.6 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [2.3 * fps, 3 * fps],
            ["0px 100px", "0px 0px"],
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
            width: 170,
            height: 170,
            borderRadius: 85,
            background: "#FFFFFF",
            overflow: "hidden",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CapyFlat size={160} mood="caring" band="#3D4BFF" headOnly />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span
            style={{
              fontFamily: body,
              fontWeight: 700,
              fontSize: 50,
              lineHeight: 1.2,
              color: "#FFFFFF",
            }}
          >
            Swapped squats for leg lifts.
          </span>
          <span
            style={{
              fontFamily: body,
              fontWeight: 500,
              fontSize: 38,
              lineHeight: 1.35,
              color: "#E3E6FF",
            }}
          >
            Because your knee hurt. It never gets harder while it hurts.
          </span>
        </div>
      </Interactive.Div>

      <Interactive.Div
        name="Footnote"
        style={{
          marginTop: "auto",
          fontFamily: body,
          fontWeight: 700,
          fontSize: 48,
          lineHeight: 1.3,
          color: "#BDBCB7",
          opacity: interpolate(frame, [3.6 * fps, 4.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Too easy? A little harder next week. Too hard? A little easier.
      </Interactive.Div>
    </AbsoluteFill>
  );
};
