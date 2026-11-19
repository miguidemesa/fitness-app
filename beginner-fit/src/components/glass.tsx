import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { View } from 'react-native';
import { Icon, type IconName } from '@/components/icon';
import { PressableScale } from '@/components/motion';
import { colors, motion, sizes } from '@/theme';

// iOS 26 Liquid Glass when the system has it; a translucent disc everywhere else.
const HAS_GLASS = isLiquidGlassAvailable();

/**
 * A round icon button. `paper` sits on light screens; `glass` floats over photos and the dark workout canvas.
 */
export function CircleButton({ icon, label, onPress, tone = 'paper', size = sizes.circle }: { icon: IconName; label: string; onPress: () => void; tone?: 'paper' | 'glass'; size?: number }) {
  const dark = tone === 'glass';
  const shape = { width: size, height: size, borderRadius: size / 2 };
  const iconEl = <Icon name={icon} size={size * 0.42} color={dark ? colors.onNight : colors.ink} />;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      scaleTo={motion.scale.circle}
      feedback="tap"
      android_ripple={{ color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(21,21,26,0.1)', borderless: true, radius: size / 2 }}
      onPress={onPress}
      style={shape}
    >
      {dark && HAS_GLASS ? (
        <GlassView glassEffectStyle="regular" isInteractive style={[shape, center]}>
          {iconEl}
        </GlassView>
      ) : (
        <View style={[shape, center, { backgroundColor: dark ? 'rgba(255,255,255,0.14)' : colors.paper }]}>{iconEl}</View>
      )}
    </PressableScale>
  );
}

const center = { alignItems: 'center', justifyContent: 'center' } as const;
