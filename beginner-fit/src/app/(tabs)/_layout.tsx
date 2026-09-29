import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { resyncReminders } from '@/lib/reminders';
import { useProfile } from '@/state/profile';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { ready, draft } = useProfile();
  // Keep the phone's reminders matching the saved workout days (they are lost if the app is reinstalled).
  useEffect(() => {
    if (ready) resyncReminders(draft.schedule).catch(() => {});
  }, [ready, draft.schedule]);
  if (!ready) return null;
  if (!draft.disclaimerAcceptedAt) return <Redirect href="/onboarding" />;

  return (
    <NativeTabs tintColor={colors.accent}>
      <NativeTabs.Trigger name="today">
        <NativeTabs.Trigger.Icon sf="sun.max" md="today" />
        <NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="week">
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
        <NativeTabs.Trigger.Label>This week</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="progress">
        <NativeTabs.Trigger.Icon sf="chart.bar" md="bar_chart" />
        <NativeTabs.Trigger.Label>Progress</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf="person.crop.circle" md="account_circle" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
