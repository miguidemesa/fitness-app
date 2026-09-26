import { router } from 'expo-router';
import { Button, CoachBubble, OptionCard, Screen, StepHeader, Title } from '@/components/ui';
import { useProfile, type ProfileDraft } from '@/state/profile';

const GOALS: { id: NonNullable<ProfileDraft['goal']>; label: string }[] = [
  { id: 'feel_healthier', label: 'Feel healthier, more energy' },
  { id: 'get_stronger', label: 'Get stronger' },
  { id: 'lose_weight', label: 'Lose some weight' },
];

export default function Goal() {
  const { draft, update } = useProfile();
  return (
    <Screen footer={<Button label="Continue" disabled={!draft.goal} onPress={() => router.push('/onboarding/time')} />}>
      <StepHeader step={1} total={4} onBack={() => router.back()} />
      <Title>What's your goal?</Title>
      {GOALS.map((g) => (
        <OptionCard key={g.id} label={g.label} selected={draft.goal === g.id} onPress={() => update({ goal: g.id })} />
      ))}
      <CoachBubble>Any of these is a great reason. I'll shape your plan around it.</CoachBubble>
    </Screen>
  );
}
