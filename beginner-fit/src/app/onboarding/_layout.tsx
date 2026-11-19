import { Stack } from 'expo-router/stack';
import { colors } from '@/theme';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.porcelain } }}>
      {/* The welcome and plan-building screens are yuzu; no swiping back out of a build in progress. */}
      <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: colors.yuzu } }} />
      <Stack.Screen name="building" options={{ gestureEnabled: false, animation: 'fade', contentStyle: { backgroundColor: colors.yuzu } }} />
    </Stack>
  );
}
