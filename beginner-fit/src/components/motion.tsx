import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, Text, type PressableProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, { Keyframe, useAnimatedStyle, useReducedMotion, useSharedValue, withSpring } from 'react-native-reanimated';
import { haptic, type HapticIntent } from '@/lib/haptics';
import { motion } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** How far it shrinks while held (theme motion.scale). */
  scaleTo?: number;
  /** Haptic fired on press. */
  feedback?: HapticIntent;
};

/** Every tappable thing: springs down while held, springs back on release (§3.6). Android also gets its native ripple. */
export function PressableScale({ style, scaleTo = motion.scale.button, feedback, onPressIn, onPressOut, onPress, disabled, android_ripple, ...rest }: PressableScaleProps) {
  const scale = useSharedValue(1);
  const calm = useReducedMotion();
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      android_ripple={android_ripple ?? { color: 'rgba(21,21,26,0.08)', foreground: true }}
      onPressIn={(e) => {
        if (!calm) scale.set(withSpring(scaleTo, motion.press));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, motion.press));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (feedback) haptic(feedback);
        onPress?.(e);
      }}
      style={[style, animated]}
    />
  );
}

/** Fades in and rises 12px, staggered by `index` (capped). Plays once, on mount; Reduce Motion skips it. */
export function Enter({ index = 0, children, style }: { index?: number; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const entering = new Keyframe({
    0: { opacity: 0, transform: [{ translateY: 12 }] },
    100: { opacity: 1, transform: [{ translateY: 0 }], easing: motion.easeOut },
  })
    .duration(motion.base)
    .delay(Math.min(index, motion.maxStagger) * motion.stagger);
  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

const COUNT_MS = 600;

/** A number that counts up from 0 once, when it first appears. Reduce Motion shows the final value straight away. */
export function CountUp({ value, style, format = String }: { value: number; style?: StyleProp<TextStyle>; format?: (n: number) => string }) {
  const calm = useReducedMotion();
  const [counted, setShown] = useState(0);
  useEffect(() => {
    if (calm) return;
    const start = Date.now();
    let frame = 0;
    const step = () => {
      const t = Math.min(1, (Date.now() - start) / COUNT_MS);
      setShown(Math.round(value * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, calm]);
  return (
    <Text style={style} accessibilityLabel={format(value)}>
      {format(calm ? value : counted)}
    </Text>
  );
}
