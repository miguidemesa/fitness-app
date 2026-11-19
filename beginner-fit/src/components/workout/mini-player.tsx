import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/motion';
import { clock, useNow } from '@/lib/time';
import { useProfile } from '@/state/profile';
import { useWorkout } from '@/state/workout';
import { colors, radius, space, type } from '@/theme';

/**
 * "Workout in progress": move, set and a live clock (rest countdown while resting). Tap to jump back in.
 * iOS 26 hosts it in the tab bar's bottom accessory; elsewhere it floats above the tab bar (`floating`).
 */
export function MiniPlayer({ floating }: { floating?: boolean }) {
  const { active } = useWorkout();
  const { exercises } = useProfile();
  const now = useNow(1000, !!active);
  if (!active) return null;

  const move = active.moves[active.index];
  const ex = exercises[move.exerciseId];
  const setNo = Math.min(move.sets.filter((s) => s.done).length + 1, move.sets.length);
  const resting = active.restEndsAt !== null && active.restEndsAt > now;
  const time = resting ? clock((active.restEndsAt! - now) / 1000) : clock((now - active.startedAt) / 1000);

  return (
    <Animated.View entering={FadeInDown} exiting={FadeOutDown} style={floating ? styles.floating : styles.fill}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`Workout in progress: ${ex?.name ?? 'move'}, ${resting ? `resting, ${time} left` : `set ${setNo}`}. Resume.`}
        onPress={() => router.push('/workout')}
        style={[styles.row, floating && styles.card]}
      >
        {ex?.images[0] ? <Image source={{ uri: ex.images[0] }} style={styles.thumb} contentFit="cover" /> : <View style={styles.thumb} />}
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[type.label, { fontSize: 15 }]}>
            {ex?.name ?? 'Workout'}
          </Text>
          <Text style={type.caption}>{resting ? 'Resting' : `Set ${setNo} of ${move.sets.length}`}</Text>
        </View>
        <Text style={[type.label, { fontVariant: ['tabular-nums'], color: resting ? colors.yuzuInk : colors.ink }]}>{time}</Text>
        <View style={styles.play}>
          <Icon name="play" size={14} color={colors.ink} />
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'center' },
  floating: { marginHorizontal: space.gutter },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, paddingHorizontal: space.m, paddingVertical: space.s },
  card: { backgroundColor: colors.paper, borderRadius: radius.pill, elevation: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  thumb: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.mist },
  play: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.yuzu, alignItems: 'center', justifyContent: 'center' },
});
