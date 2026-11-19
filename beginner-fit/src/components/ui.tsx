import { Children, isValidElement, useEffect, useState, type ReactNode } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View, type StyleProp, type TextInputProps, type TextProps, type ViewStyle } from 'react-native';
import Animated, { FadeIn, LinearTransition, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { CapyAvatar, type Mood } from '@/components/capy';
import { CircleButton } from '@/components/glass';
import { Icon, type IconName } from '@/components/icon';
import { PressableScale } from '@/components/motion';
import { haptic } from '@/lib/haptics';
import { colors, fonts, motion, radius, space, type } from '@/theme';
import { AREA_LABEL, AREAS, type Area } from '@/utils/types';

type Tone = 'light' | 'yuzu' | 'night';
const BG: Record<Tone, string> = { light: colors.porcelain, yuzu: colors.yuzu, night: colors.night };

/**
 * A scrolling page with an optional pinned footer. `tab` screens let content run under the (floating) tab bar.
 */
export function Screen({ children, footer, tone = 'light', tab, contentStyle }: { children: ReactNode; footer?: ReactNode; tone?: Tone; tab?: boolean; contentStyle?: StyleProp<ViewStyle> }) {
  const edges: Edge[] = tab || footer ? ['top'] : ['top', 'bottom'];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG[tone] }} edges={edges}>
      <ScrollView
        contentContainerStyle={[styles.scroll, contentStyle]}
        contentInsetAdjustmentBehavior={tab ? 'automatic' : 'never'}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {footer ? (
        <SafeAreaView edges={['bottom']} style={styles.footer}>
          {footer}
        </SafeAreaView>
      ) : null}
    </SafeAreaView>
  );
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<import('react-native').TextStyle> }) {
  return (
    <Text accessibilityRole="header" style={[type.title, style]}>
      {children}
    </Text>
  );
}

export function Body({ style, ...props }: TextProps) {
  return <Text {...props} style={[type.body, style]} />;
}

export function Tag({ children, color = colors.muted }: { children: ReactNode; color?: string }) {
  return <Text style={[type.tag, { color }]}>{children}</Text>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  return children ? (
    <Text accessibilityRole="alert" style={[type.label, { fontSize: 14, color: colors.pain, textAlign: 'center' }]}>
      {children}
    </Text>
  ) : null;
}

type Variant = 'primary' | 'accent' | 'secondary' | 'onDark' | 'text';
const BUTTON: Record<Variant, { bg: string; fg: string }> = {
  primary: { bg: colors.ink, fg: colors.paper },
  accent: { bg: colors.yuzu, fg: colors.ink },
  secondary: { bg: colors.mist, fg: colors.ink },
  onDark: { bg: 'rgba(255,255,255,0.14)', fg: colors.onNight },
  text: { bg: 'transparent', fg: colors.ink },
};

/** Pill button. `accent` (yuzu) is only for actions that move training forward: Start, Log set. */
export function Button({ label, onPress, disabled, variant = 'primary', icon, tall, style }: { label: string; onPress: () => void; disabled?: boolean; variant?: Variant; icon?: IconName; tall?: boolean; style?: StyleProp<ViewStyle> }) {
  const v = BUTTON[variant];
  const off = disabled && variant !== 'text';
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      feedback={variant === 'text' ? undefined : 'tap'}
      style={[styles.button, { minHeight: tall ? 64 : 56, backgroundColor: off ? colors.mist : v.bg }, style]}
    >
      {icon ? <Icon name={icon} size={18} color={off ? colors.muted : v.fg} /> : null}
      <Text style={[type.label, { fontSize: 17, color: off || (disabled && variant === 'text') ? colors.muted : v.fg }]}>{label}</Text>
    </PressableScale>
  );
}

export function Field(props: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      autoCapitalize="none"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[styles.field, focused && { borderColor: colors.ink }]}
      {...props}
    />
  );
}

export const fail = (e: unknown) => Alert.alert('That did not work', e instanceof Error ? e.message : 'Check your connection and try again.');

/** A selectable answer (ritual7 pattern): white pill that turns ink and reveals its hint when chosen. */
export function OptionPill({ label, hint, selected, onPress }: { label: string; hint?: string; selected: boolean; onPress: () => void }) {
  return (
    <PressableScale
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityHint={hint}
      scaleTo={motion.scale.card}
      feedback="select"
      onPress={onPress}
      style={[styles.option, selected && { backgroundColor: colors.ink }]}
    >
      <Animated.View layout={LinearTransition.duration(motion.quick)} style={{ alignItems: 'center', gap: 2 }}>
        <Text style={[type.label, { fontSize: 17, color: selected ? colors.paper : colors.ink }]}>{label}</Text>
        {selected && hint ? (
          <Animated.Text entering={FadeIn.duration(motion.quick)} style={[type.caption, { color: colors.onNightMuted, textAlign: 'center' }]}>
            {hint}
          </Animated.Text>
        ) : null}
      </Animated.View>
    </PressableScale>
  );
}

/** White rounded list with inset hairlines between rows (toggle lists, exercise lists, session rows). */
export function Group({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={[styles.group, style]}>
      {rows.map((row, i) => (
        <View key={row.key ?? i}>
          {/* The separator is inset; the row itself is not. */}
          {i > 0 ? <View style={styles.hairline} /> : null}
          {row}
        </View>
      ))}
    </View>
  );
}

