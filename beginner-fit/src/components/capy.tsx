import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { haptic } from '@/lib/haptics';
import { colors, motion } from '@/theme';

export type Mood = 'hello' | 'caring' | 'cheer' | 'rest';

const EYE_DOTS = 'M72.5 84 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 M116.5 84 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0';
const FACE: Record<Mood, { dots?: string; lines?: string; brows?: string; mouth: string; blush: boolean }> = {
  hello: { dots: EYE_DOTS, mouth: 'M90 118 q10 8 20 0', blush: true },
  caring: {
    dots: 'M73 86 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M117 86 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0',
    brows: 'M70 77 L84 72 M130 77 L116 72',
    mouth: 'M93 121 q7 -3 14 0',
    blush: false,
  },
  // Happy squint, wide smile.
  cheer: { lines: 'M71 88 q7 -9 14 0 M115 88 q7 -9 14 0', mouth: 'M86 116 q14 16 28 0', blush: true },
  // Eyes closed, calm breath.
  rest: { lines: 'M71 86 q7 6 14 0 M115 86 q7 6 14 0', mouth: 'M94 120 q6 4 12 0', blush: false },
};
const DARK = '#2B1D15';

/** Capy's head, drawn in the shared 200×200 space. `blink` squashes open eyes shut. */
function Head({ mood, band, blink }: { mood: Mood; band: string; blink?: boolean }) {
  const f = FACE[mood];
  return (
    <>
      <Circle cx="60" cy="48" r="11" fill="#7A5033" />
      <Circle cx="140" cy="48" r="11" fill="#7A5033" />
      <Rect x="44" y="38" width="112" height="96" rx="42" fill="#A8754F" />
      <Rect x="44" y="56" width="112" height="13" fill={band} />
      <Rect x="66" y="92" width="68" height="40" rx="20" fill="#C99B72" />
      <Ellipse cx="88" cy="102" rx="3.4" ry="2.4" fill={DARK} />
      <Ellipse cx="112" cy="102" rx="3.4" ry="2.4" fill={DARK} />
      {f.dots ? (
        // Always pass a transform: react-native-svg keeps the last one if the prop goes back to undefined.
        <G transform={blink ? 'translate(0 75.6) scale(1 0.1)' : 'translate(0 0) scale(1 1)'}>
          <Path d={f.dots} fill={DARK} />
        </G>
      ) : null}
      {f.lines ? <Path d={f.lines} stroke={DARK} strokeWidth={3.4} strokeLinecap="round" fill="none" /> : null}
      {f.brows ? <Path d={f.brows} stroke={DARK} strokeWidth={3} strokeLinecap="round" fill="none" /> : null}
      <Path d={f.mouth} stroke={DARK} strokeWidth={3} strokeLinecap="round" fill="none" />
      {f.blush ? (
        <>
          <Circle cx="62" cy="98" r="6" fill="#E98A7A" opacity={0.55} />
          <Circle cx="138" cy="98" r="6" fill="#E98A7A" opacity={0.55} />
        </>
      ) : null}
    </>
  );
}

const BLINK_EVERY = 3600;
const BLINK_MS = 130;

/** Blinks every ~4 s while `on`. */
function useBlink(on: boolean) {
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (!on) return;
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setClosed(true);
        t = setTimeout(() => {
          setClosed(false);
          loop();
        }, BLINK_MS);
      }, BLINK_EVERY + Math.random() * 1500);
    };
    loop();
    return () => clearTimeout(t);
  }, [on]);
  return closed;
}

/** Capy's head in a round badge: coach lines, header button, notifications. */
export function CapyAvatar({ size = 40, mood = 'hello', tint = colors.capyTint }: { size?: number; mood?: Mood; tint?: string }) {
  return (
    <View accessible={false} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tint, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox="40 34 120 108">
        <Head mood={mood} band={colors.yuzu} />
      </Svg>
    </View>
  );
}

type FigureProps = {
  size?: number;
  mood?: Mood;
  /** Headband colour. Use ink on yuzu backgrounds so it doesn't vanish. */
  band?: string;
  /** Waves three times on mount. */
  wave?: boolean;
  /** Hops whenever this value changes (e.g. the answer just picked). */
  hopKey?: unknown;
  /** Slow in-and-out breathing (rest screen). */
  breathe?: boolean;
};

const BREATH_MS = 2400;

/**
 * Full-body Capy, the app's one illustration. Reacts instead of decorating: hops when you pick something,
 * wiggles when tapped, breathes while you rest. Reduce Motion keeps it still.
 */
export function CapyFigure({ size = 160, mood = 'hello', band = colors.yuzu, wave, hopKey, breathe }: FigureProps) {
  const calm = useReducedMotion();
  const blink = useBlink(!calm && !!FACE[mood].dots);
  const y = useSharedValue(0);
  const rot = useSharedValue(0);
  const scale = useSharedValue(1);
  const arm = useSharedValue(0);

  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (calm) return;
    y.value = withSequence(withTiming(-size * 0.09, { duration: 140, easing: motion.easeOut }), withSpring(0, motion.playful));
  }, [hopKey, calm, size, y]);

  useEffect(() => {
    if (!breathe || calm) return;
    scale.value = withRepeat(withSequence(withTiming(1.045, { duration: BREATH_MS }), withTiming(1, { duration: BREATH_MS })), -1);
    return () => {
      cancelAnimation(scale);
      scale.value = 1;
    };
  }, [breathe, calm, scale]);

  useEffect(() => {
    if (!wave || calm) return;
    arm.value = withRepeat(withSequence(withTiming(-30, { duration: 220 }), withTiming(0, { duration: 220 })), 3);
  }, [wave, calm, arm]);

  const body = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { rotate: `${rot.value}deg` }, { scale: scale.value }] }));
  const armStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${arm.value}deg` }] }));

  const wiggle = () => {
    haptic('select');
    if (calm) return;
    rot.set(withSequence(withTiming(-7, { duration: 70 }), withTiming(7, { duration: 110 }), withTiming(-4, { duration: 90 }), withSpring(0, motion.playful)));
  };

  const box = { width: size, height: size };
  return (
    <Pressable accessibilityRole="image" accessibilityLabel="Capy, your coach" onPress={wiggle}>
      <Animated.View style={[box, { transformOrigin: 'bottom' }, body]}>
        <Svg {...box} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
          <Ellipse cx="100" cy="186" rx="62" ry="7" fill="rgba(0,0,0,0.12)" />
          <Ellipse cx="100" cy="150" rx="64" ry="40" fill="#8E5F3C" />
          <Ellipse cx="72" cy="182" rx="14" ry="7" fill="#7A5033" />
          <Ellipse cx="128" cy="182" rx="14" ry="7" fill="#7A5033" />
        </Svg>
        {wave !== undefined ? (
          // The arm pivots at its shoulder, (148, 140) in the 200×200 drawing.
          <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: '74% 70%' }, armStyle]}>
            <Svg {...box} viewBox="0 0 200 200">
              <Path d="M148 140 q20 -12 22 -40" stroke="#8E5F3C" strokeWidth={16} strokeLinecap="round" fill="none" />
            </Svg>
          </Animated.View>
        ) : null}
        <Svg {...box} viewBox="0 0 200 200" style={StyleSheet.absoluteFill}>
          <Head mood={mood} band={band} blink={blink} />
        </Svg>
      </Animated.View>
    </Pressable>
  );
}
