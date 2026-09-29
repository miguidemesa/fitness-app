import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { ScheduleCard } from '@/components/reminders';
import { Body, Button, Field, Screen, Title, fail, s } from '@/components/ui';
import { accountEmail, confirmEmail, deleteAccount, linkEmail, setDisplayName, signOut } from '@/lib/supabase';
import { resyncReminders } from '@/lib/reminders';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';

function Section({ title }: { title: string }) {
  return (
    <Text accessibilityRole="header" style={[s.meta, { marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.6 }]}>
      {title}
    </Text>
  );
}

/** Opened from the gear on Profile. Training setup, account and security, and deleting data. */
export default function Settings() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    accountEmail().then(setEmail);
  }, []);

  return (
    <Screen>
      <Title>Settings</Title>
      <Section title="Training" />
      <ScheduleCard />
      <Section title="Profile" />
      <NameCard />
      <Section title="Account & security" />
      {email === undefined ? null : email ? <SignedIn email={email} /> : <SaveProgress onSaved={setEmail} />}
      <DeleteData />
    </Screen>
  );
}

function NameCard() {
  const { draft, update } = useProfile();
  const [name, setName] = useState(draft.displayName ?? '');
  const [busy, setBusy] = useState(false);
  const changed = name.trim() !== (draft.displayName ?? '') && name.trim().length > 0;
  const save = async () => {
    setBusy(true);
    try {
      await setDisplayName(name);
      update({ displayName: name.trim() });
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={[s.card, { padding: 16, gap: 10 }]}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink }}>Your name</Text>
      <Body style={{ fontSize: 14, color: colors.muted }}>Capy and your buddy see this.</Body>
      <Field value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" maxLength={30} />
      {changed ? <Button label={busy ? 'Saving…' : 'Save name'} disabled={busy} onPress={save} /> : null}
    </View>
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
    <View style={[s.card, { padding: 16, gap: 10 }]}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink }}>Save your progress</Text>
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
    </View>
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
    <View style={[s.card, { padding: 16, gap: 10 }]}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink }}>Email</Text>
      <Body>{email}</Body>
      <Body style={{ fontSize: 14, color: colors.muted }}>Your progress is saved. On a new phone, choose "I already have an account".</Body>
      <Button variant="ghost" label="Sign out" onPress={out} />
    </View>
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
  return <Button variant="ghost" label={busy ? 'Deleting…' : 'Delete my data'} disabled={busy} onPress={confirm} />;
}
