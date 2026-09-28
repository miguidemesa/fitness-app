import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type Reminders = { on: boolean; hour: number };
const KEY = 'capy.reminders';
const CHANNEL = 'workouts';
export const HOURS = [
  { hour: 8, label: 'Morning' },
  { hour: 12, label: 'Midday' },
  { hour: 18, label: 'Evening' },
] as const;

/**
 * expo-notifications throws as soon as it's imported in Expo Go on Android, so it is loaded only when a reminder
 * is actually set. Rejects with "unsupported" there; reminders then need the installed app (a development build).
 */
async function notifications(): Promise<typeof import('expo-notifications')> {
  try {
    return await import('expo-notifications');
  } catch {
    throw new Error('unsupported');
  }
}

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
 * Throws Error('unsupported') where notifications can't run (Expo Go on Android).
 */
export async function applyReminders(r: Reminders, schedule: number[]): Promise<boolean> {
  const N = await notifications();
  await AsyncStorage.setItem(KEY, JSON.stringify(r));
  await N.cancelAllScheduledNotificationsAsync();
  if (!r.on) return true;
  const perm = await N.requestPermissionsAsync();
  if (!perm.granted) return false;
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync(CHANNEL, { name: 'Workout reminders', importance: N.AndroidImportance.DEFAULT });
  }
  for (const d of schedule) {
    await N.scheduleNotificationAsync({
      content: { title: 'Time to train 💪', body: "Today's a workout day. Capy has your moves ready." },
      trigger: { type: N.SchedulableTriggerInputTypes.WEEKLY, weekday: expoWeekday(d), hour: r.hour, minute: 0, channelId: CHANNEL },
    });
  }
  return true;
}

/** On launch and when the workout days change: re-schedule from the saved settings. Never asks for permission. */
export async function resyncReminders(schedule: number[]): Promise<void> {
  const r = await loadReminders();
  if (!r.on) return; // nothing saved: don't even load the notifications module
  const N = await notifications();
  if (!(await N.getPermissionsAsync()).granted) return;
  await applyReminders(r, schedule);
}
