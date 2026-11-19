import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { CapyFigure } from '@/components/capy';
import { Enter } from '@/components/motion';
import { Body, Button, ErrorText, Field, Screen, Tag } from '@/components/ui';
import { confirmEmail, linkEmail, setDisplayName } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts, space, type } from '@/theme';

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
      router.replace('/home');
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
          <ErrorText>{error}</ErrorText>
          {sent ? (
            <Button label={busy ? 'Saving…' : 'Confirm and finish'} disabled={busy || !named || token.trim().length < 6} onPress={confirm} />
          ) : wantsEmail ? (
            <Button label={busy ? 'Sending…' : 'Send me a code'} disabled={busy || !named} onPress={send} />
          ) : (
            <Button label={busy ? 'Saving…' : 'Finish'} disabled={busy || !named} onPress={finish} />
          )}
          {wantsEmail || sent ? <Button variant="text" label="Skip email for now" disabled={busy || !named} onPress={finish} /> : null}
        </>
      }
    >
      <Enter index={0} style={{ alignItems: 'center', gap: space.s, marginTop: space.xl }}>
        <CapyFigure size={120} mood="cheer" hopKey={named} />
        <Tag>Your plan is ready</Tag>
        <Text accessibilityRole="header" style={[type.title, { textAlign: 'center' }]}>
          What should Capy call you?
        </Text>
      </Enter>
      <Enter index={1}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.line}
          autoCapitalize="words"
          autoComplete="given-name"
          maxLength={30}
          autoFocus
          accessibilityLabel="Your name"
          style={styles.name}
        />
      </Enter>
      <Enter index={2} style={{ gap: space.s, marginTop: space.l }}>
        <Text style={type.label}>Email (optional)</Text>
        <Body style={{ fontSize: 15 }}>Keeps your progress safe if you change phones. No password: Capy emails you a code.</Body>
        <Field value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" editable={!sent} />
        {sent ? <Field value={token} onChangeText={setToken} placeholder="Code from the email" keyboardType="number-pad" autoComplete="one-time-code" maxLength={8} /> : null}
        <Text style={type.caption}>Your buddy sees only your name, never your health answers or pain.</Text>
      </Enter>
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontFamily: fonts.display, fontSize: 40, letterSpacing: -0.8, color: colors.ink, textAlign: 'center', paddingVertical: space.m, borderBottomWidth: 2, borderBottomColor: colors.ink },
});
