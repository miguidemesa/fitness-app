import { Text } from 'react-native';
import { DayCard } from '@/components/plan';
import { CoachBubble, Screen, Title, s } from '@/components/ui';
import { useProfile } from '@/state/profile';

export default function Week() {
  const { draft, plan } = useProfile();
  return (
    <Screen>
      <Text style={s.meta}>
        Week {plan?.week ?? 1} · {plan?.days.length ?? draft.daysPerWeek} sessions
      </Text>
      <Title>This week</Title>
      {plan ? (
        plan.days.map((day, d) => [
          <Text key={`h${d}`} accessibilityRole="header" style={[s.meta, { marginTop: 6 }]}>
            Day {d + 1} · {day.length} moves
          </Text>,
          <DayCard key={`d${d}`} items={day} />,
        ])
      ) : (
        <CoachBubble>Your {draft.daysPerWeek} workout days will be listed here once your plan is ready.</CoachBubble>
      )}
    </Screen>
  );
}
