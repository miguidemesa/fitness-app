import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useNotify } from '@/components/notify';
import { ScheduleCard } from '@/components/reminders';
import { Body, Button, Card, Field, Screen, Segmented, Tag, fail } from '@/components/ui';
import { accountEmail, confirmEmail, deleteAccount, linkEmail, setDisplayName, signOut } from '@/lib/supabase';
import { resyncReminders } from '@/lib/reminders';
import { useProfile } from '@/state/profile';
import { useWorkout } from '@/state/workout';
import { space, type } from '@/theme';

function Section({ title }: { title: string }) {
  return (
    <View accessibilityRole="header" style={{ marginTop: space.m }}>
      <Tag>{title}</Tag>
    </View>
  );
}

const card = { padding: space.l, gap: space.m };

/** Opened from the gear on Profile. Training setup, account and security, and deleting data. */
export default function Settings() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    accountEmail().then(setEmail);
  }, []);

  return (
    <Screen>
      <Section title="Training" />
      <ScheduleCard />
      <UnitsCard />
      <Section title="Profile" />
      <NameCard />
      <Section title="Account & security" />
      {email === undefined ? null : email ? <SignedIn email={email} /> : <SaveProgress onSaved={setEmail} />}
      <DeleteData />
    </Screen>
  );
}

function UnitsCard() {
  const { units, setUnits } = useWorkout();
  return (
    <Card style={card}>
      <Text style={type.label}>Weights in</Text>
      <Segmented
        options={[
          { value: 'kg', label: 'Kilograms' },
          { value: 'lb', label: 'Pounds' },
        ]}
        value={units}
        onChange={setUnits}
      />
    </Card>
  );
}

function NameCard() {
  const { draft, update } = useProfile();
  const notify = useNotify();
  const [name, setName] = useState(draft.displayName ?? '');
  const [busy, setBusy] = useState(false);
  const changed = name.trim() !== (draft.displayName ?? '') && name.trim().length > 0;
  const save = async () => {
    setBusy(true);
    try {
      await setDisplayName(name);
      update({ displayName: name.trim() });
      notify({ title: 'Name saved', message: `Capy will call you ${name.trim()}` });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card style={card}>
      <View style={{ gap: 2 }}>
        <Text style={type.label}>Your name</Text>
        <Text style={type.caption}>Capy and your buddy see this.</Text>
      </View>
      <Field value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" maxLength={30} />
      {changed ? <Button label={busy ? 'Saving…' : 'Save name'} disabled={busy} onPress={save} /> : null}
    </Card>
  );
}

/** Turns the anonymous account into an email one, so progress survives a new phone. */
function SaveProgress({ onSaved }: { onSaved: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const go = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Card style={card}>
      <Text style={type.label}>Save your progress</Text>
      <Body>Add your email so a new phone doesn't mean starting over. No password.</Body>
      <Field value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" editable={!sent} />
      {sent ? (
        <>
          <Field value={token} onChangeText={setToken} placeholder="Code from the email" keyboardType="number-pad" autoComplete="one-time-code" maxLength={8} />
          <Button
            label="Confirm"
            disabled={busy || token.trim().length < 6}
            onPress={() =>
              go(async () => {
                await confirmEmail(email, token);
                onSaved(email.trim());
              })
            }
          />
        </>
      ) : (
        <Button
          label="Send me a code"
          disabled={busy || !email.includes('@')}
          onPress={() =>
            go(async () => {
              await linkEmail(email);
              setSent(true);
            })
          }
        />
      )}
    </Card>
  );
}

/** Signing out is only offered once an email is saved: signing out of an anonymous account would lose it. */
function SignedIn({ email }: { email: string }) {
  const { reset } = useProfile();
  const out = () =>
    Alert.alert('Sign out?', `Your progress stays saved. Sign back in with ${email} any time.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            await resyncReminders([]).catch(() => {});
            reset();
            router.replace('/onboarding');
          } catch (e) {
            fail(e);
          }
        },
      },
    ]);
  return (
    <Card style={card}>
      <Text style={type.label}>Email</Text>
      <Body>{email}</Body>
      <Text style={type.caption}>Your progress is saved. On a new phone, choose "I already have an account".</Text>
      <Button variant="secondary" label="Sign out" onPress={out} />
    </Card>
  );
}

/** Permanent delete, behind a confirmation. Required by the app stores. */
function DeleteData() {
  const { reset } = useProfile();
  const [busy, setBusy] = useState(false);
  const confirm = () =>
    Alert.alert('Delete all my data?', 'This removes your plan and workout history for good. You can start again any time.', [
      { text: 'Keep my data', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await deleteAccount();
            await resyncReminders([]).catch(() => {});
            reset();
            router.replace('/onboarding');
          } catch {
            Alert.alert("Couldn't delete", 'Check your connection and try again.');
            setBusy(false);
          }
        },
      },
    ]);
  return <Button variant="text" label={busy ? 'Deleting…' : 'Delete my data'} disabled={busy} onPress={confirm} />;
}
