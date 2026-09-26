import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Screen, StepHeader, Title, s } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { AREAS, type Area } from '@/utils/types';

const LABEL: Record<Area, string> = {
  neck: 'Neck',
  shoulder: 'Shoulder',
  elbow: 'Elbow',
  wrist: 'Wrist',
  lower_back: 'Lower back',
  hip: 'Hip',
  knee: 'Knee',
  ankle: 'Ankle',
};

export default function Areas() {
  const { draft, update } = useProfile();
  return (
    <Screen footer={<Button label="Continue" disabled={draft.injuredAreas.length === 0} onPress={() => router.push('/onboarding/disclaimer')} />}>
      <StepHeader step={4} total={4} onBack={() => router.back()} />
      <Title>Where does it bother you?</Title>
      <Body>Capy will leave out moves that load these areas. You'll still get a full plan.</Body>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {AREAS.map((a) => {
          const on = draft.injuredAreas.includes(a);
          return (
            <Pressable
              key={a}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              onPress={() => update({ injuredAreas: on ? draft.injuredAreas.filter((x) => x !== a) : [...draft.injuredAreas, a] })}
              style={[s.option, { width: '48%', justifyContent: 'center', minHeight: 52 }, on && s.optionOn]}
            >
              <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: on ? colors.accent : colors.ink }}>{LABEL[a]}</Text>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}
