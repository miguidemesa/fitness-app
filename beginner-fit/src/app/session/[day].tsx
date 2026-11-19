import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleButton } from '@/components/glass';
import { Enter } from '@/components/motion';
import { SessionRow, dayInfo } from '@/components/session';
import { Button, Group, Screen, Tag } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { fromKg, useWorkout, usesWeight } from '@/state/workout';
import { colors, radius, space, type } from '@/theme';
import { nextDay } from '@/utils/progress';

/** One plan day before you start it: what it works, every move, and how you did last time. */
export default function SessionDetail() {
  const params = useLocalSearchParams<{ day: string }>();
  const { plan, logs, exercises, draft } = useProfile();
  const { active, start, history, units } = useWorkout();
  const insets = useSafeAreaInsets();
  const day = Number(params.day);
  if (!plan || !plan.days[day]) return <Redirect href="/home" />;

  const items = plan.days[day];
  const info = dayInfo(items, exercises);
  const logged = logs.some((l) => l.planId === plan.id && l.day === day);
  const isNext = nextDay(plan.days.length, plan.id, logs) === day;
  const resuming = active?.planId === plan.id && active.day === day;

  const begin = () => {
    if (!resuming) start(plan.id, day, items, (id) => usesWeight(exercises[id]?.equipment));
    router.push('/workout');
  };

  return (
    <Screen
      footer={
        logged ? null : isNext || resuming ? (
          <Button variant="accent" icon="play" tall label={resuming ? 'Resume workout' : 'Start workout'} onPress={begin} />
        ) : (
          <Text style={[type.caption, { textAlign: 'center' }]}>Days unlock in order. Finish day {(nextDay(plan.days.length, plan.id, logs) ?? 0) + 1} first.</Text>
        )
      }
      contentStyle={{ paddingTop: 0 }}
    >
      <View style={[styles.hero, { marginTop: -insets.top }]}>
        {info.photo ? <Image source={{ uri: info.photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} /> : null}
        <View style={[styles.back, { top: insets.top + space.s }]}>
          <CircleButton icon="back" label="Back" tone="glass" onPress={() => router.back()} />
        </View>
      </View>

      <Enter index={0} style={{ gap: space.s }}>
        <Tag>
          Day {day + 1} · {items.length} moves · ~{draft.minutesPerSession} min{logged ? ' · Done' : ''}
        </Tag>
        <Text accessibilityRole="header" style={type.display}>
          {info.title}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
          {info.muscles.map((m) => (
            <Text key={m} style={styles.muscle}>
              {m}
            </Text>
          ))}
        </View>
      </Enter>

      <Enter index={1}>
        <Group>
          {items.map((item, i) => {
            const ex = exercises[item.exerciseId];
            const last = history.sets[item.exerciseId]?.at(-1)?.filter((s) => s.done);
            const lastText = last?.length ? `Last: ${last.length} × ${last[0].reps}${last[0].weightKg ? ` · ${fromKg(last[0].weightKg, units)} ${units}` : ''}` : null;
            return (
              <SessionRow
                key={`${item.exerciseId}-${i}`}
                photo={ex?.images[0]}
                title={ex?.name ?? item.exerciseId.replaceAll('_', ' ')}
                caption={[`${item.sets} × ${item.reps}`, usesWeight(ex?.equipment) ? ex?.equipment : null, lastText].filter(Boolean).join(' · ')}
                onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: item.exerciseId } })}
              />
            );
          })}
        </Group>
      </Enter>
      <Text style={type.caption}>Tap a move to see how it's done.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 340, marginHorizontal: -space.gutter, borderBottomLeftRadius: radius.photo, borderBottomRightRadius: radius.photo, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: colors.mist },
  back: { position: 'absolute', left: space.gutter },
  muscle: { ...type.caption, color: colors.ink, textTransform: 'capitalize', backgroundColor: colors.paper, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6, overflow: 'hidden' },
});
