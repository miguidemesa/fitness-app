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

export const OutroScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Outro"
      style={{
        backgroundColor: "#3D4BFF",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 90px",
        gap: 20,
      }}
    >
      <Interactive.Div
        name="Capy"
        style={{
          transformOrigin: "bottom center",
          scale: interpolate(frame, [0, 0.8 * fps], [0.3, 1], {
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <CapyFlat
          size={640}
          mood="proud"
          band="#FFFFFF"
          wave={frame > 12 ? Math.sin((frame - 12) / 4) * 14 : 0}
        />
      </Interactive.Div>
      <Interactive.Div
        name="Wordmark"
        style={{
          fontFamily: display,
          fontStyle: "italic",
          fontWeight: 800,
          fontSize: 280,
          lineHeight: 0.85,
          textTransform: "uppercase",
          color: "#FFFFFF",
          opacity: interpolate(frame, [0.5 * fps, 0.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(
            frame,
            [0.5 * fps, 1.2 * fps],
            ["0px 60px", "0px 0px"],
            {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        Capy
      </Interactive.Div>
      <Interactive.Div
        name="Product name"
        style={{
          fontFamily: body,
          fontWeight: 700,
          fontSize: 72,
          color: "#FFFFFF",
          opacity: interpolate(frame, [0.8 * fps, 1.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Beginner Workouts
      </Interactive.Div>
      <Interactive.Div
        name="Tagline"
        style={{
          fontFamily: body,
          fontWeight: 500,
          fontSize: 54,
          color: "#E3E6FF",
          opacity: interpolate(frame, [1.4 * fps, 1.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Start where you are.
      </Interactive.Div>
      <Interactive.Div
        name="Availability"
        style={{
          marginTop: 50,
          padding: "26px 48px",
          borderRadius: 999,
          background: "#FFFFFF",
          fontFamily: body,
          fontWeight: 700,
          fontSize: 46,
          color: "#3D4BFF",
          opacity: interpolate(frame, [2.2 * fps, 2.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [2.2 * fps, 2.8 * fps], [0.7, 1], {
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Coming soon · iPhone &amp; Android
      </Interactive.Div>
    </AbsoluteFill>
  );
};
