import { router } from 'expo-router';
import { Step } from '@/components/onboarding';
import { Button, Group, ToggleRow } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { AREA_LABEL, AREAS } from '@/utils/types';

export default function Areas() {
  const { draft, update } = useProfile();
  return (
    <Step
      step={4}
      title="What should we be gentle with?"
      subtitle="Capy leaves out moves that load these areas. You'll still get a full plan."
      capy={{ mood: 'caring', size: 108 }}
      onBack={() => router.back()}
      footer={<Button label="Continue" disabled={draft.injuredAreas.length === 0} onPress={() => router.push('/onboarding/disclaimer')} />}
    >
      <Group>
        {AREAS.map((a) => {
          const on = draft.injuredAreas.includes(a);
          return <ToggleRow key={a} label={AREA_LABEL[a]} value={on} onChange={() => update({ injuredAreas: on ? draft.injuredAreas.filter((x) => x !== a) : [...draft.injuredAreas, a] })} />;
        })}
      </Group>
    </Step>
  );
}
