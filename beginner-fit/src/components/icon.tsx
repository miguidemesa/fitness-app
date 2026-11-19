import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';
import { colors } from '@/theme';

/** SF Symbols on iOS, Material Symbols on Android: each platform's own icon language. */
const ICONS = {
  back: { ios: 'chevron.left', android: 'arrow_back' },
  close: { ios: 'xmark', android: 'close' },
  more: { ios: 'ellipsis', android: 'more_horiz' },
  bell: { ios: 'bell', android: 'notifications' },
  settings: { ios: 'gearshape', android: 'settings' },
  play: { ios: 'play.fill', android: 'play_arrow' },
  pause: { ios: 'pause.fill', android: 'pause' },
  check: { ios: 'checkmark', android: 'check' },
  plus: { ios: 'plus', android: 'add' },
  minus: { ios: 'minus', android: 'remove' },
  forward: { ios: 'arrow.right', android: 'arrow_forward' },
  chevron: { ios: 'chevron.right', android: 'arrow_forward' },
  swap: { ios: 'arrow.triangle.2.circlepath', android: 'swap_horiz' },
  skip: { ios: 'forward.end.fill', android: 'skip_next' },
  flame: { ios: 'flame.fill', android: 'local_fire_department' },
  share: { ios: 'square.and.arrow.up', android: 'share' },
  lock: { ios: 'lock', android: 'lock' },
  timer: { ios: 'timer', android: 'timer' },
} as const satisfies Record<string, SymbolViewProps['name']>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 20, color = colors.ink, animationSpec }: { name: IconName; size?: number; color?: ColorValue; animationSpec?: SymbolViewProps['animationSpec'] }) {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} animationSpec={animationSpec} weight="semibold" />;
}
