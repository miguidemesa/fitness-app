import { useCallback, useEffect, useState } from 'react';
import { Alert, Share, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Body, Button, CoachBubble, Screen, Title, s } from '@/components/ui';
import { acceptInvite, buddyStatus, confirmEmail, createInvite, isAnonymous, linkEmail, removeBuddy, setDisplayName, type BuddyState } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';

function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      autoCapitalize="none"
      style={[s.option, { fontFamily: fonts.bold, fontSize: 17, color: colors.ink, minHeight: 52 }]}
      {...props}
    />
  );
}
const fail = (e: unknown) => Alert.alert('That did not work', e instanceof Error ? e.message : 'Check your connection and try again.');

/** One accountability buddy: shared streak, and nothing else about each other. */
export default function Buddy() {
  const { draft, update } = useProfile();
  const [status, setStatus] = useState<BuddyState | null>(null);
  const [name, setName] = useState(draft.displayName ?? '');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => buddyStatus().then(setStatus).catch(() => setStatus({ state: 'none' })), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Runs an action with the buttons locked, then reloads the buddy state.
  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await refresh();
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  };
  const saveName = async () => {
    if (!name.trim()) throw new Error('Add your first name so your buddy knows it is you.');
    await setDisplayName(name);
    update({ displayName: name.trim() });
  };

  if (!status) {
    return (
      <Screen>
        <Title>Buddy</Title>
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>Buddy</Title>
      {status.state === 'paired' ? (
        <>
          <CoachBubble mood="cheer">
            {status.streak
              ? `You and ${status.name} are on a ${status.streak}-workout streak.`
              : `You and ${status.name} start fresh. The streak builds when you both do your planned days.`}
          </CoachBubble>
          <View style={[s.card, { padding: 16, gap: 4 }]}>
            <Text style={{ fontFamily: fonts.display, fontSize: 28, color: colors.ink }}>{status.name}</Text>
            <Body>
              {status.lastWorkoutOn
                ? `Last workout: ${new Date(`${status.lastWorkoutOn}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`
                : 'No workouts yet'}
            </Body>
            <Text style={s.meta}>
              🔥 {status.streak} in a row. Each of you follows your own days. It breaks only if someone misses their own day.
            </Text>
          </View>
          <Body>{status.name} sees only your name, your streak and your last workout day. Never your health answers or pain.</Body>
          <Button
            variant="ghost"
            label="Remove buddy"
            disabled={busy}
            onPress={() =>
              Alert.alert('Remove buddy?', `${status.name} won't be told. You can pair with someone new any time.`, [
                { text: 'Keep', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => run(removeBuddy) },
              ])
            }
          />
        </>
      ) : (
        <>
          <CoachBubble>Train with a friend. You each follow your own days, and the streak grows when you both do yours.</CoachBubble>
          <Body style={{ fontFamily: fonts.bold, color: colors.ink }}>Your first name</Body>
          <Field value={name} onChangeText={setName} placeholder="First name" autoCapitalize="words" maxLength={30} />
          {status.state === 'invited' ? (
            <View style={[s.card, { padding: 16, gap: 8, alignItems: 'center' }]}>
              <Text style={s.meta}>Your invite code</Text>
              <Text selectable style={{ fontFamily: fonts.display, fontSize: 40, letterSpacing: 4, color: colors.ink }}>
                {status.code}
              </Text>
              <Button
                label="Send to a friend"
                disabled={busy}
                onPress={() =>
                  run(async () => {
                    await saveName();
                    await Share.share({ message: `Train with me on Capy! Open the Buddy tab and enter this code: ${status.code}` });
                  })
                }
              />
              <Button variant="ghost" label="Cancel invite" disabled={busy} onPress={() => run(removeBuddy)} />
            </View>
          ) : (
            <Button
              label="Invite a buddy"
              disabled={busy}
              onPress={() =>
                run(async () => {
                  await saveName();
                  await createInvite();
                })
              }
            />
          )}
          <Body style={{ fontFamily: fonts.bold, color: colors.ink, marginTop: 8 }}>Got a code from a friend?</Body>
          <Field value={code} onChangeText={(t) => setCode(t.toUpperCase())} placeholder="8-letter code" autoCapitalize="characters" maxLength={8} />
          <Button
            variant="ghost"
            label="Join"
            disabled={busy || code.trim().length < 8}
            onPress={() =>
              run(async () => {
                await saveName();
                await acceptInvite(code);
                setCode('');
              })
            }
          />
        </>
      )}
      <Account />
    </Screen>
  );
}

/** Turns the anonymous account into an email one, so progress survives a new phone. */
function Account() {
  const [anon, setAnon] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    isAnonymous().then(setAnon);
  }, []);

  if (anon === null) return null;
  if (!anon) return <Body style={s.hint}>Your progress is saved to your email.</Body>;

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
    <View style={[s.card, { padding: 16, gap: 10, marginTop: 8 }]}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink }}>Save your progress</Text>
      <Body>Add your email so a new phone doesn't mean starting over. No password.</Body>
      <Field value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoComplete="email" editable={!sent} />
      {sent ? (
        <>
          <Field value={token} onChangeText={setToken} placeholder="Code from the email" keyboardType="number-pad" maxLength={8} />
          <Button
            label="Confirm"
            disabled={busy || token.trim().length < 6}
            onPress={() =>
              go(async () => {
                await confirmEmail(email, token);
                setAnon(false);
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
