import { useDynamicNotifications } from "@/vendor/dynamic-notifications/hooks/use-dynamic-notifications";
import type { INotificationOverlay } from "@/vendor/dynamic-notifications/interfaces/notification-overlay.interface";
import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { Content } from "./content";
import { Gooey } from "./gooey";

const Overlay: React.FC<INotificationOverlay> &
  React.FunctionComponent<INotificationOverlay> = memo<INotificationOverlay>(
  ({
    style,
  }: INotificationOverlay):
    | (React.ReactNode & React.ReactElement & React.JSX.Element)
    | null => {
    const { layout, notification } = useDynamicNotifications();

    // Capy patch: only draw while a notification is out. Upstream always paints the black island pill,
    // which shows up as a stray blob on phones without a Dynamic Island (and on Android).
    if (!notification) {
      return null;
    }

    return (
      <View
        pointerEvents="box-none"
        style={[styles.overlay, { height: layout.canvasHeight }, style]}
      >
        <Gooey />
        <Content />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
});

export { Overlay };
