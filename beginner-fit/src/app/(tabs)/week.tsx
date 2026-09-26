import { Text } from 'react-native';
import { CoachBubble, Screen, Title, s } from '@/components/ui';
import { useProfile } from '@/state/profile';

export default function Week() {
  const { draft } = useProfile();
  return (
    <Screen>
      <Text style={s.meta}>Week 1 · {draft.daysPerWeek} sessions</Text>
      <Title>This week</Title>
      <CoachBubble>Your {draft.daysPerWeek} workout days will be listed here once your plan is ready.</CoachBubble>
    </Screen>
  );
}
