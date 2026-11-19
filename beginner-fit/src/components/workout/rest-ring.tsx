import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, cancelAnimation, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { CapyFigure } from '@/components/capy';
import { clock } from '@/lib/time';
import { colors, type } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const STROKE = 10;

/**
 * The rest countdown in the media slot: a yuzu ring that drains smoothly on the UI thread,
 * the seconds left, and Capy breathing along.
 */
export function RestRing({ size, endsAt, total, now }: { size: number; endsAt: number; total: number; now: number }) {
  const r = (size - STROKE) / 2;
  const length = 2 * Math.PI * r;
  const left = Math.max(0, endsAt - now);
  const progress = useSharedValue(left / total);

  // Re-aim whenever the end moves (+15s) rather than every tick.
  useEffect(() => {
    const ms = Math.max(0, endsAt - Date.now());
    progress.value = ms / total;
    progress.value = withTiming(0, { duration: ms, easing: Easing.linear });
    return () => cancelAnimation(progress);
  }, [endsAt, total, progress]);

  const ring = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value) }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={[StyleSheet.absoluteFill, { transform: [{ rotate: '-90deg' }] }]}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.nightSoft} strokeWidth={STROKE} fill="none" />
        <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={colors.yuzu} strokeWidth={STROKE} fill="none" strokeLinecap="round" strokeDasharray={length} animatedProps={ring} />
      </Svg>
      <CapyFigure size={size * 0.3} mood="rest" breathe />
      <Text style={[type.tag, { color: colors.onNightMuted, marginTop: 4 }]}>Rest</Text>
      <Text accessibilityLiveRegion="polite" accessibilityLabel={`${Math.ceil(left / 1000)} seconds of rest left`} style={[type.stat, { color: colors.onNight, fontSize: 52, lineHeight: 56 }]}>
        {clock(Math.ceil(left / 1000))}
      </Text>
      <Text style={[type.caption, { color: colors.onNightMuted }]}>Breathe in… and out.</Text>
    </View>
  );
}
