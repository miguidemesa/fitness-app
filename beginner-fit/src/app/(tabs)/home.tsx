import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { CapyAvatar, CapyFigure } from '@/components/capy';
import { CircleButton } from '@/components/glass';
import { CountUp, Enter } from '@/components/motion';
import { MomentPill, SessionCard, SessionRow, WeekStrip, dayInfo, groupSessions, pastSession } from '@/components/session';
import { Body, Button, Card, CoachLine, ErrorText, Group, Screen, Tag } from '@/components/ui';
import { generatePlan } from '@/lib/supabase';
import { greeting, todayISO } from '@/lib/time';
import { useProfile } from '@/state/profile';
import { useWorkout, usesWeight } from '@/state/workout';
import { colors, fonts, radius, space, type } from '@/theme';
import { GEAR } from '@/utils/equipment';
import { nextDay, weeklyStreak } from '@/utils/progress';
import { inWeekOf, weekDots, workoutsThisWeek } from '@/utils/session';

const MAX_MOMENTS = 8;
const LATELY = 3;

export default function Home() {
  const { draft, plan, logs, exercises, setPlan } = useProfile();
  const { active, start, history } = useWorkout();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = todayISO();

  // Builds week 1 if it's missing, or next week once this one is fully logged.
  const fetchPlan = async () => {
    setBusy(true);
    setError(null);
    try {
      await setPlan(await generatePlan());
    } catch {
      setError("Couldn't reach Capy. Check your internet connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const sessions = groupSessions(logs).map((moves) => pastSession(moves, exercises, history.seconds[`${moves[0].planId}:${moves[0].day}`]));
  const done = workoutsThisWeek(logs, today);
  const weekKeys = new Set(logs.filter((l) => inWeekOf(l.loggedOn, today)).map((l) => `${l.planId}:${l.day}`));
  const minutes = Math.round([...weekKeys].reduce((n, k) => n + (history.seconds[k] ?? 0), 0) / 60);
  const streak = weeklyStreak(logs, today);
  const day = plan ? nextDay(plan.days.length, plan.id, logs) : null;

  const gear =
    draft.place === 'gym'
      ? 'Gym'
      : GEAR.filter((g) => draft.gear.includes(g.id))
          .map((g) => g.label)
          .join(', ') || 'No equipment';

  const begin = () => {
    if (!plan || day === null) return;
    if (!(active?.planId === plan.id && active.day === day)) start(plan.id, day, plan.days[day], (id) => usesWeight(exercises[id]?.equipment));
    router.push('/workout');
  };

  let hero;
  if (!plan) {
    hero = (
      <ImmersiveCard title="Your first week is one tap away." body="Capy builds it from your answers, around the areas you want to protect.">
        <ErrorText>{error}</ErrorText>
        <Button label={busy ? 'Building your week…' : 'Build my plan'} disabled={busy} onPress={fetchPlan} />
      </ImmersiveCard>
    );
  } else if (day === null) {
    hero = (
      <ImmersiveCard title={`Week ${plan.week}, done.`} body={`All ${plan.days.length} workouts logged. Capy will look at how each move felt and set up next week.`} cheer>
        <ErrorText>{error}</ErrorText>
        <Button label={busy ? 'Building next week…' : "Get next week's plan"} disabled={busy} onPress={fetchPlan} />
      </ImmersiveCard>
    );
  } else {
    const info = dayInfo(plan.days[day], exercises);
    const resuming = active?.planId === plan.id && active.day === day;
    hero = (
      <SessionCard
        kicker={`Day ${day + 1} of ${plan.days.length} · Week ${plan.week}`}
        title={info.title}
        subtitle={resuming ? 'You left this one halfway. Pick it back up.' : 'Your next session is ready.'}
        meta={`${plan.days[day].length} moves · ~${draft.minutesPerSession} min · ${gear}`}
        photo={info.photo}
        onOpen={() => router.push({ pathname: '/session/[day]', params: { day: String(day) } })}
        action={<Button variant="accent" icon="play" label={resuming ? 'Resume' : 'Start'} onPress={begin} />}
      />
    );
  }

  const coach = plan?.see_professional
    ? { mood: 'caring' as const, text: "You've felt pain in the same spot more than once. Please check in with a doctor or physio before pushing on. I've kept those moves easy." }
    : plan && day === 0 && plan.note
      ? { mood: 'hello' as const, text: plan.note }
      : plan && day !== null && day > 0
        ? { mood: 'hello' as const, text: 'Go at your own pace, and stop if anything hurts.' }
        : null;

  return (
    <Screen tab>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="You" onPress={() => router.navigate('/profile')} hitSlop={8}>
          <CapyAvatar size={44} />
        </Pressable>
        <Text accessibilityRole="header" style={styles.mark}>
          capy<Text style={{ color: colors.yuzu }}>.</Text>
        </Text>
        <CircleButton icon="bell" label="Reminders" onPress={() => router.push('/settings')} />
      </View>

      <Enter index={0}>
        <Text style={type.title}>
          {greeting()}
          {draft.displayName ? `, ${draft.displayName}.` : '.'}
        </Text>
        <Text style={[type.title, { color: colors.muted }]}>{day === null && plan ? 'Rest up.' : 'Ready to move?'}</Text>
      </Enter>

      {sessions.length ? (
        <Enter index={1} style={{ marginHorizontal: -space.gutter }}>
          <FlatList
            horizontal
            data={sessions.slice(0, MAX_MOMENTS)}
            keyExtractor={(s) => s.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: space.gutter, gap: space.m }}
            renderItem={({ item }) => <MomentPill photo={item.photo} label={item.date.split(',')[0]} onPress={() => router.navigate('/plan')} />}
          />
        </Enter>
      ) : null}

      <Enter index={2}>{hero}</Enter>

      {coach ? (
        <Enter index={3}>
          <CoachLine mood={coach.mood}>{coach.text}</CoachLine>
        </Enter>
      ) : null}

      {plan && day === 0 && plan.changes.length ? (
        <Enter index={3}>
          <Card style={{ padding: space.l, gap: space.s }}>
            <Text style={type.label}>What changed this week</Text>
            {plan.changes.map((c) => (
              <Body key={c}>• {c}</Body>
            ))}
          </Card>
        </Enter>
      ) : null}

      <Enter index={4} style={{ gap: space.l, marginTop: space.s }}>
        <Tag>This week</Tag>
        <View style={{ flexDirection: 'row', gap: space.m }}>
          <Stat label="workouts this week">
            <CountUp value={done} style={type.stat} />
            <Text style={[type.stat, { color: colors.muted, fontSize: 24 }]}>/{draft.schedule.length}</Text>
          </Stat>
          <Stat label="minutes of movement">
            <CountUp value={minutes} style={type.stat} />
          </Stat>
          <Stat label={streak === 1 ? 'week streak' : 'weeks streak'}>
            <CountUp value={streak} style={type.stat} />
          </Stat>
        </View>
        <WeekStrip dots={weekDots(draft.schedule, logs, today)} />
        {!sessions.length ? <Text style={type.caption}>Your week starts with one session. The days you picked are circled.</Text> : null}
      </Enter>

      {sessions.length ? (
        <Enter index={5} style={{ gap: space.m, marginTop: space.s }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Tag>Lately</Tag>
            <Pressable accessibilityRole="link" onPress={() => router.navigate('/plan')} hitSlop={10}>
              <Text style={[type.label, { fontSize: 14, color: colors.yuzuInk }]}>See all</Text>
            </Pressable>
          </View>
          <Group>
            {sessions.slice(0, LATELY).map((s) => (
              <SessionRow
                key={s.key}
                photo={s.photo}
                title={s.title}
                caption={[s.date, s.minutes ? `${s.minutes} min` : null, `${s.done} of ${s.total} moves`].filter(Boolean).join(' · ')}
              />
            ))}
          </Group>
        </Enter>
      ) : null}
    </Screen>
  );
}

/** A big number over a small caption: "48 / minutes of movement". */
function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>{children}</View>
      <Text style={type.caption}>{label}</Text>
    </View>
  );
}

/** Yuzu full-bleed card for the moments that matter (no plan yet, week done). */
function ImmersiveCard({ title, body, cheer, children }: { title: string; body: string; cheer?: boolean; children: React.ReactNode }) {
  return (
    <View style={styles.immersive}>
      <CapyFigure size={132} mood={cheer ? 'cheer' : 'hello'} band={colors.ink} wave={!cheer} />
      <Text style={[type.display, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[type.body, { color: colors.ink, textAlign: 'center' }]}>{body}</Text>
      <View style={{ alignSelf: 'stretch', gap: space.s, marginTop: space.s }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mark: { fontFamily: fonts.displayHeavy, fontSize: 24, letterSpacing: -0.6, color: colors.ink },
  immersive: { backgroundColor: colors.yuzu, borderRadius: radius.photo, borderCurve: 'continuous', padding: space.xl, alignItems: 'center', gap: space.m },
});
