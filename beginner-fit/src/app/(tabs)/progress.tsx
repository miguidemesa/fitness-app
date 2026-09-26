import { Text } from 'react-native';
import { CoachBubble, Screen, Title, s } from '@/components/ui';

export default function Progress() {
  return (
    <Screen>
      <Text style={s.meta}>Week 1</Text>
      <Title>Progress</Title>
      <CoachBubble>Nothing logged yet. After your first workout, you'll see how each move felt here.</CoachBubble>
    </Screen>
  );
}
