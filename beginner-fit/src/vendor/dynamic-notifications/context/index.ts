import type { IDynamicNotificationsContext } from "@/vendor/dynamic-notifications/interfaces/dynamic-notifications-context.interface";
import { createContext } from "react";

const DynamicNotificationsContext =
  createContext<IDynamicNotificationsContext | null>(null);

export { DynamicNotificationsContext };
