import { router } from 'expo-router';
import { Text } from 'react-native';
import { Step } from '@/components/onboarding';
import { Button, CoachLine, Group, Segmented, Tag, ToggleRow } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { type } from '@/theme';
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
    <Step
      step={3}
      title="Where will you move?"
      onBack={() => router.back()}
      footer={<Button label="Continue" disabled={!answered} onPress={() => router.push('/onboarding/health')} />}
    >
      <Segmented options={PLACES.map((p) => ({ value: p.id, label: p.label }))} value={draft.place} onChange={(place) => update({ place })} />
      {gym ? (
        <CoachLine>A gym has everything you need. I'll pick simple moves with dumbbells, benches and mats, and show you how each one works. No confusing machines to start.</CoachLine>
      ) : (
        <>
          <Tag>What do you have?</Tag>
          <Group>
            <ToggleRow label="No equipment" hint="Bodyweight only. Plenty to start with." value={draft.noGear && draft.gear.length === 0} onChange={(on) => update({ noGear: on, gear: on ? [] : draft.gear })} />
            {GEAR.map((g) => {
              const on = draft.gear.includes(g.id);
              return <ToggleRow key={g.id} label={g.label} hint={g.hint} value={on} onChange={() => update({ noGear: false, gear: on ? draft.gear.filter((x) => x !== g.id) : [...draft.gear, g.id] })} />;
            })}
          </Group>
        </>
      )}
      <Text style={type.caption}>{summary}</Text>
    </Step>
  );
}
