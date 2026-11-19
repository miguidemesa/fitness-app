import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExerciseLoop, prefetchDemos } from '@/components/exercise-loop';
import { CircleButton } from '@/components/glass';
import { setWorkoutFocused } from '@/components/notify';
import { Icon } from '@/components/icon';
import { groupSessions } from '@/components/session';
import { ErrorText } from '@/components/ui';
import { Complete, type Summary } from '@/components/workout/complete';
import { RestRing } from '@/components/workout/rest-ring';
import { FeelPanel, RestPanel, SetPanel, answered } from '@/components/workout/set-sheet';
import { choose } from '@/lib/choose';
import { haptic } from '@/lib/haptics';
import { fetchAlternatives, saveLogs, saveSession } from '@/lib/supabase';
import { clock, useNow } from '@/lib/time';
import { useProfile } from '@/state/profile';
import { fromKg, useWorkout, usesWeight, type ActiveMove, type ActiveWorkout } from '@/state/workout';
import { colors, motion, radius, space, type } from '@/theme';
import { completedFromSets, newBests, sessionFocus, setStats, type SetLog } from '@/utils/session';
import { AREA_LABEL } from '@/utils/types';

const REST_SET_S = 45;
const REST_MOVE_S = 60;
const EXTRA_REST_S = 15;
const TICK_FROM_S = 3;

const withMove = (w: ActiveWorkout, patch: Partial<ActiveMove>): ActiveWorkout => ({ ...w, moves: w.moves.map((m, i) => (i === w.index ? { ...m, ...patch } : m)) });
const resting = (w: ActiveWorkout, s: number) => ({ restEndsAt: Date.now() + s * 1000, restTotal: s * 1000 });

