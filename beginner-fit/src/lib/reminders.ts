import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type Reminders = { on: boolean; hour: number };
const KEY = 'capy.reminders';
const CHANNEL = 'workouts';
export const HOURS = [
  { hour: 8, label: 'Morning' },
  { hour: 12, label: 'Midday' },
  { hour: 18, label: 'Evening' },
] as const;

/** Saved on this phone only: notifications belong to the device, not the account. */
export async function loadReminders(): Promise<Reminders> {
  try {
    return { on: false, hour: 18, ...JSON.parse((await AsyncStorage.getItem(KEY)) ?? '{}') };
  } catch {
    return { on: false, hour: 18 };
  }
}

/** Capy's weekday (0 = Monday … 6 = Sunday) → Expo's (1 = Sunday … 7 = Saturday). */
const expoWeekday = (d: number) => ((d + 1) % 7) + 1;

/**
 * Makes the phone's scheduled reminders match the settings: one weekly reminder on each workout day.
 * Returns false when the user turned reminders on but the phone's permission was refused.
 */
export async function applyReminders(r: Reminders, schedule: number[]): Promise<boolean> {
  await AsyncStorage.setItem(KEY, JSON.stringify(r));
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!r.on) return true;
  const perm = await Notifications.requestPermissionsAsync();
  if (!perm.granted) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, { name: 'Workout reminders', importance: Notifications.AndroidImportance.DEFAULT });
  }
  for (const d of schedule) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Time to train 💪', body: "Today's a workout day. Capy has your moves ready." },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: expoWeekday(d), hour: r.hour, minute: 0, channelId: CHANNEL },
    });
  }
  return true;
}

/** On launch and when the workout days change: re-schedule from the saved settings. Never asks for permission. */
export async function resyncReminders(schedule: number[]): Promise<void> {
  const r = await loadReminders();
  if (!r.on) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;
  await applyReminders(r, schedule);
}
