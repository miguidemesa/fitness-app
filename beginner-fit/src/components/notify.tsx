import { router } from 'expo-router';
import { useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CapyAvatar, type Mood } from '@/components/capy';
import { haptic } from '@/lib/haptics';
import { useProfile } from '@/state/profile';
import { useWorkout } from '@/state/workout';
import { colors, space, type } from '@/theme';
import { DynamicNotifications } from '@/vendor/dynamic-notifications/components';
import { useDynamicNotifications } from '@/vendor/dynamic-notifications/hooks/use-dynamic-notifications';

/**
 * Dynamic Island-style toasts (spec §3.9), only for things that happen while your attention is elsewhere.
 * Not for set logged, workout finished or errors on the screen you're looking at.
 */
export function NotifyProvider({ children }: { children: ReactNode }) {
  return (
    <DynamicNotifications cardColor={colors.paper} accent={colors.yuzuInk}>
      {children}
      <WorkoutWatcher />
    </DynamicNotifications>
  );
}

type Note = { title: string; message?: string; mood?: Mood; onPress?: () => void };

export function useNotify() {
  const { trigger } = useDynamicNotifications();
  return ({ title, message, mood = 'hello', onPress }: Note) =>
    trigger({
      title,
      message,
      onPress,
      render: () => (
        <View style={styles.body} accessible accessibilityRole={onPress ? 'button' : 'alert'} accessibilityLabel={[title, message].filter(Boolean).join('. ')}>
          <CapyAvatar size={46} mood={mood} />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={type.label}>
              {title}
            </Text>
            {message ? (
              <Text numberOfLines={1} style={type.caption}>
                {message}
              </Text>
            ) : null}
          </View>
          <View style={styles.dot} />
        </View>
      ),
    });
}

/** The workout screen marks itself focused, so rest-over toasts only fire when you've stepped away. */
let workoutFocused = false;
export const setWorkoutFocused = (on: boolean) => {
  workoutFocused = on;
};

/** Watches the saved workout: "rest's up" while it's minimized, and "picking up where you left off" after a relaunch. */
function WorkoutWatcher() {
  const notify = useNotify();
  const { active, ready } = useWorkout();
  const { exercises, ready: profileReady } = useProfile();
  const greeted = useRef(false);
  const resume = () => router.push('/workout');

  const move = active?.moves[active.index];
  const name = move ? (exercises[move.exerciseId]?.name ?? 'your next move') : '';

  useEffect(() => {
    if (greeted.current || !ready || !profileReady) return;
    greeted.current = true;
    if (active) notify({ title: 'Picking up where you left off', message: `${name} · tap to resume`, onPress: resume });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per launch
  }, [ready, profileReady]);

  const endsAt = active?.restEndsAt;
  useEffect(() => {
    if (!endsAt || endsAt <= Date.now()) return;
    const t = setTimeout(() => {
      if (workoutFocused || !move) return;
      haptic('tap');
      const setNo = move.sets.findIndex((s) => !s.done) + 1;
      notify({ title: "Rest's up", message: setNo ? `Set ${setNo} of ${move.sets.length} · ${name}` : name, mood: 'cheer', onPress: resume });
    }, endsAt - Date.now());
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-arm only when the rest end moves
  }, [endsAt]);

  return null;
}

const styles = StyleSheet.create({
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.m, paddingLeft: 13, paddingRight: space.xl },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.yuzu },
});