/** The active workout: one move at a time, sets logged in a big bottom sheet, rest in place. Survives leaving the app. */
export default function Workout() {
  useKeepAwake();
  useFocusEffect(
    useCallback(() => {
      setWorkoutFocused(true);
      return () => setWorkoutFocused(false);
    }, []),
  );
  const { plan, exercises, logs, draft, addLogs, addSession, addExercises } = useProfile();
  const { active, update, clear, history, units } = useWorkout();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const now = useNow(250);
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  const restLeftS = active?.restEndsAt ? Math.ceil((active.restEndsAt - now) / 1000) : 0;
  useEffect(() => {
    if (!active?.restEndsAt) return;
    if (restLeftS > 0 && restLeftS <= TICK_FROM_S) haptic('tick');
    if (restLeftS <= 0) {
      haptic('tap');
      update((w) => ({ ...w, restEndsAt: null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fires once per second of countdown
  }, [restLeftS]);

  const nextImages = active ? exercises[active.moves[active.index + 1]?.exerciseId]?.images : undefined;
  useEffect(() => prefetchDemos(nextImages ?? []), [nextImages]);

  const done = () => (router.canGoBack() ? router.back() : router.replace('/home'));
  if (summary) return <Complete summary={summary} units={units} onDone={done} />;
  if (!active || !plan) return <Redirect href="/home" />;

  const move = active.moves[active.index];
  const ex = exercises[move.exerciseId];
  const name = ex?.name ?? move.exerciseId.replaceAll('_', ' ');
  const last = active.index === active.moves.length - 1;
  const isResting = !!active.restEndsAt && active.restEndsAt > now;
  const phase = isResting ? 'rest' : move.skipped || move.sets.every((s) => s.done) ? 'feel' : 'sets';
  const media = Math.min(280, Math.max(160, height * 0.3));

  const logSet = () => {
    haptic('setDone');
    update((w) => {
      const m = w.moves[w.index];
      const k = m.sets.findIndex((s) => !s.done);
      // The values you just did carry over to the sets still to come.
      const sets = m.sets.map((s, i) => (i === k ? { ...s, done: true } : i > k && !s.done ? { ...s, reps: m.sets[k].reps, weightKg: m.sets[k].weightKg } : s));
      const more = sets.some((s) => !s.done);
      return { ...withMove(w, { sets }), ...(more ? resting(w, REST_SET_S) : { restEndsAt: null }) };
    });
  };
  const changeSet = (k: number, patch: Partial<SetLog>) => update((w) => withMove(w, { sets: w.moves[w.index].sets.map((s, i) => (i === k ? { ...s, ...patch } : s)) }));
  const undoSet = (k: number) => update((w) => withMove(w, { sets: w.moves[w.index].sets.map((s, i) => (i === k ? { ...s, done: false } : s)), difficulty: undefined }));
  const nextMove = () => (last ? finish() : update((w) => ({ ...w, index: w.index + 1, ...resting(w, REST_MOVE_S) })));

  const finish = async () => {
    setSaving(true);
    setError(null);
    // Ending early: unanswered moves keep the sets actually done, with a neutral feel and no pain reported.
    const moves = active.moves.map((m) => (answered(m) ? m : { ...m, difficulty: m.difficulty ?? 2, pain: m.pain ?? false, painArea: m.pain ? m.painArea : undefined }));
    try {
      const rows = await saveLogs(
        moves.map((m) => {
          const completed = m.skipped ? 'skip' : completedFromSets(m.sets);
          return { planId: active.planId, day: active.day, exerciseId: m.exerciseId, completed, difficulty: completed === 'skip' ? null : (m.difficulty ?? 2), pain: !!m.pain, painArea: m.pain ? (m.painArea ?? null) : null, sets: m.sets };
        }),
      );
      const seconds = Math.round((Date.now() - active.startedAt) / 1000);
      // The logs are what matter; if the duration can't be saved, the workout still counts.
      const session = await saveSession(active.planId, active.day, seconds).catch(() => null);
      const doneMoves = moves.filter((m) => !m.skipped && m.sets.some((s) => s.done));
      const before = groupSessions(logs).length;
      setSummary({
        planId: active.planId,
        title: sessionFocus(moves.flatMap((m) => exercises[m.exerciseId]?.primaryMuscles ?? [])),
        day: active.day,
        seconds,
        ...setStats(doneMoves.map((m) => m.sets)),
        movesDone: doneMoves.length,
        moves: moves.length,
        bests: newBests(doneMoves, history.sets).map((b) => ({ name: exercises[b.exerciseId]?.name ?? b.exerciseId, text: b.kind === 'weight' ? `${fromKg(b.value, units)} ${units}` : `${b.value} reps` })),
        workouts: { before, after: before + 1 },
        pain: [...new Set(moves.flatMap((m) => (m.pain && m.painArea ? [AREA_LABEL[m.painArea].toLowerCase()] : [])))],
      });
      if (session) addSession(session);
      addLogs(rows);
      clear();
    } catch {
      setError("Couldn't save your workout. Check your connection and try again. Nothing is lost.");
    } finally {
      setSaving(false);
    }
  };

  const swap = async () => {
    if (!ex) return;
    try {
      const options = await fetchAlternatives(ex, draft, active.moves.map((m) => m.exerciseId));
      if (!options.length) return Alert.alert('No safe swap for this one', 'Every similar move loads an area you asked Capy to protect, or needs equipment you don’t have.');
      choose(
        'Swap for a move that works the same muscles',
        options.map((a) => ({
          label: a.name,
          onPress: () => {
            addExercises({ [a.id]: a });
            update((w) => withMove(w, { exerciseId: a.id, sets: w.moves[w.index].sets.map((s) => ({ ...s, done: false, weightKg: usesWeight(a.equipment) ? s.weightKg : null })) }));
          },
        })),
      );
    } catch {
      Alert.alert("Couldn't load swaps", 'Check your connection and try again.');
    }
  };

  const moreMenu = () =>
    choose(name, [
      { label: 'How to do it', onPress: () => router.push({ pathname: '/exercise/[id]', params: { id: move.exerciseId } }) },
      ...(phase === 'sets' && !move.sets.some((s) => s.done) ? [{ label: 'Swap move', onPress: swap }] : []),
      ...(phase === 'sets' ? [{ label: 'Skip move', onPress: () => update((w) => withMove(w, { skipped: true })) }] : []),
    ]);

  const closeMenu = () =>
    choose('Leave this workout?', [
      { label: 'Minimize, keep my progress', onPress: done },
      { label: 'End and save', onPress: finish },
      {
        label: 'Discard workout',
        destructive: true,
        onPress: () =>
          Alert.alert('Discard this workout?', "Nothing from today's session will be saved.", [
            { text: 'Keep it', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => (clear(), done()) },
          ]),
      },
    ]);

  const upNext = phase !== 'rest' ? '' : move.sets.some((s) => s.done) ? `Set ${move.sets.findIndex((s) => !s.done) + 1} of ${move.sets.length}` : `${name} · ${move.sets.length} × ${move.sets[0].reps}`;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <View style={[styles.top, { paddingTop: insets.top + space.s }]}>
        <View style={styles.bar}>
          <CircleButton icon="close" label="Leave workout" tone="glass" onPress={closeMenu} />
          <View style={styles.segments} accessibilityLabel={`Move ${active.index + 1} of ${active.moves.length}`}>
            {active.moves.map((m, i) => (
              <View key={i} style={[styles.segment, { backgroundColor: i < active.index || (i === active.index && answered(m)) ? colors.yuzu : i === active.index ? colors.onNight : colors.nightSoft }]} />
            ))}
          </View>
          <View style={styles.elapsed} accessibilityLabel={`Workout time ${clock((now - active.startedAt) / 1000)}`}>
            <Icon name="timer" size={14} color={colors.onNight} />
            <Text style={[type.label, { color: colors.onNight, fontSize: 15, fontVariant: ['tabular-nums'] }]}>{clock((now - active.startedAt) / 1000)}</Text>
          </View>
        </View>

        <Animated.View key={active.index} entering={SlideInRight.duration(motion.base)} exiting={SlideOutLeft.duration(180)} style={styles.titleRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text accessibilityRole="header" numberOfLines={2} style={[type.title, { color: colors.onNight }]}>
              {name}
            </Text>
            <Text style={[type.caption, { color: colors.onNightMuted }]}>
              Move {active.index + 1} of {active.moves.length}
              {ex?.primaryMuscles.length ? ` · ${ex.primaryMuscles.map((m) => m[0].toUpperCase() + m.slice(1)).join(', ')}` : ''}
              {move.skipped ? ' · skipped' : ''}
            </Text>
          </View>
          <CircleButton icon="more" label="Move options" tone="glass" onPress={moreMenu} />
        </Animated.View>

        <View style={styles.media}>
          {isResting ? (
            <RestRing size={media + 24} endsAt={active.restEndsAt!} total={active.restTotal} now={now} />
          ) : (
            <ExerciseLoop key={move.exerciseId} images={ex?.images ?? []} name={name} style={{ width: media, height: media, borderRadius: media / 2 }} />
          )}
        </View>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + space.m }]}>
        <ErrorText>{error}</ErrorText>
        {phase === 'rest' ? (
          <RestPanel
            next={upNext}
            onAdd={() => update((w) => ({ ...w, restEndsAt: (w.restEndsAt ?? Date.now()) + EXTRA_REST_S * 1000, restTotal: w.restTotal + EXTRA_REST_S * 1000 }))}
            onSkip={() => update((w) => ({ ...w, restEndsAt: null }))}
          />
        ) : phase === 'feel' ? (
          <FeelPanel move={move} last={last} onAnswer={(patch) => update((w) => withMove(w, patch))} onContinue={saving ? () => {} : nextMove} />
        ) : (
          <SetPanel move={move} weighted={usesWeight(ex?.equipment)} units={units} onChange={changeSet} onLog={logSet} onUndo={undoSet} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.night },
  top: { flex: 1, paddingHorizontal: space.gutter, gap: space.l },
  bar: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  segments: { flex: 1, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  elapsed: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: space.m, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.14)' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.m },
  media: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sheet: { backgroundColor: colors.paper, borderTopLeftRadius: radius.sheet, borderTopRightRadius: radius.sheet, borderCurve: 'continuous', paddingHorizontal: space.gutter, paddingTop: space.xl, gap: space.m },
});
