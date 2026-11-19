import * as Linking from 'expo-linking';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Share, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Body, Button, Card, CoachLine, Field, Screen, Tag, fail } from '@/components/ui';
import { acceptInvite, buddyStatus, createInvite, removeBuddy, setDisplayName, setTogether, type BuddyState } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, space, type } from '@/theme';

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
        <CoachLine>Checking on your buddy…</CoachLine>
      </Screen>
    );
  }

  return (
    <Screen>
      {status.state === 'paired' ? (
        <>
          <CoachLine mood="cheer">
            {status.streak
              ? `You and ${status.name} are on a ${status.streak}-workout streak.`
              : `You and ${status.name} start fresh. The streak builds when you both do your planned days.`}
          </CoachLine>
          <Card style={{ padding: space.l, gap: space.xs }}>
            <Text style={type.title}>{status.name}</Text>
            <Body>
              {status.lastWorkoutOn
                ? `Last workout: ${new Date(`${status.lastWorkoutOn}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`
                : 'No workouts yet'}
            </Body>
            <Text style={type.caption}>
              {status.streak} in a row. Each of you follows your own days. It breaks only if someone misses their own day.
            </Text>
          </Card>
          <Card style={{ padding: space.l, gap: space.s }}>
            <Text style={type.label}>Train together</Text>
            <Body>
              {status.together === 'on'
                ? `On. Your next plan uses moves that are safe and doable for both you and ${status.name}. If one of you feels pain, only that person's copy changes.`
                : status.together === 'waiting'
                  ? `Waiting for ${status.name} to turn it on too.`
                  : 'Follow the same plan. Moves are chosen around both your equipment and both your protected areas, so some moves may be left out for you.'}
            </Body>
            <Button
              variant={status.iAgreed ? 'secondary' : 'primary'}
              label={status.iAgreed ? 'Turn off' : 'Turn on'}
              disabled={busy}
              onPress={() => run(() => setTogether(!status.iAgreed))}
            />
          </Card>
          <Body>{status.name} sees only your name, your streak and your last workout day. Never your health answers or pain.</Body>
          <Button
            variant="text"
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
          <CoachLine>Train with a friend. You each follow your own days, and the streak grows when you both do yours.</CoachLine>
          {draft.displayName ? null : (
            <>
              <Tag>Your first name</Tag>
              <Field value={name} onChangeText={setName} placeholder="First name" autoCapitalize="words" maxLength={30} />
            </>
          )}
          {status.state === 'invited' ? (
            <Card style={{ padding: space.l, gap: space.m, alignItems: 'center' }}>
              <Text style={type.caption}>Let your friend scan this with their phone camera</Text>
              <View accessible accessibilityLabel={`QR code for invite ${status.code}`} style={{ padding: 12, backgroundColor: '#FFFFFF', borderRadius: 16 }}>
                <QRCode value={inviteLink(status.code)} size={200} color={colors.ink} backgroundColor="#FFFFFF" />
              </View>
              <Text style={type.caption}>Or they can type your code</Text>
              <Text selectable style={[type.display, { letterSpacing: 4 }]}>
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
              <Button variant="text" label="Cancel invite" disabled={busy} onPress={() => run(removeBuddy)} />
            </Card>
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
          <View style={{ marginTop: space.s }}>
            <Tag>Got a code from a friend?</Tag>
          </View>
          <Field value={code} onChangeText={(t) => setCode(t.toUpperCase())} placeholder="8-letter code" autoCapitalize="characters" maxLength={8} />
          <Button
            variant={params.code ? 'primary' : 'secondary'}
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
