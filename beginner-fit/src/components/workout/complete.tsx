import { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import { CapyFigure } from '@/components/capy';
import { CountUp, Enter } from '@/components/motion';
import { useNotify } from '@/components/notify';
import { Button, CoachLine, Screen, Tag } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { saveSessionNote } from '@/lib/supabase';
import { fromKg, type Units } from '@/state/workout';
import { colors, fonts, motion, radius, space, type } from '@/theme';
import { stageFor } from '@/utils/progress';

export type Summary = {
  planId: string;
  title: string;
  day: number;
  seconds: number;
  sets: number;
  reps: number;
  volumeKg: number;
  movesDone: number;
  moves: number;
  bests: { name: string; text: string }[];
  /** Workouts logged before and after this one: drives Capy's growth. */
  workouts: { before: number; after: number };
  pain: string[];
};

const article = (word: string) => (/^[aeiou]/i.test(word) ? 'an' : 'a');

/** Session complete: one big number, an editorial row of facts, new bests, and Capy growing. No confetti. */
export function Complete({ summary, units, onDone }: { summary: Summary; units: Units; onDone: () => void }) {
  const { stage, next } = stageFor(summary.workouts.after);
  const stagedUp = stageFor(summary.workouts.before).stage.name !== stage.name;
  const toNext = next ? (summary.workouts.after - stage.at) / (next.at - stage.at) : 1;
  const minutes = Math.max(1, Math.round(summary.seconds / 60));
  const [note, setNote] = useState('');
  const notify = useNotify();

  const done = () => {
    const text = note.trim();
    if (text) saveSessionNote(summary.planId, summary.day, text).catch(() => notify({ title: "Couldn't save your note", message: 'Your workout is saved. Only the note was lost.', mood: 'caring' }));
    onDone();
  };

  const bar = useSharedValue(0);
  useEffect(() => {
    haptic('success');
    bar.value = withDelay(motion.slow, withSpring(toNext, motion.settle));
  }, [bar, toNext]);
  const fill = useAnimatedStyle(() => ({ width: `${bar.value * 100}%` }));

  const share = () =>
    Share.share({ message: `Just finished ${summary.title.toLowerCase()} with Capy: ${minutes} minutes, ${summary.sets} sets.` }).catch(() => {});

  return (
    <Screen
      tone="yuzu"
      footer={
        <View style={{ flexDirection: 'row', gap: space.s }}>
          <Button variant="text" icon="share" label="Share" onPress={share} style={{ flex: 1 }} />
          <Button label="Done" onPress={done} style={{ flex: 2 }} />
        </View>
      }
    >
      <Enter index={0} style={{ gap: space.xs, marginTop: space.xl }}>
        <Tag color={colors.ink}>Session complete</Tag>
        <Text accessibilityRole="header" style={type.display}>
          {summary.title}
        </Text>
        <Text style={[type.body, { color: colors.ink }]}>That's day {summary.day + 1}, done.</Text>
      </Enter>

      <Enter index={1} style={{ marginTop: space.l }}>
        <CountUp value={minutes} style={type.hero} />
        <Text style={[type.heading, { fontFamily: type.body.fontFamily }]}>minutes of movement</Text>
      </Enter>

      <Enter index={2} style={styles.facts}>
        <Fact value={summary.sets} label={summary.sets === 1 ? 'set' : 'sets'} />
        <Fact value={summary.reps} label="reps" />
        {summary.volumeKg ? <Fact value={fromKg(summary.volumeKg, units)} label={`${units} moved`} /> : <Fact value={summary.movesDone} label={`of ${summary.moves} moves`} />}
      </Enter>

      {summary.bests.length ? (
        <Enter index={3} style={styles.card}>
          {summary.bests.map((b) => (
            <View key={b.name} style={{ flexDirection: 'row', alignItems: 'center', gap: space.m }}>
              <Text style={styles.best}>New best</Text>
              <Text style={[type.label, { flex: 1 }]}>
                {b.name} <Text style={{ color: colors.muted }}>· {b.text}</Text>
              </Text>
            </View>
          ))}
        </Enter>
      ) : null}

      <Enter index={4} style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: space.l }]}>
        <CapyFigure size={84} mood="cheer" wave={stagedUp} />
        <View style={{ flex: 1, gap: space.s }}>
          <Text style={type.label}>{stagedUp ? `Capy is now ${article(stage.name)} ${stage.name}.` : `Capy the ${stage.name}`}</Text>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, fill]} />
          </View>
          <Text style={type.caption}>
            {next ? `${next.at - summary.workouts.after} more workout${next.at - summary.workouts.after === 1 ? '' : 's'} until ${next.name}.` : "That's Capy's top stage."}
          </Text>
        </View>
      </Enter>

      {summary.pain.length ? (
        <Enter index={5}>
          <CoachLine mood="caring">
            Thanks for telling me about your {summary.pain.join(' and ')}. Rest it, and I'll swap or lighten that move next week. If the pain doesn't go away, please see a doctor or physio.
          </CoachLine>
        </Enter>
      ) : null}

      <Enter index={5} style={[styles.card, { gap: space.s }]}>
        <Text style={type.label}>A note for future you</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="How did today go? Optional."
          placeholderTextColor={colors.muted}
          multiline
          maxLength={NOTE_MAX}
          accessibilityLabel="A note about this workout, optional"
          style={styles.note}
        />
      </Enter>
    </Screen>
  );
}

const NOTE_MAX = 500;

function Fact({ value, label }: { value: number; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <CountUp value={value} style={type.stat} />
      <Text style={[type.caption, { color: colors.ink }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  facts: { flexDirection: 'row', gap: space.m, borderTopWidth: 1.5, borderTopColor: 'rgba(21,21,26,0.15)', paddingTop: space.l },
  card: { backgroundColor: colors.paper, borderRadius: radius.group, borderCurve: 'continuous', padding: space.l, gap: space.m },
  best: { ...type.tag, color: colors.ink, backgroundColor: colors.yuzu, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, overflow: 'hidden' },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.mist, overflow: 'hidden' },
  note: { fontFamily: fonts.body, fontSize: 16, lineHeight: 22, color: colors.ink, minHeight: 72, textAlignVertical: 'top', padding: 0 },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.yuzu },
});