/** White rounded block for free content (a heading, a field, a button). For lists of rows, use Group. */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.group, style]}>{children}</View>;
}

/** A label with a native switch (iOS switch / Material switch). The whole row toggles. */
export function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (on: boolean) => void }) {
  const flip = (on: boolean) => {
    haptic(on ? 'toggleOn' : 'toggleOff');
    onChange(on);
  };
  return (
    <PressableScale accessibilityRole="switch" accessibilityState={{ checked: value }} scaleTo={1} onPress={() => flip(!value)} style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={type.label}>{label}</Text>
        {hint ? <Text style={type.caption}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={flip}
        trackColor={{ true: colors.ink, false: colors.mist }}
        thumbColor={colors.paper}
        ios_backgroundColor={colors.mist}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
    </PressableScale>
  );
}

export function Chip({ label, selected, onPress, role = 'radio', style }: { label: string; selected: boolean; onPress: () => void; role?: 'radio' | 'checkbox'; style?: StyleProp<ViewStyle> }) {
  return (
    <PressableScale
      accessibilityRole={role}
      accessibilityState={role === 'radio' ? { selected } : { checked: selected }}
      feedback="select"
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: colors.ink }, style]}
    >
      <Text style={[type.label, { fontSize: 15, color: selected ? colors.paper : colors.ink }]}>{label}</Text>
    </PressableScale>
  );
}

/** One choice from a short list, as a row of pills. */
export function Segmented<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T | undefined; onChange: (v: T) => void }) {
  return (
    <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: space.s }}>
      {options.map((o) => (
        <Chip key={String(o.value)} label={o.label} selected={value === o.value} onPress={() => onChange(o.value)} style={{ flex: 1 }} />
      ))}
    </View>
  );
}

export const MIN_DAYS = 2;
export const MAX_DAYS = 4;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Seven round day toggles (0 = Monday … 6 = Sunday). Picking is capped at MAX_DAYS. */
export function WeekdayChips({ selected, onChange }: { selected: number[]; onChange: (days: number[]) => void }) {
  const toggle = (d: number) => {
    const on = selected.includes(d);
    if (!on && selected.length >= MAX_DAYS) return;
    onChange((on ? selected.filter((x) => x !== d) : [...selected, d]).sort());
  };
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {WEEKDAYS.map((label, d) => {
        const on = selected.includes(d);
        return (
          <PressableScale
            key={label}
            accessibilityRole="checkbox"
            accessibilityLabel={WEEKDAY_NAMES[d]}
            accessibilityState={{ checked: on }}
            scaleTo={motion.scale.circle}
            feedback="select"
            onPress={() => toggle(d)}
            style={[styles.day, on && { backgroundColor: colors.ink }]}
          >
            <Text style={[type.caption, { fontFamily: fonts.bold, color: on ? colors.paper : colors.ink }]}>{label}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

/** Body-area chips. `multi` makes them checkboxes instead of radios. */
export function AreaChips({ selected, onPress, multi }: { selected: Area[]; onPress: (a: Area) => void; multi?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s }}>
      {AREAS.map((a) => (
        <Chip key={a} label={AREA_LABEL[a]} role={multi ? 'checkbox' : 'radio'} selected={selected.includes(a)} onPress={() => onPress(a)} />
      ))}
    </View>
  );
}

/** Back circle + a thin progress line that springs forward. */
export function StepHeader({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withSpring(step / total, motion.settle);
  }, [step, total, progress]);
  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <View style={styles.stepRow}>
      <CircleButton icon="back" label="Go back" onPress={onBack} />
      <View style={styles.track} accessibilityLabel={`Step ${step} of ${total}`}>
        <Animated.View style={[styles.fill, fill]} />
      </View>
      <Text style={type.caption}>
        {step} of {total}
      </Text>
    </View>
  );
}

/** Capy speaking: a small head and a line of text. Not a card, so it reads like a voice. */
export function CoachLine({ children, mood, dark }: { children: ReactNode; mood?: Mood; dark?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.m, alignItems: 'center' }}>
      <CapyAvatar size={36} mood={mood} />
      <Text style={[type.body, { flex: 1, fontSize: 15, lineHeight: 22, color: dark ? colors.onNight : colors.body }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: space.gutter, paddingTop: space.m, paddingBottom: space.xxl, gap: space.l, flexGrow: 1 },
  footer: { paddingHorizontal: space.gutter, paddingTop: space.s, paddingBottom: space.s, gap: space.s },
  button: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space.s, paddingHorizontal: space.xl, overflow: 'hidden' },
  field: { fontFamily: fonts.medium, fontSize: 17, color: colors.ink, minHeight: 56, paddingHorizontal: space.l, borderRadius: radius.field, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.paper },
  option: { minHeight: 60, paddingHorizontal: space.xl, paddingVertical: space.l, borderRadius: 24, backgroundColor: colors.paper, justifyContent: 'center', overflow: 'hidden' },
  group: { backgroundColor: colors.paper, borderRadius: radius.group, borderCurve: 'continuous', overflow: 'hidden' },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginLeft: space.l },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.m, minHeight: 56, paddingHorizontal: space.l, paddingVertical: space.m },
  chip: { minHeight: 44, paddingHorizontal: space.l, borderRadius: radius.pill, backgroundColor: colors.mist, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  day: { flex: 1, aspectRatio: 1, maxWidth: 52, borderRadius: radius.pill, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: space.m },
  track: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.mist, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2, backgroundColor: colors.ink },
});
