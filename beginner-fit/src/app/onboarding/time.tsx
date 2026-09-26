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

export default function Time() {
  const { draft, update } = useProfile();
  return (
    <Screen footer={<Button label="Continue" onPress={() => router.push('/onboarding/equipment')} />}>
      <StepHeader step={2} total={4} onBack={() => router.back()} />
      <Title>How much time do you have?</Title>
      <View style={[s.card, { padding: 16, gap: 12 }]}>
        <Body style={{ fontFamily: fonts.bold, color: colors.ink }}>Days per week</Body>
        <View style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="radiogroup">
          {[2, 3, 4].map((n) => (
            <Choice key={n} big label={String(n)} selected={draft.daysPerWeek === n} onPress={() => update({ daysPerWeek: n })} />
          ))}
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
