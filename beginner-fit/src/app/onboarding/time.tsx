import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, CoachBubble, MAX_DAYS, MIN_DAYS, Screen, StepHeader, Title, WeekdayChips, s } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';

function Choice({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[s.option, { flex: 1, justifyContent: 'center', minHeight: 52 }, selected && s.optionOn]}
    >
      <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: selected ? colors.accent : colors.ink }}>{label}</Text>
    </Pressable>
  );
}

export default function Time() {
  const { draft, update } = useProfile();
  return (
    <Screen footer={<Button label="Continue" disabled={draft.schedule.length < MIN_DAYS} onPress={() => router.push('/onboarding/equipment')} />}>
      <StepHeader step={2} total={4} onBack={() => router.back()} />
      <Title>How much time do you have?</Title>
      <View style={[s.card, { padding: 16, gap: 12 }]}>
        <Body style={{ fontFamily: fonts.bold, color: colors.ink }}>Which days will you train?</Body>
        <Body>Pick {MIN_DAYS} to {MAX_DAYS}. You can change them later.</Body>
        <WeekdayChips selected={draft.schedule} onChange={(schedule) => update({ schedule, daysPerWeek: schedule.length })} />
        <Body style={{ fontFamily: fonts.bold, color: colors.ink, marginTop: 8 }}>Minutes per session</Body>
        <View style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="radiogroup">
          {[20, 30, 45].map((n) => (
            <Choice key={n} label={`${n} min`} selected={draft.minutesPerSession === n} onPress={() => update({ minutesPerSession: n })} />
          ))}
        </View>
      </View>
      <CoachBubble>Start small. Three short sessions a week is plenty, and much easier to keep.</CoachBubble>
    </Screen>
  );
}
