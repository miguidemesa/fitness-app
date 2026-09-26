import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const BODY = "#8E5F3C";
const HEAD = "#A8754F";
const DARK = "#7A5033";
const MUZZLE = "#C99B72";
const INK = "#2B1D15";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Capy built from primitives. Every motion is driven by useCurrentFrame()
 * (drop-in with a bounce, landing squash, slow turntable, wave, blinks).
 */
export const Capy3D: React.FC<{
  width: number;
  height: number;
  accent: string;
  startWaving?: number;
}> = ({ width, height, accent, startWaving = 40 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fall = spring({
    frame,
    fps,
    config: { damping: 11, mass: 0.9, stiffness: 120 },
  });
  const y = interpolate(fall, [0, 1], [5, 0]);
  const squash = interpolate(frame, [9, 13, 22], [1, 0.84, 1], clamp);
  const turn =
    interpolate(frame, [0, 165], [-0.6, -0.2], clamp) +
    Math.sin(frame / 22) * 0.05;
  const nod = Math.sin(frame / 14) * 0.04;
  const raise = interpolate(
    frame,
    [startWaving - 12, startWaving],
    [0.2, 2.3],
    clamp,
  );
  const wave =
    frame > startWaving ? Math.sin((frame - startWaving) / 3.2) * 0.35 : 0;
  const blink = interpolate(
    frame,
    [70, 72, 74, 118, 120, 122],
    [1, 0.12, 1, 1, 0.12, 1],
    clamp,
  );
  const shadow = interpolate(y, [0, 5], [1, 0.35], clamp);

  return (
    // R3F aims the camera at the origin, so the scene is shifted down to centre Capy in frame.
    <ThreeCanvas
      width={width}
      height={height}
      camera={{ position: [0, 1.2, 9.4], fov: 30 }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 6, 5]} intensity={2.6} />
      <directionalLight
        position={[-5, 2, -3]}
        intensity={0.8}
        color="#cfd6ff"
      />
      <group position={[0, -1.35, 0]}>
        <mesh
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[shadow, shadow, shadow]}
        >
          <circleGeometry args={[1.5, 48]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.12} />
        </mesh>

        <group
          position={[0, y, 0]}
          rotation={[0, turn, 0]}
          scale={[2 - squash, squash, 2 - squash]}
        >
          {/* body */}
          <mesh position={[0, 0.85, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.8, 1.3, 8, 24]} />
            <meshStandardMaterial color={BODY} roughness={0.85} />
          </mesh>
          {[
            [0.45, -0.6],
            [-0.45, -0.6],
            [0.45, 0.45],
            [-0.45, 0.45],
          ].map(([x, z]) => (
            <mesh key={`${x}${z}`} position={[x, 0.22, z]}>
              <cylinderGeometry args={[0.18, 0.2, 0.44, 16]} />
              <meshStandardMaterial color={DARK} roughness={0.9} />
            </mesh>
          ))}

          {/* waving arm, pivoting at the shoulder */}
          <group position={[0.72, 1.2, 0.75]} rotation={[0, 0, -raise - wave]}>
            <mesh position={[0, 0.38, 0]}>
              <capsuleGeometry args={[0.15, 0.5, 6, 16]} />
              <meshStandardMaterial color={BODY} roughness={0.85} />
            </mesh>
          </group>

          {/* head */}
          <group position={[0, 1.78, 0.95]} rotation={[0.08 + nod, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <capsuleGeometry args={[0.56, 0.62, 8, 24]} />
              <meshStandardMaterial color={HEAD} roughness={0.8} />
            </mesh>
            <mesh position={[0, -0.14, 0.62]} scale={[0.44, 0.34, 0.36]}>
              <sphereGeometry args={[1, 32, 24]} />
              <meshStandardMaterial color={MUZZLE} roughness={0.8} />
            </mesh>
            {[-0.12, 0.12].map((x) => (
              <mesh key={`n${x}`} position={[x, -0.06, 0.96]}>
                <sphereGeometry args={[0.05, 12, 12]} />
                <meshStandardMaterial color={INK} />
              </mesh>
            ))}
            {/* eyes sit on the surface of the front cap, above the muzzle */}
            {[-0.3, 0.3].map((x) => (
              <group
                key={`e${x}`}
                position={[x, 0.28, 0.72]}
                scale={[1, blink, 1]}
              >
                <mesh>
                  <sphereGeometry args={[0.09, 16, 16]} />
                  <meshStandardMaterial color={INK} roughness={0.3} />
                </mesh>
                <mesh position={[0.03, 0.035, 0.07]}>
                  <sphereGeometry args={[0.025, 8, 8]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            ))}
            {[-0.34, 0.34].map((x) => (
              <mesh key={`r${x}`} position={[x, 0.5, -0.3]} scale={[1, 1, 0.6]}>
                <sphereGeometry args={[0.17, 16, 16]} />
                <meshStandardMaterial color={DARK} roughness={0.9} />
              </mesh>
            ))}
            {/* sweatband around the forehead */}
            <mesh position={[0, 0.02, -0.05]}>
              <torusGeometry args={[0.58, 0.075, 16, 48]} />
              <meshStandardMaterial color={accent} roughness={0.55} />
            </mesh>
          </group>
        </group>
      </group>
    </ThreeCanvas>
  );
};
