import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeIn, cancelAnimation, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CapyFigure } from '@/components/capy';
import { Icon } from '@/components/icon';
import { Button, ErrorText } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { generatePlan, saveProfile } from '@/lib/supabase';
import { useProfile } from '@/state/profile';
import { colors, space, type } from '@/theme';
import { isHighRisk } from '@/utils/screening';

const STEPS = ['Choosing your moves', 'Checking them against your answers', 'Pacing your week'];
const STEP_MS = 1100;
const RING = 220;
const DOTS = 24;
const SPIN_MS = 9000;

/** "Almost ready": builds the plan while Capy waits inside a slowly turning ring of dots. */
export default function Building() {
  const { draft, update, setPlan } = useProfile();
  const [shown, setShown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const calm = useReducedMotion();
  const spin = useSharedValue(0);
  const blocked = isHighRisk(draft.answers);

  useEffect(() => {
    if (calm) return;
    spin.value = withRepeat(withTiming(360, { duration: SPIN_MS, easing: Easing.linear }), -1);
    return () => cancelAnimation(spin);
  }, [calm, spin]);
  const ring = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));

  // The checklist ticks along for feel; the last step only completes when the plan is really there.
  useEffect(() => {
    if (shown >= STEPS.length - 1 || error) return;
    const t = setTimeout(() => setShown((n) => n + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [shown, error]);

  useEffect(() => {
    if (blocked) return;
    let live = true;
    (async () => {
      const accepted = { ...draft, disclaimerAcceptedAt: new Date().toISOString() };
      try {
        const saved = await saveProfile(accepted);
        if (saved) await setPlan(await generatePlan());
        if (!live) return;
        update({ disclaimerAcceptedAt: accepted.disclaimerAcceptedAt });
        setShown(STEPS.length);
        haptic('success');
        // Name and email come last: the plan is ready, so they're not a hurdle before it.
        setTimeout(() => router.replace(saved ? '/onboarding/you' : '/home'), STEP_MS / 2);
      } catch {
        if (live) setError("Couldn't build your plan. Check your internet connection and try again.");
      }
    })();
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one build per attempt
  }, [attempt]);

  if (blocked) return <Redirect href="/onboarding/blocked" />;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl }}>
        <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[StyleSheet.absoluteFill, ring]}>
            {Array.from({ length: DOTS }, (_, i) => {
              const a = (i / DOTS) * 2 * Math.PI;
              const s = 4 + (i % 3) * 2;
              return <View key={i} style={[styles.dot, { width: s, height: s, borderRadius: s / 2, left: RING / 2 + (RING / 2 - 8) * Math.cos(a) - s / 2, top: RING / 2 + (RING / 2 - 8) * Math.sin(a) - s / 2, opacity: 0.25 + (i / DOTS) * 0.6 }]} />;
            })}
          </Animated.View>
          <CapyFigure size={130} mood={shown >= STEPS.length ? 'cheer' : 'hello'} band={colors.ink} hopKey={shown >= STEPS.length} />
        </View>
        <View style={{ alignSelf: 'stretch', gap: space.m }}>
          <Text accessibilityRole="header" style={type.display}>
            Almost ready
          </Text>
          <Text style={[type.body, { color: colors.ink }]}>Relax for a moment. Capy is building a week that fits you.</Text>
          <View style={{ gap: space.s, marginTop: space.s }} accessibilityLiveRegion="polite">
            {STEPS.map((label, i) => (
              <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, opacity: i <= shown ? 1 : 0.4 }}>
                <View style={[styles.tick, i < shown && { backgroundColor: colors.ink }]}>
                  {i < shown ? (
                    <Animated.View entering={FadeIn}>
                      <Icon name="check" size={12} color={colors.yuzu} />
                    </Animated.View>
                  ) : null}
                </View>
                <Text style={type.label}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      {error ? (
        <View style={{ gap: space.s }}>
          <ErrorText>{error}</ErrorText>
          <Button
            label="Try again"
            onPress={() => {
              setError(null);
              setShown(0);
              setAttempt((n) => n + 1);
            }}
          />
          <Button variant="text" label="Back" onPress={() => router.back()} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.yuzu, paddingHorizontal: space.gutter, paddingBottom: space.s },
  dot: { position: 'absolute', backgroundColor: colors.ink },
  tick: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});
