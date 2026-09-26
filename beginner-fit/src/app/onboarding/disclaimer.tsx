import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Body, Button, Screen, Title, s } from '@/components/ui';
import { saveProfile } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { isHighRisk } from '@/utils/screening';

export default function Disclaimer() {
  const { draft, update } = useProfile();
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safety net: never reach the plan with a high-risk or skipped health answer.
  if (isHighRisk(draft.answers)) return <Redirect href="/onboarding/blocked" />;

  const build = async () => {
    const accepted = { ...draft, disclaimerAcceptedAt: new Date().toISOString() };
    setSaving(true);
    setError(null);
    try {
      await saveProfile(accepted);
      update({ disclaimerAcceptedAt: accepted.disclaimerAcceptedAt });
      router.replace('/today');
    } catch {
      setError("Couldn't save your answers. Check your internet connection and try again.");
    } finally {
      setSaving(false);
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
          <Button label={saving ? 'Saving…' : error ? 'Try again' : 'Build my plan'} disabled={!agreed || saving} onPress={build} />
        </>
      }
    >
      <Title>One last thing</Title>
      <View style={[s.card, { padding: 20, gap: 14 }]}>
        <Body>Capy gives general exercise guidance. It isn't medical advice.</Body>
        <Body>If a move hurts, stop and tell Capy when you log it. Capy will never make a painful move harder.</Body>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          onPress={() => setAgreed(!agreed)}
          style={{ flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.ground, borderRadius: 12, padding: 14, minHeight: 56 }}
        >
          <View style={[s.mark, { borderRadius: 7 }, agreed && s.markOn]}>
            {agreed ? (
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M5 12.5l4.5 4.5L19 7.5" />
              </Svg>
            ) : null}
          </View>
          <Text style={{ flex: 1, fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.ink }}>I understand, and I'll stop if something hurts.</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
