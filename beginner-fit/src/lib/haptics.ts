import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type HapticIntent = 'select' | 'tap' | 'setDone' | 'success' | 'tick' | 'toggleOn' | 'toggleOff';

// Each platform's own vocabulary (spec §3.7). No haptic on errors or pain, so nothing feels like a scold.
const ANDROID: Record<HapticIntent, Haptics.AndroidHaptics> = {
  select: Haptics.AndroidHaptics.Segment_Tick,
  tap: Haptics.AndroidHaptics.Context_Click,
  setDone: Haptics.AndroidHaptics.Confirm,
  success: Haptics.AndroidHaptics.Confirm,
  tick: Haptics.AndroidHaptics.Clock_Tick,
  toggleOn: Haptics.AndroidHaptics.Toggle_On,
  toggleOff: Haptics.AndroidHaptics.Toggle_Off,
};

const IOS: Record<HapticIntent, () => Promise<void>> = {
  select: Haptics.selectionAsync,
  tap: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  setDone: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  tick: Haptics.selectionAsync,
  toggleOn: Haptics.selectionAsync,
  toggleOff: Haptics.selectionAsync,
};

/** Fire-and-forget. Haptics are a nicety, so a device without them (or web) just stays quiet. */
export function haptic(intent: HapticIntent): void {
  if (Platform.OS === 'web') return;
  const run = Platform.OS === 'android' ? () => Haptics.performAndroidHapticsAsync(ANDROID[intent]) : IOS[intent];
  run().catch(() => {});
}
