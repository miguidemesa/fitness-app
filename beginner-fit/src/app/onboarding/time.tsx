import { router } from 'expo-router';
import { Text } from 'react-native';
import { DayRing, Step } from '@/components/onboarding';
import { Button, MAX_DAYS, MIN_DAYS, Segmented, Tag, WeekdayChips } from '@/components/ui';
import { useProfile } from '@/state/profile';
import { space, type } from '@/theme';

export default function Time() {
  const { draft, update } = useProfile();
  const n = draft.schedule.length;
  return (
    <Step
      step={2}
      title="Which days can be yours?"
      capy={<DayRing selected={draft.schedule} />}
      onBack={() => router.back()}
      footer={<Button label="Continue" disabled={n < MIN_DAYS} onPress={() => router.push('/onboarding/equipment')} />}
    >
      <Text style={[type.label, { textAlign: 'center', marginTop: -space.s }]}>
        {n >= MIN_DAYS ? `${n} days for yourself. A rhythm, not a rule.` : `Pick ${MIN_DAYS} to ${MAX_DAYS} days. You can change them later.`}
      </Text>
      <WeekdayChips selected={draft.schedule} onChange={(schedule) => update({ schedule, daysPerWeek: schedule.length })} />
      <Tag>Minutes per session</Tag>
      <Segmented
        options={[20, 30, 45].map((m) => ({ value: m, label: `${m} min` }))}
        value={draft.minutesPerSession}
        onChange={(minutesPerSession) => update({ minutesPerSession })}
      />
    </Step>
  );
}
