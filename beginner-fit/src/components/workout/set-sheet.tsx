import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/motion';
import { AreaChips, Button, Chip } from '@/components/ui';
import { fromKg, toKg, type ActiveMove, type Units } from '@/state/workout';
import { colors, motion, radius, sizes, space, type } from '@/theme';
import type { SetLog } from '@/utils/session';
import type { Difficulty } from '@/utils/types';

/** A move is answered once its sets are settled and the feel/pain check is filled in. */
export const answered = (m: ActiveMove) =>
  m.pain !== undefined && (!m.pain || !!m.painArea) && (m.skipped || (m.sets.every((s) => s.done) && !!m.difficulty));

const REPS = { step: 1, min: 1, max: 100 };
const WEIGHT_STEP: Record<Units, number> = { kg: 1, lb: 5 };
const MAX_WEIGHT = 500;

/** The set you're on: big reps and weight with −/+ (tap the number to type), then one big Log set. */
export function SetPanel({ move, weighted, units, onChange, onLog, onUndo }: { move: ActiveMove; weighted: boolean; units: Units; onChange: (k: number, patch: Partial<SetLog>) => void; onLog: () => void; onUndo: (k: number) => void }) {
  const k = move.sets.findIndex((s) => !s.done);
  const set = move.sets[k];
  return (
    <View style={{ gap: space.m }}>
      <View style={styles.headRow}>
        <Text style={type.heading}>
          Set {k + 1} <Text style={{ color: colors.muted }}>of {move.sets.length}</Text>
        </Text>
        <SetDots sets={move.sets} current={k} onUndo={onUndo} />
      </View>
      <Stepper label="Reps" unit="reps" value={set.reps} {...REPS} onChange={(reps) => onChange(k, { reps })} />
      {weighted ? (
        <Stepper
          label="Weight"
          unit={units}
          value={fromKg(set.weightKg ?? 0, units)}
          step={WEIGHT_STEP[units]}
          min={0}
          max={MAX_WEIGHT}
          precision={0.5}
          onChange={(v) => onChange(k, { weightKg: v ? toKg(v, units) : null })}
        />
      ) : null}
      <Button variant="accent" tall icon="check" label="Log set" onPress={onLog} />
    </View>
  );
}

/** One dot per set: filled when done (tap to undo), ringed when current. */
function SetDots({ sets, current, onUndo }: { sets: SetLog[]; current: number; onUndo: (k: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {sets.map((s, i) =>
        s.done ? (
          <Pressable key={i} accessibilityRole="button" accessibilityLabel={`Set ${i + 1} done. Undo.`} hitSlop={6} onPress={() => onUndo(i)}>
            <Animated.View entering={ZoomIn.springify().damping(motion.playful.damping)} style={[styles.dot, { backgroundColor: colors.yuzu }]}>
              <Icon name="check" size={10} />
            </Animated.View>
          </Pressable>
        ) : (
          <View key={i} accessible={false} style={[styles.dot, { borderWidth: 2, borderColor: i === current ? colors.ink : colors.line }]} />
        ),
      )}
    </View>
  );
}

function Stepper({ label, unit, value, step, min, max, precision = 1, onChange }: { label: string; unit: string; value: number; step: number; min: number; max: number; precision?: number; onChange: (v: number) => void }) {
  // While typing, the field shows what you typed; otherwise it shows the value.
  const [typing, setTyping] = useState<string | null>(null);
  const commit = (v: number) => {
    const next = Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v / precision) * precision)) : value;
    setTyping(null);
    if (next !== value) onChange(next);
  };
  return (
    <View style={styles.stepRow}>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <TextInput
          accessibilityLabel={`${label}, ${value} ${unit}`}
          value={typing ?? String(value)}
          onChangeText={setTyping}
          onEndEditing={() => commit(typing === null ? value : parseFloat(typing))}
          keyboardType={precision < 1 ? 'decimal-pad' : 'number-pad'}
          selectTextOnFocus
          maxLength={5}
          style={[type.stat, { padding: 0, minWidth: 56 }]}
        />
        <Text style={type.caption}>{unit}</Text>
      </View>
      <StepButton icon="minus" label={`Less ${label.toLowerCase()}`} onPress={() => commit(value - step)} />
      <StepButton icon="plus" label={`More ${label.toLowerCase()}`} onPress={() => commit(value + step)} />
    </View>
  );
}

function StepButton({ icon, label, onPress }: { icon: 'minus' | 'plus'; label: string; onPress: () => void }) {
  return (
    <PressableScale accessibilityRole="button" accessibilityLabel={label} scaleTo={motion.scale.circle} feedback="select" onPress={onPress} style={styles.step}>
      <Icon name={icon} size={20} />
    </PressableScale>
  );
}

const FEEL: [Difficulty, string][] = [
  [1, 'Easy'],
  [2, 'About right'],
  [3, 'Too hard'],
];

/** After a move: how it felt (feeds next week's plan) and whether anything hurt (Capy never makes a painful move harder). */
export function FeelPanel({ move, last, onAnswer, onContinue }: { move: ActiveMove; last: boolean; onAnswer: (patch: Partial<ActiveMove>) => void; onContinue: () => void }) {
  return (
    <View style={{ gap: space.m }}>
      {move.skipped ? null : (
        <>
          <Text style={type.heading}>How did that feel?</Text>
          <View accessibilityRole="radiogroup" style={styles.choiceRow}>
            {FEEL.map(([v, label]) => (
              <Chip key={v} label={label} selected={move.difficulty === v} onPress={() => onAnswer({ difficulty: v })} style={styles.choice} />
            ))}
          </View>
        </>
      )}
      <Text style={type.heading}>Anything hurt?</Text>
      <View accessibilityRole="radiogroup" style={styles.choiceRow}>
        <Chip label="No" selected={move.pain === false} onPress={() => onAnswer({ pain: false, painArea: undefined })} style={styles.choice} />
        <Chip label="Yes" selected={move.pain === true} onPress={() => onAnswer({ pain: true })} style={styles.choice} />
      </View>
      {move.pain ? (
        <>
          <Text style={type.caption}>Where? Capy won't make this move harder.</Text>
          <AreaChips selected={move.painArea ? [move.painArea] : []} onPress={(painArea) => onAnswer({ painArea })} />
        </>
      ) : null}
      <Button variant="accent" tall label={last ? 'Finish workout' : 'Next move'} icon={last ? 'check' : 'forward'} disabled={!answered(move)} onPress={onContinue} />
    </View>
  );
}

/** While resting: what's next, a little more time, or skip. */
export function RestPanel({ next, onAdd, onSkip }: { next: string; onAdd: () => void; onSkip: () => void }) {
  return (
    <View style={{ gap: space.m }}>
      <View style={{ gap: 2 }}>
        <Text style={type.tag}>Up next</Text>
        <Text style={type.heading}>{next}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: space.s }}>
        <Button variant="secondary" tall label="+15s" onPress={onAdd} style={{ flex: 1 }} />
        <Button variant="accent" tall icon="skip" label="Skip rest" onPress={onSkip} style={{ flex: 2 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dot: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: space.s },
  step: { width: sizes.stepper, height: sizes.stepper, borderRadius: radius.pill, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  choiceRow: { flexDirection: 'row', gap: space.s },
  choice: { flex: 1, minHeight: sizes.stepper },
});
