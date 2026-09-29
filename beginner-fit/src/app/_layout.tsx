import { Archivo_500Medium, Archivo_700Bold } from '@expo-google-fonts/archivo';
import { BarlowCondensed_800ExtraBold_Italic } from '@expo-google-fonts/barlow-condensed';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { ProfileProvider } from '@/state/profile';
import { colors } from '@/theme';

// Pushed screens get a native header with a back button; the rest draw their own.
const pushed = { headerShown: true, title: '', headerBackTitle: 'Back', headerShadowVisible: false, headerStyle: { backgroundColor: colors.ground }, headerTintColor: colors.ink };

export default function RootLayout() {
  const [loaded] = useFonts({ Archivo_500Medium, Archivo_700Bold, BarlowCondensed_800ExtraBold_Italic });
  if (!loaded) return null;

  return (
    <ProfileProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ground } }}>
        <Stack.Screen name="exercise/[id]" options={pushed} />
        <Stack.Screen name="buddy" options={pushed} />
        <Stack.Screen name="settings" options={pushed} />
      </Stack>
    </ProfileProvider>
  );
}
