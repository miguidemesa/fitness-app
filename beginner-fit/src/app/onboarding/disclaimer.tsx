import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { CapyFigure } from '@/components/capy';
import { Step } from '@/components/onboarding';
import { Body, Button, Group, ToggleRow } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { space } from '@/theme';
import { isHighRisk } from '@/utils/screening';

export default function Disclaimer() {
  const { draft } = useProfile();
  const [agreed, setAgreed] = useState(false);

  // Safety net: never reach the plan with a high-risk or skipped health answer.
  if (isHighRisk(draft.answers)) return <Redirect href="/onboarding/blocked" />;

  return (
    <Step
      step={4}
      title="One last thing"
      capy={<CapyFigure size={120} mood="caring" />}
      onBack={() => router.back()}
      footer={<Button variant="accent" tall label="Build my plan" disabled={!agreed} onPress={() => router.push('/onboarding/building')} />}
    >
      <Body style={{ textAlign: 'center' }}>Capy gives general exercise guidance. It isn't medical advice.</Body>
      <Body style={{ textAlign: 'center', marginBottom: space.s }}>If a move hurts, stop and tell Capy when you log it. Capy will never make a painful move harder.</Body>
      <Group>
        <ToggleRow label="I understand, and I'll stop if something hurts." value={agreed} onChange={setAgreed} />
      </Group>
    </Step>
  );
}
