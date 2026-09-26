import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, CoachBubble, OptionCard, Screen, StepHeader, Title, s } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { GEAR, PLACES } from '@/utils/equipment';

export default function Equipment() {
  const { draft, update } = useProfile();
  const gym = draft.place === 'gym';
  const answered = gym || draft.noGear || draft.gear.length > 0;
  const names = GEAR.filter((g) => draft.gear.includes(g.id)).map((g) => g.label.toLowerCase());
  const summary = gym
    ? 'Capy will plan for a gym.'
    : names.length
      ? `Capy will use: ${names.join(', ')}.`
      : draft.noGear
        ? 'Capy will plan bodyweight moves only.'
        : 'Pick what you have, or "No equipment".';

  return (
    <Screen footer={<Button label="Continue" disabled={!answered} onPress={() => router.push('/onboarding/health')} />}>
      <StepHeader step={3} total={4} onBack={() => router.back()} />
      <Title>Your space and equipment</Title>
      <Body style={{ fontFamily: fonts.bold, color: colors.ink }}>Where will you usually work out?</Body>
      <View style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="radiogroup">
        {PLACES.map((p) => {
          const on = draft.place === p.id;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => update({ place: p.id })}
              style={[s.option, { flex: 1, justifyContent: 'center', minHeight: 64, paddingHorizontal: 8 }, on && s.optionOn]}
            >
              <Text style={{ fontFamily: fonts.bold, fontSize: 15, color: on ? colors.accent : colors.ink }}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {gym ? (
        <CoachBubble>A gym has everything you need. I'll pick simple moves with dumbbells, benches and mats, and show you how each one works. No confusing machines to start.</CoachBubble>
      ) : (
        <>
          <Body style={{ fontFamily: fonts.bold, color: colors.ink, marginTop: 6 }}>What do you have? Pick all that apply.</Body>
          <OptionCard multi label="No equipment" hint="Bodyweight only. Plenty to start with." selected={draft.noGear && draft.gear.length === 0} onPress={() => update({ noGear: true, gear: [] })} />
          {GEAR.map((g) => {
            const on = draft.gear.includes(g.id);
            return (
              <OptionCard
                key={g.id}
                multi
                label={g.label}
                hint={g.hint}
                selected={on}
                onPress={() => update({ noGear: false, gear: on ? draft.gear.filter((x) => x !== g.id) : [...draft.gear, g.id] })}
              />
            );
          })}
        </>
      )}
      <Body style={{ fontSize: 14, color: colors.muted }}>{summary}</Body>
    </Screen>
  );
}
