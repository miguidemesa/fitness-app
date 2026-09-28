import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { CapyAvatar } from '@/components/capy';
import { ScheduleCard } from '@/components/reminders';
import { Body, Button, CoachBubble, Screen, Title, s } from '@/components/ui';
import { deleteAccount } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { stageFor, weeklyStreak } from '@/utils/progress';
import { AREA_LABEL, type LogEntry } from '@/utils/types';

const FEEL = { 1: 'felt easy', 2: 'felt about right', 3: 'felt hard' } as const;

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={[s.card, { flex: 1, padding: 14, gap: 2 }]}>
      <Text style={{ fontFamily: fonts.display, fontSize: 36, color: colors.ink }}>{value}</Text>
      <Text style={s.meta}>{label}</Text>
    </View>
  );
}

/** Permanent delete, behind a confirmation. Required by the app stores. */
function DeleteData() {
  const { reset } = useProfile();
  const [busy, setBusy] = useState(false);
  const confirm = () =>
    Alert.alert('Delete all my data?', 'This removes your plan and workout history for good. You can start again any time.', [
      { text: 'Keep my data', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await deleteAccount();
            reset();
            router.replace('/onboarding');
          } catch {
            Alert.alert("Couldn't delete", 'Check your connection and try again.');
            setBusy(false);
          }
        },
      },
    ]);
  return <Button variant="ghost" label={busy ? 'Deleting…' : 'Delete my data'} disabled={busy} onPress={confirm} />;
}

/** Logged workouts, newest first: one card per plan day. */
export default function Progress() {
  const { plan, logs } = useProfile();
  // Map.groupBy isn't in every Hermes version, so group by hand.
  const groups = new Map<string, LogEntry[]>();
  for (const l of logs) groups.set(`${l.planId}:${l.day}`, [...(groups.get(`${l.planId}:${l.day}`) ?? []), l]);
  const sessions = [...groups.values()].reverse();

  if (!sessions.length) {
    return (
      <Screen>
        <Text style={s.meta}>Week {plan?.week ?? 1}</Text>
        <Title>Progress</Title>
        <CoachBubble>Nothing logged yet. After your first workout, you'll see how each move felt here.</CoachBubble>
        <ScheduleCard />
        <DeleteData />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={s.meta}>Week {plan?.week ?? 1}</Text>
      <Title>Progress</Title>
      <Streak workouts={sessions.length} streak={weeklyStreak(logs, new Date().toLocaleDateString('en-CA'))} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Stat value={sessions.length} label="Workouts" />
        <Stat value={logs.filter((l) => l.completed !== 'skip').length} label="Moves done" />
        <Stat value={plan?.week ?? 1} label="Current week" />
      </View>
      {sessions.map((moves) => (
        <Session key={`${moves[0].planId}:${moves[0].day}`} moves={moves} />
      ))}
      <ScheduleCard />
      <DeleteData />
    </Screen>
  );
}

/** Capy's stage (grows with workouts) and the weekly streak. */
function Streak({ workouts, streak }: { workouts: number; streak: number }) {
  const { stage, next } = stageFor(workouts);
  return (
    <View style={[s.card, { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
      <CapyAvatar size={64} mood="cheer" />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.ink }}>Capy the {stage.name}</Text>
        <Body>{next ? `${next.at - workouts} more workout${next.at - workouts === 1 ? '' : 's'} to become ${next.name}.` : "You've reached Capy's top stage!"}</Body>
        <Text style={s.meta}>
          {streak ? `🔥 ${streak}-week streak` : 'Do a workout this week to start a streak.'}
        </Text>
      </View>
    </View>
  );
}

function Session({ moves }: { moves: LogEntry[] }) {
  const done = moves.filter((m) => m.completed !== 'skip');
  // Most common rating among the moves that were done.
  const counts = [1, 2, 3].map((d) => done.filter((m) => m.difficulty === d).length);
  const feel = done.length ? FEEL[(counts.indexOf(Math.max(...counts)) + 1) as 1 | 2 | 3] : 'skipped';
  const pain = [...new Set(moves.filter((m) => m.painArea).map((m) => AREA_LABEL[m.painArea!]))];
  const date = new Date(`${moves[0].loggedOn}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <View style={[s.card, { padding: 14, gap: 4 }]}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink }}>
        {date} · Day {moves[0].day + 1}
      </Text>
      <Body>
        {done.length} of {moves.length} moves · {feel}
      </Body>
      {pain.length ? (
        <Text style={{ alignSelf: 'flex-start', fontFamily: fonts.bold, fontSize: 13, color: colors.pain, backgroundColor: colors.painSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
          Pain: {pain.join(', ')}
        </Text>
      ) : null}
    </View>
  );
}
