import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CapyAvatar } from '@/components/capy';
import { Icon } from '@/components/icon';
import { PressableScale } from '@/components/motion';
import type { ExerciseDetail } from '@/lib/supabase';
import { colors, motion, radius, sizes, space, type } from '@/theme';
import { sessionFocus, type WeekDot } from '@/utils/session';
import type { LogEntry, PlanItem } from '@/utils/types';

/** What a plan day is about, from its moves: a human title, a photo, its muscles. */
export function dayInfo(items: PlanItem[], exercises: Record<string, ExerciseDetail>) {
  const details = items.map((i) => exercises[i.exerciseId]).filter(Boolean);
  const muscles = details.flatMap((e) => e.primaryMuscles);
  return {
    title: sessionFocus(muscles),
    photo: details.find((e) => e.images[0])?.images[0],
    muscles: [...new Set(muscles)],
  };
}

/** One past workout, from its logged moves. */
export function pastSession(moves: LogEntry[], exercises: Record<string, ExerciseDetail>, seconds?: number) {
  const done = moves.filter((m) => m.completed !== 'skip');
  const { title, photo } = dayInfo(moves.map((m) => ({ exerciseId: m.exerciseId, sets: 0, reps: 0 })), exercises);
  const date = new Date(`${moves[0].loggedOn}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  const counts = [1, 2, 3].map((d) => done.filter((m) => m.difficulty === d).length);
  const feel = done.length ? (['easy', 'about right', 'hard'] as const)[counts.indexOf(Math.max(...counts))] : null;
  const pain = [...new Set(moves.flatMap((m) => (m.painArea ? [m.painArea] : [])))];
  return { key: `${moves[0].planId}:${moves[0].day}`, title, photo, date, done: done.length, total: moves.length, minutes: seconds ? Math.round(seconds / 60) : null, feel, pain };
}

/** Logged moves grouped into workouts, newest first. */
export function groupSessions(logs: LogEntry[]): LogEntry[][] {
  // Map.groupBy isn't in every Hermes version, so group by hand.
  const groups = new Map<string, LogEntry[]>();
  for (const l of logs) groups.set(`${l.planId}:${l.day}`, [...(groups.get(`${l.planId}:${l.day}`) ?? []), l]);
  return [...groups.values()].reverse();
}

/** Home's featured card: the session's photo on top, its story and the Start action below. */
export function SessionCard({ kicker, title, subtitle, meta, photo, action, onOpen }: { kicker: string; title: string; subtitle: string; meta: string; photo?: string; action: ReactNode; onOpen: () => void }) {
  return (
    <PressableScale accessibilityRole="button" accessibilityLabel={`${title}. ${meta}. Show details.`} scaleTo={motion.scale.card} onPress={onOpen} style={styles.card}>
      <View style={styles.photo}>{photo ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} /> : null}</View>
      <View style={{ padding: space.xl, gap: space.s }}>
        <Text style={type.tag}>{kicker}</Text>
        <Text style={type.display}>{title}</Text>
        <Text style={type.body}>{subtitle}</Text>
        <Text style={type.caption}>{meta}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.m, marginTop: space.s }}>
          <View style={{ flex: 1 }}>{action}</View>
          <View style={styles.more} accessible={false}>
            <Icon name="forward" size={18} />
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

/** A tall stadium-shaped photo (social screenshot pattern) with an optional avatar badge. */
export function MomentPill({ photo, label, capy, onPress }: { photo?: string; label: string; capy?: boolean; onPress?: () => void }) {
  return (
    <PressableScale accessibilityRole={onPress ? 'button' : 'image'} accessibilityLabel={label} scaleTo={motion.scale.card} onPress={onPress} style={{ alignItems: 'center', gap: space.s }}>
      <View style={[styles.moment, capy && { backgroundColor: colors.yuzu, alignItems: 'center', justifyContent: 'center' }]}>
        {photo ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
        {capy ? <CapyAvatar size={56} mood="cheer" tint={colors.yuzuSoft} /> : null}
      </View>
      <Text numberOfLines={1} style={[type.caption, { maxWidth: sizes.moment.width }]}>
        {label}
      </Text>
    </PressableScale>
  );
}

/** Mon–Sun circles: planned (ring), done (yuzu with a check), today (ink ring). */
export function WeekStrip({ dots }: { dots: WeekDot[] }) {
  const names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      {dots.map((d, i) => (
        <View key={i} style={{ alignItems: 'center', gap: 6 }} accessible accessibilityLabel={`${names[i]}${d.today ? ', today' : ''}: ${d.done ? 'workout done' : d.scheduled ? 'workout planned' : 'rest day'}`}>
          <View
            style={[
              styles.dot,
              d.scheduled && { borderWidth: 1.5, borderColor: colors.muted },
              d.today && { borderWidth: 2, borderColor: colors.ink },
              d.done && { backgroundColor: colors.yuzu, borderColor: colors.yuzu },
            ]}
          >
            {d.done ? <Icon name="check" size={14} /> : null}
          </View>
          <Text style={[type.caption, d.today && { color: colors.ink }]}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

/** A compact row for a session: small stadium photo, title, one line of facts. */
export function SessionRow({ photo, leading, title, caption, badge, onPress }: { photo?: string; leading?: ReactNode; title: string; caption: string; badge?: ReactNode; onPress?: () => void }) {
  return (
    <PressableScale accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={`${title}. ${caption}`} scaleTo={onPress ? motion.scale.card : 1} onPress={onPress} style={styles.row}>
      {leading ?? <View style={styles.thumb}>{photo ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}</View>}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={type.label}>{title}</Text>
        <Text style={type.caption}>{caption}</Text>
      </View>
      {badge}
      {onPress ? <Icon name="chevron" size={14} color={colors.muted} /> : null}
    </PressableScale>
  );
}

export function Badge({ label, tone = 'yuzu' }: { label: string; tone?: 'yuzu' | 'ink' | 'pain' }) {
  const c = { yuzu: [colors.yuzuSoft, colors.yuzuInk], ink: [colors.ink, colors.paper], pain: [colors.painSoft, colors.pain] }[tone];
  return <Text style={[type.tag, { color: c[1], backgroundColor: c[0], borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, overflow: 'hidden' }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderRadius: radius.photo, borderCurve: 'continuous', overflow: 'hidden' },
  photo: { height: 230, backgroundColor: colors.mist },
  more: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center' },
  moment: { width: sizes.moment.width, height: sizes.moment.height, borderRadius: radius.moment, overflow: 'hidden', backgroundColor: colors.mist },
  dot: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, padding: space.m, minHeight: 72 },
  thumb: { width: 44, height: 60, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.mist },
});
