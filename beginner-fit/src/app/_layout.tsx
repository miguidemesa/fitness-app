import { BricolageGrotesque_500Medium, BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { Figtree_400Regular, Figtree_500Medium, Figtree_600SemiBold } from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NotifyProvider } from '@/components/notify';
import { ProfileProvider } from '@/state/profile';
import { WorkoutProvider } from '@/state/workout';
import { colors, fonts, radius } from '@/theme';

// Pushed screens get a native header with a back button; the rest draw their own.
const pushed = {
  headerShown: true,
  title: '',
  headerBackTitle: 'Back',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.porcelain },
  headerTintColor: colors.ink,
  headerTitleStyle: { fontFamily: fonts.bold },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
  });
  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ProfileProvider>
        <WorkoutProvider>
          <NotifyProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.porcelain } }}>
              <Stack.Screen name="session/[day]" />
              {/* The workout slides up and only leaves through its own × (no stray swipe-to-dismiss mid-set). */}
              <Stack.Screen name="workout" options={{ presentation: 'fullScreenModal', gestureEnabled: false, contentStyle: { backgroundColor: colors.night } }} />
              {/* How-to is a native sheet, so the session behind it stays in view. */}
              <Stack.Screen
                name="exercise/[id]"
                options={{ presentation: 'formSheet', sheetGrabberVisible: true, sheetAllowedDetents: [0.92], sheetCornerRadius: radius.sheet, contentStyle: { backgroundColor: colors.porcelain } }}
              />
              <Stack.Screen name="buddy" options={{ ...pushed, title: 'Buddy' }} />
              <Stack.Screen name="settings" options={{ ...pushed, title: 'Settings' }} />
            </Stack>
          </NotifyProvider>
        </WorkoutProvider>
      </ProfileProvider>
    </GestureHandlerRootView>
  );
}
