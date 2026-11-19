import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Redirect } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MiniPlayer } from '@/components/workout/mini-player';
import { resyncReminders } from '@/lib/reminders';
import { useProfile } from '@/state/profile';
import { useWorkout } from '@/state/workout';
import { colors, space } from '@/theme';

// iOS 26 puts the in-progress workout in the Liquid Glass tab bar's accessory; everyone else gets a floating pill.
const ACCESSORY = Platform.OS === 'ios' && isLiquidGlassAvailable();
const TAB_BAR = Platform.select({ ios: 49, default: 80 });

export default function TabsLayout() {
  const { ready, draft } = useProfile();
  const { active } = useWorkout();
  const insets = useSafeAreaInsets();
  // Keep the phone's reminders matching the saved workout days (they are lost if the app is reinstalled).
  useEffect(() => {
    if (ready) resyncReminders(draft.schedule).catch(() => {});
  }, [ready, draft.schedule]);
  if (!ready) return null;
  if (!draft.disclaimerAcceptedAt) return <Redirect href="/onboarding" />;

  return (
    <View style={{ flex: 1 }}>
      <NativeTabs tintColor={colors.ink} minimizeBehavior="onScrollDown" indicatorColor={colors.yuzuSoft} rippleColor={colors.yuzuSoft} labelStyle={{ fontFamily: 'Figtree_600SemiBold' }}>
        <NativeTabs.Trigger name="home">
          <NativeTabs.Trigger.Icon sf="house" md="home" />
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="plan">
          <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
          <NativeTabs.Trigger.Label>Plan</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
          <NativeTabs.Trigger.Label>You</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        {ACCESSORY && active ? (
          <NativeTabs.BottomAccessory>
            <MiniPlayer />
          </NativeTabs.BottomAccessory>
        ) : null}
      </NativeTabs>
      {!ACCESSORY && active ? (
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: TAB_BAR + insets.bottom + space.s }}>
          <MiniPlayer floating />
        </View>
      ) : null}
    </View>
  );
}
