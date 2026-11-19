import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { CapyFigure, type Mood } from '@/components/capy';
import { Enter } from '@/components/motion';
import { Screen, StepHeader } from '@/components/ui';
import { colors, motion, space, type } from '@/theme';

/**
 * One onboarding question (ritual7 pattern): progress up top, a centered question, Capy reacting
 * to the answer, the controls, and one pinned CTA.
 */
export function Step({ step, total = 4, title, subtitle, capy, onBack, footer, children }: { step: number; total?: number; title: string; subtitle?: string; capy?: { mood: Mood; hopKey?: unknown; size?: number } | ReactNode; onBack: () => void; footer: ReactNode; children: ReactNode }) {
  const art = capy && typeof capy === 'object' && 'mood' in capy ? <CapyFigure size={capy.size ?? 132} mood={capy.mood} hopKey={capy.hopKey} /> : capy;
  return (
    <Screen footer={footer}>
      <StepHeader step={step} total={total} onBack={onBack} />
      <Enter index={0} style={{ alignItems: 'center', gap: space.s, marginTop: space.l }}>
        <Text accessibilityRole="header" style={[type.title, styles.center]}>
          {title}
        </Text>
        {subtitle ? <Text style={[type.body, styles.center]}>{subtitle}</Text> : null}
      </Enter>
      {art ? (
        <Enter index={1} style={{ alignItems: 'center', marginVertical: space.s }}>
          {art}
        </Enter>
      ) : null}
      <Enter index={2} style={{ gap: space.m }}>
        {children}
      </Enter>
    </Screen>
  );
}

const RING = 210;
const DOT = 18;

/** Capy inside a ring of seven days; a dot fills (and pops) for each day picked. The illustration is the answer. */
export function DayRing({ selected }: { selected: number[] }) {
  const r = RING / 2 - DOT;
  return (
    <View style={{ width: RING, height: RING, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={`${selected.length} days picked`}>
      {Array.from({ length: 7 }, (_, d) => {
        const a = (d / 7) * 2 * Math.PI - Math.PI / 2;
        const on = selected.includes(d);
        return (
          <Animated.View
            key={`${d}-${on}`}
            entering={on ? ZoomIn.springify().damping(motion.playful.damping) : undefined}
            style={[styles.dot, { left: RING / 2 + r * Math.cos(a) - DOT / 2, top: RING / 2 + r * Math.sin(a) - DOT / 2 }, on ? { backgroundColor: colors.yuzu } : { borderWidth: 2, borderColor: colors.line }]}
          />
        );
      })}
      <CapyFigure size={128} mood={selected.length >= 2 ? 'cheer' : 'hello'} hopKey={selected.length} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  dot: { position: 'absolute', width: DOT, height: DOT, borderRadius: DOT / 2 },
});
