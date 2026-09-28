import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, CoachBubble, Screen, StepHeader, Title, s } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';

function Choice({ label, selected, onPress, big }: { label: string; selected: boolean; onPress: () => void; big?: boolean }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[s.option, { flex: 1, justifyContent: 'center', minHeight: big ? 64 : 52 }, selected && s.optionOn]}
    >
      <Text style={{ fontFamily: big ? fonts.display : fonts.bold, fontSize: big ? 30 : 17, color: selected ? colors.accent : colors.ink }}>{label}</Text>
    </Pressable>
  );
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MIN_DAYS = 2;
const MAX_DAYS = 4;

export default function Time() {
  const { draft, update } = useProfile();
  const toggle = (d: number) => {
    const on = draft.schedule.includes(d);
    if (!on && draft.schedule.length >= MAX_DAYS) return;
    const schedule = (on ? draft.schedule.filter((x) => x !== d) : [...draft.schedule, d]).sort();
    update({ schedule, daysPerWeek: schedule.length });
  };
  return (
    <Screen footer={<Button label="Continue" disabled={draft.schedule.length < MIN_DAYS} onPress={() => router.push('/onboarding/equipment')} />}>
      <StepHeader step={2} total={4} onBack={() => router.back()} />
      <Title>How much time do you have?</Title>
      <View style={[s.card, { padding: 16, gap: 12 }]}>
        <Body style={{ fontFamily: fonts.bold, color: colors.ink }}>Which days will you train?</Body>
        <Body>Pick {MIN_DAYS} to {MAX_DAYS}. You can change them later.</Body>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {WEEKDAYS.map((label, d) => {
            const selected = draft.schedule.includes(d);
            return (
              <Pressable
                key={label}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => toggle(d)}
                style={[s.option, { minWidth: 72, minHeight: 52, justifyContent: 'center', alignItems: 'center' }, selected && s.optionOn]}
              >
                <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: selected ? colors.accent : colors.ink }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
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
