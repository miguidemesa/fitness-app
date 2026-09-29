import * as Linking from 'expo-linking';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Share, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Body, Button, CoachBubble, Field, Screen, Title, fail, s } from '@/components/ui';
import { acceptInvite, buddyStatus, createInvite, removeBuddy, setDisplayName, setTogether, type BuddyState } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';

/** Opens this screen with the code filled in. capy://buddy?code=… in a store build; an exp:// link in Expo Go. */
const inviteLink = (code: string) => Linking.createURL('buddy', { queryParams: { code } });

/** One accountability buddy: shared streak, and nothing else about each other. Opened from Profile or an invite link. */
export default function Buddy() {
  const { ready, draft, update } = useProfile();
  const params = useLocalSearchParams<{ code?: string }>();
  const [status, setStatus] = useState<BuddyState | null>(null);
  const [name, setName] = useState(draft.displayName ?? '');
  const [code, setCode] = useState((params.code ?? '').toUpperCase().slice(0, 8));
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

  if (!ready) return null;
  // Scanned an invite before setting up? Onboarding first. ponytail: the code is dropped; scan again after.
  if (!draft.disclaimerAcceptedAt) return <Redirect href="/onboarding" />;
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
          <View style={[s.card, { padding: 16, gap: 8 }]}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 16, color: colors.ink }}>Train together</Text>
            <Body>
              {status.together === 'on'
                ? `On. Your next plan uses moves that are safe and doable for both you and ${status.name}. If one of you feels pain, only that person's copy changes.`
                : status.together === 'waiting'
                  ? `Waiting for ${status.name} to turn it on too.`
                  : 'Follow the same plan. Moves are chosen around both your equipment and both your protected areas, so some moves may be left out for you.'}
            </Body>
            <Button
              variant={status.iAgreed ? 'ghost' : 'primary'}
              label={status.iAgreed ? 'Turn off' : 'Turn on'}
              disabled={busy}
              onPress={() => run(() => setTogether(!status.iAgreed))}
            />
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
          {draft.displayName ? null : (
            <>
              <Body style={{ fontFamily: fonts.bold, color: colors.ink }}>Your first name</Body>
              <Field value={name} onChangeText={setName} placeholder="First name" autoCapitalize="words" maxLength={30} />
            </>
          )}
          {status.state === 'invited' ? (
            <View style={[s.card, { padding: 16, gap: 10, alignItems: 'center' }]}>
              <Text style={s.meta}>Let your friend scan this with their phone camera</Text>
              <View accessible accessibilityLabel={`QR code for invite ${status.code}`} style={{ padding: 12, backgroundColor: '#FFFFFF', borderRadius: 16 }}>
                <QRCode value={inviteLink(status.code)} size={200} color={colors.ink} backgroundColor="#FFFFFF" />
              </View>
              <Text style={s.meta}>Or they can type your code</Text>
              <Text selectable style={{ fontFamily: fonts.display, fontSize: 40, letterSpacing: 4, color: colors.ink }}>
                {status.code}
              </Text>
              <Button
                label="Send to a friend"
                disabled={busy}
                onPress={() =>
                  run(async () => {
                    await saveName();
                    await Share.share({ message: `Train with me on Capy! Tap to join: ${inviteLink(status.code)}\nOr open Buddy in Capy and enter: ${status.code}` });
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
            variant={params.code ? 'primary' : 'ghost'}
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
    </Screen>
  );
}
