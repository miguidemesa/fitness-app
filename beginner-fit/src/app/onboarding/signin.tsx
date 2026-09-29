import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';
import { Body, Button, Field, Screen, Title } from '@/components/ui';
import { sendSignInCode, verifySignInCode } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';

/** Sign in on a new phone with the email saved earlier. No password: a code arrives by email. */
export default function SignIn() {
  const { reload } = useProfile();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      await sendSignInCode(email);
      setSent(true);
    } catch (e) {
      // Supabase says "Signups not allowed for otp" when no account has this email.
      setError(e instanceof Error && /signup/i.test(e.message) ? 'No Capy account uses that email. Check the spelling, or start fresh.' : "Couldn't send the code. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await verifySignInCode(email, token);
      // An account that never finished onboarding picks up where it left off.
      router.replace((await reload()) ? '/today' : '/onboarding/goal');
    } catch {
      setError("That code didn't work. Check it, or send a new one.");
      setBusy(false);
    }
  };

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
            <>
              <Button label={busy ? 'Signing in…' : 'Sign in'} disabled={busy || token.trim().length < 6} onPress={confirm} />
              <Button variant="ghost" label="Send a new code" disabled={busy} onPress={send} />
            </>
          ) : (
            <Button label={busy ? 'Sending…' : 'Send me a code'} disabled={busy || !email.includes('@')} onPress={send} />
          )}
          <Button variant="ghost" label="Back" onPress={() => router.back()} />
        </>
      }
    >
      <Title>Welcome back</Title>
      <Body>Enter the email you saved your progress with. We'll send you a code, no password needed.</Body>
      <Field value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" editable={!sent} />
      {sent ? (
        <>
          <Body>Check your inbox for a code from Capy.</Body>
          <Field value={token} onChangeText={setToken} placeholder="Code from the email" keyboardType="number-pad" autoComplete="one-time-code" maxLength={8} />
        </>
      ) : null}
    </Screen>
  );
}
