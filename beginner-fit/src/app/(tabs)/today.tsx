import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { DayCard } from '@/components/plan';
import { Body, Button, CoachBubble, Screen, Title, s } from '@/components/ui';
import { generatePlan } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { GEAR } from '@/utils/equipment';
import { nextDay } from '@/utils/progress';
import { AREA_LABEL } from '@/utils/types';

const GOAL = { feel_healthier: 'Feel healthier', get_stronger: 'Get stronger', lose_weight: 'Lose some weight' };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line }}>
      <Text style={s.meta}>{label}</Text>
      <Text style={{ flex: 1, textAlign: 'right', fontFamily: fonts.bold, fontSize: 15, color: colors.ink }}>{value}</Text>
    </View>
  );
}

export default function Today() {
  const { draft, plan, logs, setPlan } = useProfile();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const errorText = error ? (
    <Text accessibilityRole="alert" style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.pain, textAlign: 'center' }}>
      {error}
    </Text>
  ) : null;

  if (plan) {
    const day = nextDay(plan.days.length, plan.id, logs);

    if (day === null) {
      return (
        <Screen footer={<>{errorText}<Button label={busy ? 'Building next week…' : "Get next week's plan"} disabled={busy} onPress={fetchPlan} /></>}>
          <Text style={s.meta}>Week {plan.week} · all done</Text>
          <Title>Week done!</Title>
          <CoachBubble>
            You finished all {plan.days.length} workouts this week. I'll look at how each move felt and set up next week.
          </CoachBubble>
        </Screen>
      );
    }

    return (
      <Screen footer={<Button label="Start workout" onPress={() => router.push('/workout')} />}>
        <Text style={s.meta}>
          Week {plan.week} · Day {day + 1} of {plan.days.length}
        </Text>
        <Title>Today</Title>
        {plan.see_professional ? (
          <CoachBubble mood="caring">
            You've felt pain in the same spot more than once. Please check in with a doctor or physio before pushing on. I've kept those moves easy.
          </CoachBubble>
        ) : null}
        {day === 0 && plan.note ? <CoachBubble>{plan.note}</CoachBubble> : null}
        {day === 0 && plan.changes.length ? (
          <View style={[s.card, { padding: 16, gap: 10 }]}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink }}>What changed this week</Text>
            {plan.changes.map((c) => (
              <Body key={c}>• {c}</Body>
            ))}
          </View>
        ) : null}
        {day > 0 ? <CoachBubble>Day {day + 1}. Go at your own pace, and stop if anything hurts.</CoachBubble> : null}
        <DayCard items={plan.days[day]} />
        <Body style={s.hint}>Tap a move to see how to do it.</Body>
      </Screen>
    );
  }

  const gear =
    draft.place === 'gym'
      ? 'Gym equipment'
      : GEAR.filter((g) => draft.gear.includes(g.id))
          .map((g) => g.label)
          .join(', ') || 'None, bodyweight only';

  return (
    <Screen footer={<>{errorText}<Button label={busy ? 'Building your plan…' : 'Build my plan'} disabled={busy} onPress={fetchPlan} /></>}>
      <Text style={s.meta}>Week 1</Text>
      <Title>Today</Title>
      <CoachBubble>Your answers are saved. Tap below and I'll put your first week together.</CoachBubble>
      <View style={[s.card, { padding: 16 }]}>
        <Body style={{ fontFamily: fonts.bold, color: colors.ink, marginBottom: 6 }}>What you told Capy</Body>
        <Row label="Goal" value={draft.goal ? GOAL[draft.goal] : 'Not set'} />
        <Row label="Time" value={`${draft.daysPerWeek} days · ${draft.minutesPerSession} min`} />
        <Row label="Equipment" value={gear} />
        <Row label="Areas to protect" value={draft.injuredAreas.length ? draft.injuredAreas.map((a) => AREA_LABEL[a]).join(', ') : 'None'} />
      </View>
    </Screen>
  );
}
