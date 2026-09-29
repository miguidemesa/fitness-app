import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { CapyAvatar } from '@/components/capy';
import { Body, Screen, s } from '@/components/ui';
import { buddyStatus, type BuddyState } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, fonts } from '@/theme';
import { stageFor, weeklyStreak } from '@/utils/progress';

function Chevron() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.muted} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M9 5l7 7-7 7" />
    </Svg>
  );
}

/** Who you are: name, Capy's stage, streak, and the way to your buddy. Settings live behind the gear. */
export default function Profile() {
  const { draft, logs } = useProfile();
  const [buddy, setBuddy] = useState<BuddyState | null>(null);
  // Refresh on every visit: the buddy may have paired or worked out since.
  useFocusEffect(
    useCallback(() => {
      buddyStatus().then(setBuddy).catch(() => setBuddy({ state: 'none' }));
    }, []),
  );

  const workouts = new Set(logs.map((l) => `${l.planId}:${l.day}`)).size;
  const streak = weeklyStreak(logs, new Date().toLocaleDateString('en-CA'));
  const { stage } = stageFor(workouts);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => router.push('/settings')} hitSlop={8} style={s.back}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <Circle cx={12} cy={12} r={3} />
          </Svg>
        </Pressable>
      </View>

      <View style={{ alignItems: 'center', gap: 6 }}>
        <CapyAvatar size={112} mood="cheer" />
        <Text accessibilityRole="header" style={{ fontFamily: fonts.display, fontSize: 40, lineHeight: 40, textTransform: 'uppercase', color: colors.ink, marginTop: 6 }}>
          {draft.displayName ?? 'You'}
        </Text>
        <Text style={s.meta}>Training with Capy the {stage.name}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={[s.card, { flex: 1, padding: 14, gap: 2, alignItems: 'center' }]}>
          <Text style={{ fontFamily: fonts.display, fontSize: 36, color: colors.ink }}>{workouts}</Text>
          <Text style={s.meta}>Workouts</Text>
        </View>
        <View style={[s.card, { flex: 1, padding: 14, gap: 2, alignItems: 'center' }]}>
          <Text style={{ fontFamily: fonts.display, fontSize: 36, color: colors.ink }}>🔥 {streak}</Text>
          <Text style={s.meta}>Week streak</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/buddy')}
        style={({ pressed }) => [s.card, { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }, pressed && { opacity: 0.85 }]}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={s.meta}>Buddy</Text>
          <Text style={{ fontFamily: fonts.bold, fontSize: 17, color: colors.ink }}>
            {buddy?.state === 'paired' ? `${buddy.name} · 🔥 ${buddy.streak}` : buddy?.state === 'invited' ? 'Invite waiting' : 'Invite a buddy'}
          </Text>
          <Body style={{ fontSize: 14, color: colors.muted }}>
            {buddy?.state === 'paired' ? 'Your shared streak' : 'Show your QR code or send a link'}
          </Body>
        </View>
        <Chevron />
      </Pressable>
    </Screen>
  );
}
