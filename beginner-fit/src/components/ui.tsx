import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type TextProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { CapyAvatar } from '@/components/capy';
import { colors, fonts } from '@/theme';

export function Screen({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer ? <View style={s.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={s.title}>
      {children}
    </Text>
  );
}

export function Body({ style, ...props }: TextProps) {
  return <Text {...props} style={[s.body, style]} />;
}

export function Button({ label, onPress, disabled, variant = 'primary' }: { label: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'ghost' }) {
  const ghost = variant === 'ghost';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.button, ghost ? s.ghost : s.primary, disabled && s.disabled, pressed && !disabled && { opacity: 0.85 }]}
    >
      <Text style={[s.buttonText, ghost && { color: colors.ink }, disabled && { color: colors.muted }]}>{label}</Text>
    </Pressable>
  );
}

function Check({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12.5l4.5 4.5L19 7.5" />
    </Svg>
  );
}

/** A selectable answer. `multi` renders a square checkbox instead of a round radio. */
export function OptionCard({ label, hint, selected, onPress, multi }: { label: string; hint?: string; selected: boolean; onPress: () => void; multi?: boolean }) {
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={multi ? { checked: selected } : { selected }}
      onPress={onPress}
      style={[s.option, selected && s.optionOn]}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.optionLabel}>{label}</Text>
        {hint ? <Text style={s.hint}>{hint}</Text> : null}
      </View>
      <View style={[s.mark, { borderRadius: multi ? 7 : 12 }, selected && s.markOn]}>{selected ? <Check color="#FFFFFF" /> : null}</View>
    </Pressable>
  );
}

export function CoachBubble({ children, mood }: { children: ReactNode; mood?: 'hello' | 'caring' }) {
  return (
    <View style={[s.card, s.coach]}>
      <CapyAvatar mood={mood} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.meta}>Capy · your coach</Text>
        <Text style={s.coachText}>{children}</Text>
      </View>
    </View>
  );
}

/** Back button + progress segments for the onboarding steps. */
export function StepHeader({ step, total, onBack }: { step: number; total: number; onBack: () => void }) {
  return (
    <View style={s.stepRow}>
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={s.back} hitSlop={8}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.ink} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M15 5l-7 7 7 7" />
        </Svg>
      </Pressable>
      <View style={s.segments} accessibilityLabel={`Step ${step} of ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[s.segment, { backgroundColor: i < step ? colors.accent : colors.disabled }]} />
        ))}
      </View>
      <Text style={s.meta}>
        {step} of {total}
      </Text>
    </View>
  );
}

export const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.ground },
  scroll: { padding: 20, gap: 14, flexGrow: 1 },
  footer: { paddingHorizontal: 20, paddingBottom: 8, paddingTop: 8, gap: 10 },
  title: { fontFamily: fonts.display, fontSize: 44, lineHeight: 42, textTransform: 'uppercase', color: colors.ink, marginTop: 8 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.body },
  meta: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted },
  hint: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  card: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.line },
  coach: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  coachText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.body },
  button: { minHeight: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 22 },
  primary: { backgroundColor: colors.accent },
  ghost: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.disabled },
  disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
  buttonText: { fontFamily: fonts.bold, fontSize: 17, color: '#FFFFFF' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, padding: 16, borderRadius: 14, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.card },
  optionOn: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  optionLabel: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  mark: { width: 24, height: 24, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  markOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  back: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  segments: { flex: 1, flexDirection: 'row', gap: 5 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
});
