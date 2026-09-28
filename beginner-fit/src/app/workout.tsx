import { Link, Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Share, Text, View } from 'react-native';
import { CapyAvatar } from '@/components/capy';
import { AreaChips, Body, Button, CoachBubble, OptionCard, Screen, StepHeader, Title, s } from '@/components/ui';
import { saveLogs } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { nextDay } from '@/utils/progress';
import { AREA_LABEL, type Area, type Difficulty, type LogEntry } from '@/utils/types';

type Answer = { completed?: LogEntry['completed']; difficulty?: Difficulty; pain?: boolean; painArea?: Area };

const DONE: [LogEntry['completed'], string][] = [
  ['all', 'All of it'],
  ['some', 'Some of it'],
  ['skip', 'Skipped it'],
];
const FEEL: [Difficulty, string, string][] = [
  [1, 'Too easy', 'I could have done a lot more'],
  [2, 'About right', 'Hard work, but doable'],
  [3, 'Too hard', "I couldn't keep good form"],
];

const complete = (a: Answer) =>
  !!a.completed && (a.completed === 'skip' || !!a.difficulty) && a.pain !== undefined && (!a.pain || !!a.painArea);

/** Walks through today's moves one at a time: did you do it, how did it feel, did it hurt. */
export default function Workout() {
  const { plan, exercises, logs, addLogs } = useProfile();
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resting, setResting] = useState(false);
  const [saved, setSaved] = useState<LogEntry[] | null>(null);

  const day = plan ? nextDay(plan.days.length, plan.id, logs) : null;
  if (saved) return <Finished saved={saved} />;
  if (!plan || day === null) return <Redirect href="/today" />;

  if (resting) return <Rest onDone={() => setResting(false)} />;

  const items = plan.days[day];
  const item = items[i];
  const a = answers[i] ?? {};
  const set = (patch: Answer) => setAnswers((prev) => Object.assign([...prev], { [i]: { ...a, ...patch } }));
  const last = i === items.length - 1;

  const finish = async () => {
    setSaving(true);
    setError(null);
    try {
      const rows = await saveLogs(
        items.map((it, k) => {
          const x = answers[k];
          return {
            planId: plan.id,
            day,
            exerciseId: it.exerciseId,
            completed: x.completed!,
            difficulty: x.completed === 'skip' ? null : x.difficulty!,
            pain: !!x.pain,
            painArea: x.pain ? x.painArea! : null,
          };
        }),
      );
      addLogs(rows);
      setSaved(rows);
    } catch {
      setError("Couldn't save your workout. Check your internet connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      footer={
        <>
          {error ? (
            <Text accessibilityRole="alert" style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.pain, textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}
          <Button
            label={last ? (saving ? 'Saving…' : 'Finish workout') : 'Next move'}
            disabled={!complete(a) || saving}
            onPress={last ? finish : () => { setI(i + 1); setResting(true); }}
          />
        </>
      }
    >
      <StepHeader step={i + 1} total={items.length} onBack={() => (i > 0 ? setI(i - 1) : router.back())} />
      <Title>{exercises[item.exerciseId]?.name ?? item.exerciseId.replaceAll('_', ' ')}</Title>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={s.meta}>
          {item.sets} sets × {item.reps} reps
        </Text>
        <Link href={{ pathname: '/exercise/[id]', params: { id: item.exerciseId } }} style={{ fontFamily: fonts.bold, fontSize: 15, color: colors.accent, padding: 10 }}>
          How to do it
        </Link>
      </View>

      <Text accessibilityRole="header" style={[s.meta, { marginTop: 4 }]}>Did you do it?</Text>
      {DONE.map(([v, label]) => (
        <OptionCard key={v} label={label} selected={a.completed === v} onPress={() => set({ completed: v })} />
      ))}

      {a.completed && a.completed !== 'skip' ? (
        <>
          <Text accessibilityRole="header" style={[s.meta, { marginTop: 4 }]}>How did it feel?</Text>
          {FEEL.map(([v, label, hint]) => (
            <OptionCard key={v} label={label} hint={hint} selected={a.difficulty === v} onPress={() => set({ difficulty: v })} />
          ))}
        </>
      ) : null}

      {a.completed ? (
        <>
          <Text accessibilityRole="header" style={[s.meta, { marginTop: 4 }]}>Did anything hurt?</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}>
              <OptionCard label="No" selected={a.pain === false} onPress={() => set({ pain: false, painArea: undefined })} />
            </View>
            <View style={{ flex: 1 }}>
              <OptionCard label="Yes" selected={a.pain === true} onPress={() => set({ pain: true })} />
            </View>
          </View>
          {a.pain ? (
            <>
              <Body>Where did it hurt? Capy won't make this move harder.</Body>
              <AreaChips selected={a.painArea ? [a.painArea] : []} onPress={(area) => set({ painArea: area })} />
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const REST_SECONDS = 30;

/** Short rest between moves. Counts down on its own; the user can add time or skip. */
function Rest({ onDone }: { onDone: () => void }) {
  const [left, setLeft] = useState(REST_SECONDS);
  useEffect(() => {
    if (left <= 0) return onDone();
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return (
    <Screen
      footer={
        <>
          <Button variant="ghost" label="+15 seconds" onPress={() => setLeft((n) => n + 15)} />
          <Button label="Skip rest" onPress={onDone} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 24 }}>
        <CapyAvatar size={120} mood="rest" />
        <Title>Rest</Title>
        <Text accessibilityLiveRegion="polite" style={{ fontFamily: fonts.display, fontSize: 72, color: colors.ink }}>{left}</Text>
        <Body>Take a breath. Shake it out. Next move is coming up.</Body>
      </View>
    </Screen>
  );
}

function Finished({ saved }: { saved: LogEntry[] }) {
  const pain = [...new Set(saved.filter((l) => l.painArea).map((l) => AREA_LABEL[l.painArea!].toLowerCase()))];
  const done = saved.filter((l) => l.completed !== 'skip').length;
  return (
    <Screen
      footer={
        <>
          <Button
            variant="ghost"
            label="Share"
            onPress={() => Share.share({ message: `I just finished a workout with Capy: ${done} of ${saved.length} moves done. 💪` })}
          />
          <Button label="Back to Today" onPress={() => router.replace('/today')} />
        </>
      }
    >
      <Title>Nice work!</Title>
      <View style={{ alignItems: 'center' }}>
        <CapyAvatar size={120} mood="cheer" />
      </View>
      <CoachBubble mood="cheer">
        You did {done} of {saved.length} moves today. Every workout counts, especially the first few.
      </CoachBubble>
      {pain.length ? (
        <CoachBubble mood="caring">
          Thanks for telling me about your {pain.join(' and ')}. Rest it, and I'll swap or lighten that move next week. If the pain doesn't go away, please see a doctor or physio.
        </CoachBubble>
      ) : null}
    </Screen>
  );
}
