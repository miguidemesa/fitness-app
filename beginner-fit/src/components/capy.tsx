import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { View } from 'react-native';
import { colors } from '@/theme';

type Mood = 'hello' | 'caring';

const FACE: Record<Mood, { eyes: string; brows: string; mouth: string }> = {
  hello: {
    eyes: 'M72.5 84 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0 M116.5 84 a5.5 5.5 0 1 0 11 0 a5.5 5.5 0 1 0 -11 0',
    brows: '',
    mouth: 'M90 118 q10 8 20 0',
  },
  caring: {
    eyes: 'M73 86 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M117 86 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0',
    brows: 'M70 77 L84 72 M130 77 L116 72',
    mouth: 'M93 121 q7 -3 14 0',
  },
};

/** Capy's head in a round badge, as used on coach messages. */
export function CapyAvatar({ size = 40, mood = 'hello' }: { size?: number; mood?: Mood }) {
  const f = FACE[mood];
  return (
    <View
      accessible={false}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.capyTint, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} viewBox="40 34 120 108">
        <Circle cx="60" cy="48" r="11" fill="#7A5033" />
        <Circle cx="140" cy="48" r="11" fill="#7A5033" />
        <Rect x="44" y="38" width="112" height="96" rx="42" fill="#A8754F" />
        <Rect x="44" y="56" width="112" height="13" fill={colors.accent} />
        <Rect x="66" y="92" width="68" height="40" rx="20" fill="#C99B72" />
        <Ellipse cx="88" cy="102" rx="3.4" ry="2.4" fill="#2B1D15" />
        <Ellipse cx="112" cy="102" rx="3.4" ry="2.4" fill="#2B1D15" />
        <Path d={f.eyes} fill="#2B1D15" />
        {f.brows ? <Path d={f.brows} stroke="#2B1D15" strokeWidth={3} strokeLinecap="round" fill="none" /> : null}
        <Path d={f.mouth} stroke="#2B1D15" strokeWidth={3} strokeLinecap="round" fill="none" />
      </Svg>
    </View>
  );
}
