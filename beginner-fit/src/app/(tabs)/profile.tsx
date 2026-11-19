import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { CapyAvatar, CapyFigure } from '@/components/capy';
import { CircleButton } from '@/components/glass';
import { CountUp, Enter } from '@/components/motion';
import { SessionRow } from '@/components/session';
import { Group, Screen, Tag } from '@/components/ui';
import { buddyStatus, type BuddyState } from '@/lib/supabase';
import { todayISO } from '@/lib/time';
import { useProfile } from '@/state/profile';
import { useWorkout } from '@/state/workout';
import { colors, fonts, motion, space, type } from '@/theme';
import { stageFor, weeklyStreak } from '@/utils/progress';

/** Who you are: Capy growing with you, the numbers that matter, your buddy. Settings live behind the gear. */
export default function Profile() {
  const { draft, logs } = useProfile();
  const { history } = useWorkout();
  const [buddy, setBuddy] = useState<BuddyState | null>(null);
  // Refresh on every visit: the buddy may have paired or worked out since.
  useFocusEffect(
    useCallback(() => {
      buddyStatus().then(setBuddy).catch(() => setBuddy({ state: 'none' }));
    }, []),
  );

  const workouts = new Set(logs.map((l) => `${l.planId}:${l.day}`)).size;
  const minutes = Math.round(Object.values(history.seconds).reduce((n, s) => n + s, 0) / 60);
  const streak = weeklyStreak(logs, todayISO());
  const { stage, next } = stageFor(workouts);
  const toNext = next ? (workouts - stage.at) / (next.at - stage.at) : 1;

  const bar = useSharedValue(0);
  useEffect(() => {
    bar.value = withSpring(toNext, motion.settle);
  }, [bar, toNext]);
  const fill = useAnimatedStyle(() => ({ width: `${bar.value * 100}%` }));

  return (
    <Screen tab>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <CircleButton icon="settings" label="Settings" onPress={() => router.push('/settings')} />
      </View>

      <Enter index={0} style={{ alignItems: 'center', gap: space.s }}>
        <CapyFigure size={170} mood="cheer" />
        <Text accessibilityRole="header" style={[type.display, { textAlign: 'center' }]}>
          {draft.displayName ?? 'You'}
        </Text>
        <Text style={[type.label, { color: colors.muted }]}>Training with Capy the {stage.name}</Text>
      </Enter>

      <Enter index={1} style={{ gap: space.s }}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fill]} />
        </View>
        <Text style={[type.caption, { textAlign: 'center' }]}>
          {next ? `${next.at - workouts} more workout${next.at - workouts === 1 ? '' : 's'} until Capy becomes ${/^[aeiou]/i.test(next.name) ? 'an' : 'a'} ${next.name}.` : "You've reached Capy's top stage."}
        </Text>
      </Enter>

      <Enter index={2} style={styles.numbers}>
        <Big value={workouts} label="workouts" />
        <Big value={minutes} label="minutes moved" />
        <Big value={streak} label="week streak" />
      </Enter>

      <Enter index={3} style={{ gap: space.m }}>
        <Tag>Buddy</Tag>
        <Group>
          <SessionRow
            leading={<CapyAvatar size={44} mood={buddy?.state === 'paired' ? 'cheer' : 'hello'} />}
            title={buddy?.state === 'paired' ? buddy.name : buddy?.state === 'invited' ? 'Invite waiting' : 'Invite a buddy'}
            caption={buddy?.state === 'paired' ? `${buddy.streak} in a row together` : 'Train with a friend. Show your QR code or send a link.'}
            onPress={() => router.push('/buddy')}
          />
        </Group>
      </Enter>
    </Screen>
  );
}

/** Oversized number, restrained label. */
function Big({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <CountUp value={value} style={[type.stat, { fontFamily: fonts.displayHeavy, fontSize: 52, lineHeight: 56 }]} />
      <Text style={type.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: colors.mist, overflow: 'hidden', marginHorizontal: space.xxl },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.yuzu },
  numbers: { flexDirection: 'row', borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: colors.line, paddingVertical: space.xl },
});
