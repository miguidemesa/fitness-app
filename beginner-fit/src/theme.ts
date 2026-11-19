import { Easing } from 'react-native-reanimated';

// Design tokens. See docs/superpowers/specs/2026-10-09-capy-core-redesign-design.md §3.
export const colors = {
  porcelain: '#F6F5F2',
  paper: '#FFFFFF',
  mist: '#ECEAE5',
  line: '#E2DFD8',
  ink: '#15151A',
  body: '#45444A',
  muted: '#6B6970',
  /** The one accent. Text on it is always ink, never white. */
  yuzu: '#F5B323',
  yuzuSoft: '#FCEFCB',
  /** The only yuzu-coloured text, on light surfaces. */
  yuzuInk: '#7A5200',
  night: '#101014',
  nightSoft: '#1E1E24',
  onNight: '#F6F5F2',
  onNightMuted: '#A3A1A8',
  pain: '#B3261E',
  painSoft: '#FDECEA',
  capyTint: '#EFE7DD',
};

export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displayHeavy: 'BricolageGrotesque_800ExtraBold',
  displayMedium: 'BricolageGrotesque_500Medium',
  body: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  bold: 'Figtree_600SemiBold',
};

const num = { fontVariant: ['tabular-nums' as const] };

/** Type scale (§3.3). Spread into a Text style. */
export const type = {
  hero: { fontFamily: fonts.displayHeavy, fontSize: 88, lineHeight: 88, letterSpacing: -2, color: colors.ink, ...num },
  display: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44, letterSpacing: -0.8, color: colors.ink },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.5, color: colors.ink },
  heading: { fontFamily: fonts.display, fontSize: 22, lineHeight: 26, letterSpacing: -0.2, color: colors.ink },
  stat: { fontFamily: fonts.displayHeavy, fontSize: 44, lineHeight: 46, letterSpacing: -1, color: colors.ink, ...num },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.body },
  label: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 21, color: colors.ink },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.muted },
  tag: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' as const, color: colors.muted },
};

export const space = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32, gutter: 20 };

/** Shape roles (§3.4): each radius means something. */
export const radius = { pill: 999, moment: 44, photo: 32, sheet: 32, group: 20, field: 16 };
export const sizes = { circle: 44, stepper: 56, logSet: 64, moment: { width: 88, height: 144 } };

/** Motion tokens (§3.6). */
export const motion = {
  tap: 120,
  quick: 200,
  base: 280,
  slow: 420,
  stagger: 45,
  maxStagger: 6,
  easeOut: Easing.bezier(0.2, 0.8, 0.2, 1),
  press: { damping: 18, stiffness: 320, mass: 0.6 },
  settle: { damping: 16, stiffness: 180 },
  playful: { damping: 10, stiffness: 200 },
  scale: { card: 0.98, button: 0.96, circle: 0.92 },
};
