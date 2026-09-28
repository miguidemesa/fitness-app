import { router } from 'expo-router';
import { AreaChips, Body, Button, Screen, StepHeader, Title } from '@/components/ui';
import { useProfile } from '@/state/profile';

export default function Areas() {
  const { draft, update } = useProfile();
  return (
    <Screen footer={<Button label="Continue" disabled={draft.injuredAreas.length === 0} onPress={() => router.push('/onboarding/disclaimer')} />}>
      <StepHeader step={4} total={4} onBack={() => router.back()} />
      <Title>Where does it bother you?</Title>
      <Body>Capy will leave out moves that load these areas. You'll still get a full plan.</Body>
      <AreaChips
        multi
        selected={draft.injuredAreas}
        onPress={(a) => update({ injuredAreas: draft.injuredAreas.includes(a) ? draft.injuredAreas.filter((x) => x !== a) : [...draft.injuredAreas, a] })}
      />
    </Screen>
  );
}
