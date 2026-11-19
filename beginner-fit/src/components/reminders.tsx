import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useNotify } from '@/components/notify';
import { Group, MAX_DAYS, MIN_DAYS, Segmented, ToggleRow, WeekdayChips } from '@/components/ui';
import { saveProfile } from '@/lib/supabase';
import { applyReminders, HOURS, loadReminders, type Reminders } from '@/lib/reminders';
import { useProfile } from '@/state/profile';
import { space, type } from '@/theme';

/** Workout days (editable after onboarding) and the phone reminders that follow them. */
export function ScheduleCard() {
  const { draft, update } = useProfile();
  const notify = useNotify();
  const [rem, setRem] = useState<Reminders>({ on: false, hour: 18 });
  useEffect(() => {
    loadReminders().then(setRem);
  }, []);

  const setReminders = async (next: Reminders, schedule = draft.schedule) => {
    setRem(next);
    try {
      if (!(await applyReminders(next, schedule))) {
        setRem({ ...next, on: false });
        await applyReminders({ ...next, on: false }, schedule);
        Alert.alert('Notifications are off', "Allow notifications for Capy in your phone's settings to get reminders.");
      } else if (next.on && !rem.on) {
        const when = HOURS.find((h) => h.hour === next.hour)?.label.toLowerCase() ?? '';
        notify({ title: 'Reminders on', message: `A nudge each workout day, ${when}`, mood: 'cheer' });
      }
    } catch (e) {
      setRem({ ...next, on: false });
      Alert.alert(
        "Couldn't set reminders",
        e instanceof Error && e.message === 'unsupported' ? "Reminders need the installed Capy app. They don't work in Expo Go." : 'Try again in a moment.',
      );
    }
  };

  const changeDays = async (schedule: number[]) => {
    update({ schedule, daysPerWeek: schedule.length });
    if (schedule.length < MIN_DAYS) return; // wait for a valid choice before saving
    // ponytail: the new day count shapes the next plan you get; the current week keeps its length.
    const save = (): Promise<unknown> =>
      saveProfile({ ...draft, schedule, daysPerWeek: schedule.length }).catch(() => notify({ title: "Couldn't save your days", message: 'Tap to try again', mood: 'caring', onPress: save }));
    save();
    if (rem.on) setReminders(rem, schedule);
  };

  return (
    <Group>
      <View style={{ padding: space.l, gap: space.m }}>
        <View style={{ gap: 2 }}>
          <Text style={type.label}>Your workout days</Text>
          <Text style={type.caption}>
            Pick {MIN_DAYS} to {MAX_DAYS}. Your buddy streak follows these days.
          </Text>
        </View>
        <WeekdayChips selected={draft.schedule} onChange={changeDays} />
      </View>
      <ToggleRow label="Reminders" hint="A nudge on each workout day, on this phone only." value={rem.on} onChange={(on) => setReminders({ ...rem, on })} />
      {rem.on ? (
        <View style={{ padding: space.l }}>
          <Segmented options={HOURS.map(({ hour, label }) => ({ value: hour, label }))} value={rem.hour} onChange={(hour) => setReminders({ ...rem, hour })} />
        </View>
      ) : null}
    </Group>
  );
}
