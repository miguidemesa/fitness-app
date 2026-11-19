import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Icon } from '@/components/icon';
import { haptic } from '@/lib/haptics';
import { colors } from '@/theme';

const HOLD_MS = 750;
const FADE_MS = 380;

/**
 * Plays an exercise's start/end photos like a GIF: they cross-fade back and forth on the UI thread.
 * Tap to pause or play. With Reduce Motion it holds still and a tap switches frames instead.
 */
export function ExerciseLoop({ images, name, style, interactive = true }: { images: string[]; name: string; style?: StyleProp<ViewStyle>; interactive?: boolean }) {
  const calm = useReducedMotion();
  const loops = images.length > 1;
  const [playing, setPlaying] = useState(!calm);
  const end = useSharedValue(0);

  useEffect(() => {
    if (!loops || !playing) return;
    end.value = withRepeat(
      withSequence(withDelay(HOLD_MS, withTiming(1, { duration: FADE_MS })), withDelay(HOLD_MS, withTiming(0, { duration: FADE_MS }))),
      -1,
    );
    return () => cancelAnimation(end);
  }, [loops, playing, end]);

  const top = useAnimatedStyle(() => ({ opacity: end.value }));

  const toggle = () => {
    haptic('select');
    if (calm) end.set(end.get() > 0.5 ? 0 : 1);
    else setPlaying((p) => !p);
  };

  const frames = (
    <View style={[styles.frame, style]}>
      {images[0] ? <Image source={{ uri: images[0] }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" transition={150} /> : null}
      {loops ? (
        <Animated.View style={[StyleSheet.absoluteFill, top]}>
          <Image source={{ uri: images[1] }} style={StyleSheet.absoluteFill} contentFit="cover" cachePolicy="memory-disk" />
        </Animated.View>
      ) : null}
      {loops && interactive && !playing && !calm ? (
        <View style={styles.badge}>
          <Icon name="play" size={16} color={colors.ink} />
        </View>
      ) : null}
    </View>
  );

  if (!loops || !interactive) return frames;
  return (
    <Pressable
      accessibilityRole="imagebutton"
      accessibilityLabel={`${name}, start and end positions${calm ? '. Tap to switch.' : playing ? ', playing. Tap to pause.' : ', paused. Tap to play.'}`}
      onPress={toggle}
    >
      {frames}
    </Pressable>
  );
}

/** Warm the cache so the next move's demo appears instantly. */
export const prefetchDemos = (images: string[]) => {
  if (images.length) Image.prefetch(images).catch(() => {});
};

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: colors.paper },
  badge: { position: 'absolute', right: 12, bottom: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
});
