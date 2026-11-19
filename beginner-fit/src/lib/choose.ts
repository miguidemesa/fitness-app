import { ActionSheetIOS, Alert, Platform } from 'react-native';

export type Choice = { label: string; onPress: () => void; destructive?: boolean };

/**
 * A short native menu: an action sheet on iOS, a Material dialog on Android (tap outside to cancel).
 * Android dialogs hold at most 3 buttons, so keep menus to 3 choices.
 */
export function choose(title: string, choices: Choice[]): void {
  if (Platform.OS === 'ios') {
    const destructive = choices.findIndex((c) => c.destructive);
    ActionSheetIOS.showActionSheetWithOptions(
      { title, options: [...choices.map((c) => c.label), 'Cancel'], cancelButtonIndex: choices.length, destructiveButtonIndex: destructive >= 0 ? destructive : undefined },
      (i) => choices[i]?.onPress(),
    );
    return;
  }
  Alert.alert(
    title,
    undefined,
    choices.slice(0, 3).map((c) => ({ text: c.label, style: c.destructive ? 'destructive' : 'default', onPress: c.onPress })),
    { cancelable: true },
  );
}
