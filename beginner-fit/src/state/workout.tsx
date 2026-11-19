import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useProfile } from '@/state/profile';
import { historyFrom, type History, type SetLog } from '@/utils/session';
import type { Area, Difficulty, PlanItem } from '@/utils/types';

export type ActiveMove = { exerciseId: string; sets: SetLog[]; difficulty?: Difficulty; pain?: boolean; painArea?: Area; skipped?: boolean };
export type ActiveWorkout = {
  planId: string;
  day: number;
  startedAt: number;
  /** The move on screen. */
  index: number;
  moves: ActiveMove[];
  /** Rest is a timestamp, so it survives leaving the screen or the app. */
  restEndsAt: number | null;
  restTotal: number;
};
export type Units = 'kg' | 'lb';

const KEY = { active: 'capy.workout.v1', units: 'capy.units.v1' };
// ponytail: the pre-sync builds kept sets on the phone under this key. They never shipped, so it is cleared, not uploaded.
const OLD_HISTORY_KEY = 'capy.history.v1';

/** Equipment that takes a weight. Bodyweight, bands and balls log reps only. */
const LOADED = new Set(['dumbbell', 'barbell', 'kettlebells', 'cable', 'machine', 'e-z curl bar', 'medicine ball']);
export const usesWeight = (equipment: string | null | undefined) => !!equipment && LOADED.has(equipment);

const read = async <T,>(key: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback; // unreadable state is dropped rather than crashing the app
  }
};
const write = (key: string, value: unknown) => AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});

type Ctx = {
  ready: boolean;
  active: ActiveWorkout | null;
  /** Starts (or restarts) a day. Sets are prefilled from last time, else from the plan. */
  start: (planId: string, day: number, items: PlanItem[], weighted: (exerciseId: string) => boolean) => void;
  update: (fn: (w: ActiveWorkout) => ActiveWorkout) => void;
  clear: () => void;
  /** Past sets per move and durations per workout, from the saved logs and sessions. */
  history: History;
  units: Units;
  setUnits: (u: Units) => void;
};
const WorkoutContext = createContext<Ctx | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const profile = useProfile();
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState<ActiveWorkout | null>(null);
  const [units, setUnitsState] = useState<Units>('kg');

  useEffect(() => {
    AsyncStorage.removeItem(OLD_HISTORY_KEY).catch(() => {});
    Promise.all([read<ActiveWorkout | null>(KEY.active, null), read<Units>(KEY.units, 'kg')]).then(([a, u]) => {
      setActive(a);
      setUnitsState(u);
      setReady(true);
    });
  }, []);

  // A saved workout for an old plan, or for a day that's already logged, is stale: hide it and drop it from storage.
  const stale =
    !!active &&
    profile.ready &&
    (!profile.plan || profile.plan.id !== active.planId || profile.logs.some((l) => l.planId === active.planId && l.day === active.day));
  useEffect(() => {
    if (stale) write(KEY.active, null);
  }, [stale]);

  const history = useMemo(() => historyFrom(profile.logs, profile.sessions), [profile.logs, profile.sessions]);

  const save = (next: ActiveWorkout | null) => {
    setActive(next);
    write(KEY.active, next);
  };

  const start: Ctx['start'] = (planId, day, items, weighted) =>
    save({
      planId,
      day,
      startedAt: Date.now(),
      index: 0,
      restEndsAt: null,
      restTotal: 0,
      moves: items.map((it) => {
        const last = history.sets[it.exerciseId]?.at(-1)?.find((s) => s.done);
        const weightKg = weighted(it.exerciseId) ? (last?.weightKg ?? null) : null;
        return { exerciseId: it.exerciseId, sets: Array.from({ length: it.sets }, () => ({ reps: it.reps, weightKg, done: false })) };
      }),
    });


  return (
    <WorkoutContext.Provider
      value={{
        ready,
        active: stale ? null : active,
        start,
        // Functional so rapid taps (Log set, then a stepper) never overwrite each other.
        update: (fn) =>
          setActive((cur) => {
            if (!cur) return cur;
            const next = fn(cur);
            write(KEY.active, next);
            return next;
          }),
        clear: () => save(null),
        history,
        units,
        setUnits: (u) => {
          setUnitsState(u);
          write(KEY.units, u);
        },
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkout must be used inside WorkoutProvider');
  return ctx;
}

const LB_PER_KG = 2.20462;
/** Display a stored kg value in the user's unit, rounded to what a gym actually has. */
export const fromKg = (kg: number, u: Units) => (u === 'kg' ? Math.round(kg * 2) / 2 : Math.round(kg * LB_PER_KG));
export const toKg = (value: number, u: Units) => (u === 'kg' ? value : value / LB_PER_KG);
