import { router } from 'expo-router';
import { Step } from '@/components/onboarding';
import { Button, OptionPill } from '@/components/ui';
import { useProfile, type ProfileDraft } from '@/state/profile';

const GOALS: { id: NonNullable<ProfileDraft['goal']>; label: string; hint: string }[] = [
  { id: 'feel_healthier', label: 'Feel healthier', hint: 'More energy, better sleep, less stiffness.' },
  { id: 'get_stronger', label: 'Get stronger', hint: 'Carry the shopping and take the stairs with ease.' },
  { id: 'lose_weight', label: 'Lose some weight', hint: 'Move more, steadily. No crash anything.' },
];

export default function Goal() {
  const { draft, update } = useProfile();
  return (
    <Step
      step={1}
      title="What brings you here?"
      subtitle="Any of these is a great reason. Capy shapes your plan around it."
      capy={{ mood: draft.goal ? 'cheer' : 'hello', hopKey: draft.goal }}
      onBack={() => router.back()}
      footer={<Button label="Continue" disabled={!draft.goal} onPress={() => router.push('/onboarding/time')} />}
    >
      {GOALS.map((g) => (
        <OptionPill key={g.id} label={g.label} hint={g.hint} selected={draft.goal === g.id} onPress={() => update({ goal: g.id })} />
      ))}
    </Step>
  );
}
