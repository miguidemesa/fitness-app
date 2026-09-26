import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { body, display } from "../fonts";

export const HookScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Hook"
      style={{
        backgroundColor: "#121212",
        justifyContent: "center",
        padding: "0 90px",
        gap: 10,
      }}
    >
      <Interactive.Div
        name="Line 1"
        style={{
          fontFamily: display,
          fontStyle: "italic",
          fontWeight: 800,
          fontSize: 190,
          lineHeight: 0.9,
          textTransform: "uppercase",
          color: "#FFFFFF",
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0, 0.7 * fps],
            ["0px 90px", "0px 0px"],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        Never worked out
      </Interactive.Div>
      <Interactive.Div
        name="Line 2"
        style={{
          fontFamily: display,
          fontStyle: "italic",
          fontWeight: 800,
          fontSize: 190,
          lineHeight: 0.9,
          textTransform: "uppercase",
          color: "#FFFFFF",
          opacity: interpolate(frame, [0.25 * fps, 0.65 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.25 * fps, 0.95 * fps],
            ["0px 90px", "0px 0px"],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        before?
      </Interactive.Div>
      <Interactive.Div
        name="Perfect"
        style={{
          marginTop: 60,
          fontFamily: display,
          fontStyle: "italic",
          fontWeight: 800,
          fontSize: 250,
          lineHeight: 0.9,
          textTransform: "uppercase",
          color: "#7C87FF",
          transformOrigin: "left center",
          opacity: interpolate(frame, [1.7 * fps, 1.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [1.7 * fps, 2.4 * fps], [0.55, 1], {
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Perfect.
      </Interactive.Div>
      <Interactive.Div
        name="Subline"
        style={{
          marginTop: 30,
          fontFamily: body,
          fontWeight: 500,
          fontSize: 58,
          lineHeight: 1.3,
          color: "#BDBCB7",
          opacity: interpolate(frame, [2.6 * fps, 3.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [2.6 * fps, 3.3 * fps],
            ["0px 30px", "0px 0px"],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        This app was made for you.
      </Interactive.Div>
      <Interactive.Svg
        name="Route line"
        width={1080}
        height={220}
        viewBox="0 0 1080 220"
        style={{ position: "absolute", left: 0, bottom: 150 }}
      >
        <Interactive.Path
          name="Route"
          d="M -20 180 C 160 180, 180 90, 340 100 S 520 190, 640 120 S 820 20, 900 60 S 1040 150, 1100 40"
          stroke="#3D4BFF"
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={1500}
          strokeDashoffset={interpolate(
            frame,
            [0.4 * fps, 3.6 * fps],
            [1500, 0],
            {
              easing: Easing.bezier(0.45, 0, 0.2, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          )}
        />
      </Interactive.Svg>
    </AbsoluteFill>
  );
};
