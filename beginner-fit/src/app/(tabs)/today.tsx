import { Text, View } from 'react-native';
import { Body, CoachBubble, Screen, Title, s } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { GEAR } from '@/utils/equipment';

const GOAL = { feel_healthier: 'Feel healthier', get_stronger: 'Get stronger', lose_weight: 'Lose some weight' };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.line }}>
      <Text style={s.meta}>{label}</Text>
      <Text style={{ flex: 1, textAlign: 'right', fontFamily: fonts.bold, fontSize: 15, color: colors.ink }}>{value}</Text>
    </View>
  );
}

// ponytail: shows the saved answers until plan generation (roadmap week 3) fills this screen.
export default function Today() {
  const { draft } = useProfile();
  const gear =
    draft.place === 'gym'
      ? 'Gym equipment'
      : GEAR.filter((g) => draft.gear.includes(g.id))
          .map((g) => g.label)
          .join(', ') || 'None, bodyweight only';

  return (
    <Screen>
      <Text style={s.meta}>Week 1</Text>
      <Title>Today</Title>
      <CoachBubble>Thanks! I'm putting your first week together. Your workout will show up right here.</CoachBubble>
      <View style={[s.card, { padding: 16 }]}>
        <Body style={{ fontFamily: fonts.bold, color: colors.ink, marginBottom: 6 }}>What you told Capy</Body>
        <Row label="Goal" value={draft.goal ? GOAL[draft.goal] : 'Not set'} />
        <Row label="Time" value={`${draft.daysPerWeek} days · ${draft.minutesPerSession} min`} />
        <Row label="Equipment" value={gear} />
        <Row label="Areas to protect" value={draft.injuredAreas.length ? draft.injuredAreas.join(', ').replace('_', ' ') : 'None'} />
      </View>
    </Screen>
  );
}
