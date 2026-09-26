import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Capy3D } from "../Capy3D";
import { body, display } from "../fonts";

export const MeetCapyScene = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Meet Capy" style={{ backgroundColor: "#F5F5F2" }}>
      <AbsoluteFill name="3D Capy" style={{ top: 60 }}>
        <Capy3D
          width={1080}
          height={1250}
          accent="#3D4BFF"
          startWaving={1.4 * fps}
        />
      </AbsoluteFill>
      <Interactive.Div
        name="Speech bubble"
        style={{
          position: "absolute",
          top: 330,
          right: 90,
          padding: "26px 38px",
          borderRadius: 44,
          background: "#FFFFFF",
          border: "4px solid #3D4BFF",
          fontFamily: body,
          fontWeight: 700,
          fontSize: 50,
          color: "#121212",
          boxShadow: "0 16px 40px rgba(18,18,18,0.12)",
          transformOrigin: "bottom left",
          opacity: interpolate(frame, [1.8 * fps, 2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          scale: interpolate(frame, [1.8 * fps, 2.4 * fps], [0.6, 1], {
            easing: Easing.spring({ damping: 12 }),
            output: "perceptual-scale",
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Hi! No rush.
      </Interactive.Div>
      <AbsoluteFill
        name="Copy"
        style={{ justifyContent: "flex-end", padding: "0 90px 170px", gap: 22 }}
      >
        <Interactive.Div
          name="Title"
          style={{
            fontFamily: display,
            fontStyle: "italic",
            fontWeight: 800,
            fontSize: 180,
            lineHeight: 0.9,
            textTransform: "uppercase",
            color: "#121212",
            opacity: interpolate(frame, [0.9 * fps, 1.3 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [0.9 * fps, 1.6 * fps],
              ["0px 60px", "0px 0px"],
              {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          Meet Capy.
        </Interactive.Div>
        <Interactive.Div
          name="Subtitle"
          style={{
            fontFamily: body,
            fontWeight: 500,
            fontSize: 60,
            lineHeight: 1.3,
            color: "#3A3A37",
            opacity: interpolate(frame, [1.3 * fps, 1.8 * fps], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(
              frame,
              [1.3 * fps, 2 * fps],
              ["0px 40px", "0px 0px"],
              {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            ),
          }}
        >
          Your calm first-workout coach.
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
