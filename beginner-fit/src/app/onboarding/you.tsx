import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { Body, Button, CoachBubble, Field, Screen, Title } from '@/components/ui';
import { confirmEmail, linkEmail, setDisplayName } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';

/** Last onboarding step: a name (required, buddies see it) and an email (optional, keeps progress safe). */
export default function You() {
  const { draft, update } = useProfile();
  const [name, setName] = useState(draft.displayName ?? '');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Runs one step with the buttons locked; shows `message` if it fails. Returns whether it worked. */
  const run = async (fn: () => Promise<void>, message: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      return true;
    } catch {
      setError(message);
      return false;
    } finally {
      setBusy(false);
    }
  };
  const finish = () =>
    run(async () => {
      await setDisplayName(name);
      update({ displayName: name.trim() });
      router.replace('/today');
    }, "Couldn't save your name. Check your connection and try again.");
  const confirm = async () => {
    if (await run(() => confirmEmail(email, token), "That code didn't work. Check it and try again.")) await finish();
  };
  const send = () =>
    run(async () => {
      await linkEmail(email);
      setSent(true);
    }, "Couldn't send the code. Check the email and try again.");

  const named = name.trim().length > 0;
  const wantsEmail = email.includes('@');

  return (
    <Screen
      footer={
        <>
          {error ? (
            <Text accessibilityRole="alert" style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.pain, textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}
          {sent ? (
            <Button label={busy ? 'Saving…' : 'Confirm and finish'} disabled={busy || !named || token.trim().length < 6} onPress={confirm} />
          ) : wantsEmail ? (
            <Button label={busy ? 'Sending…' : 'Send me a code'} disabled={busy || !named} onPress={send} />
          ) : (
            <Button label={busy ? 'Saving…' : 'Finish'} disabled={busy || !named} onPress={finish} />
          )}
          {wantsEmail || sent ? <Button variant="ghost" label="Skip email for now" disabled={busy || !named} onPress={finish} /> : null}
        </>
      }
    >
      <Title>Almost done</Title>
      <CoachBubble>Your plan is ready! What should I call you?</CoachBubble>
      <Field value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" autoComplete="given-name" maxLength={30} />
      <Body style={{ fontFamily: fonts.bold, color: colors.ink, marginTop: 8 }}>Email (optional)</Body>
      <Body>Keeps your progress safe if you change phones. No password: we'll email you a code.</Body>
      <Field value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" editable={!sent} />
      {sent ? <Field value={token} onChangeText={setToken} placeholder="Code from the email" keyboardType="number-pad" autoComplete="one-time-code" maxLength={8} /> : null}
      <Body style={{ fontSize: 14, color: colors.muted }}>Your buddy sees only your name, never your health answers or pain.</Body>
    </Screen>
  );
}
