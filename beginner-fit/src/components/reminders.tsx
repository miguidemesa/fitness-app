import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Body, Button, MAX_DAYS, MIN_DAYS, OptionCard, WeekdayChips, s } from '@/components/ui';
import { saveProfile } from '@/lib/supabase';
import { applyReminders, HOURS, loadReminders, type Reminders } from '@/lib/reminders';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';

/** Workout days (editable after onboarding) and the phone reminders that follow them. */
export function ScheduleCard() {
  const { draft, update } = useProfile();
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
      }
    } catch {
      Alert.alert("Couldn't set reminders", 'Try again in a moment.');
    }
  };

  const changeDays = async (schedule: number[]) => {
    update({ schedule, daysPerWeek: schedule.length });
    if (schedule.length < MIN_DAYS) return; // wait for a valid choice before saving
    // ponytail: the new day count shapes the next plan you get; the current week keeps its length.
    saveProfile({ ...draft, schedule, daysPerWeek: schedule.length }).catch(() => {});
    if (rem.on) setReminders(rem, schedule);
  };

  return (
    <View style={[s.card, { padding: 16, gap: 10 }]}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink }}>Your workout days</Text>
      <Body>
        Pick {MIN_DAYS} to {MAX_DAYS}. Your buddy streak follows these days.
      </Body>
      <WeekdayChips selected={draft.schedule} onChange={changeDays} />
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink, marginTop: 8 }}>Reminders</Text>
      <Body>A nudge on each workout day, on this phone only.</Body>
      <Button
        variant={rem.on ? 'ghost' : 'primary'}
        label={rem.on ? 'Turn reminders off' : 'Turn reminders on'}
        onPress={() => setReminders({ ...rem, on: !rem.on })}
      />
      {rem.on
        ? HOURS.map(({ hour, label }) => (
            <OptionCard key={hour} label={label} hint={`${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'pm' : 'am'}`} selected={rem.hour === hour} onPress={() => setReminders({ ...rem, hour })} />
          ))
        : null}
    </View>
  );
}
