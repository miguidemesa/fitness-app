import type { LogEntry, Session, SetLog } from './types.ts';

export type { SetLog } from './types.ts';

/** What gets saved for a move: every set done → all, some → some, none → skip. */
export function completedFromSets(sets: SetLog[]): LogEntry['completed'] {
  const done = sets.filter((s) => s.done).length;
  return done === 0 ? 'skip' : done === sets.length ? 'all' : 'some';
}

const LOWER = new Set(['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors']);
const UPPER = new Set(['chest', 'shoulders', 'triceps', 'biceps', 'lats', 'middle back', 'traps', 'forearms', 'neck']);
const MOSTLY = 0.6;

/** A human name for a day from its moves' primary muscles: where most of the work is. */
export function sessionFocus(muscles: string[]): string {
  if (!muscles.length) return 'Full body';
  const share = (group: Set<string>) => muscles.filter((m) => group.has(m)).length / muscles.length;
  if (share(LOWER) >= MOSTLY) return 'Lower body';
  if (share(UPPER) >= MOSTLY) return 'Upper body';
  if (share(LOWER) + share(UPPER) === 0) return 'Core';
  return 'Full body';
}

/** Totals over a session's moves (each an array of sets). Only done sets count. */
export function setStats(moves: SetLog[][]): { sets: number; reps: number; volumeKg: number } {
  const done = moves.flat().filter((s) => s.done);
  return {
    sets: done.length,
    reps: done.reduce((n, s) => n + s.reps, 0),
    volumeKg: done.reduce((n, s) => n + s.reps * (s.weightKg ?? 0), 0),
  };
}

const DAY_MS = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
/** Midnight UTC of the Monday in the week of a YYYY-MM-DD date. */
const mondayOf = (date: string) => {
  const ms = Date.parse(date);
  return ms - ((new Date(ms).getUTCDay() + 6) % 7) * DAY_MS;
};

const sessionsDone = (logs: LogEntry[]) => new Set(logs.filter((l) => l.completed !== 'skip').map((l) => `${l.planId}:${l.day}`));

/** Whether a YYYY-MM-DD date falls in the same Mon–Sun week as `today`. */
export const inWeekOf = (date: string, today: string) => date >= iso(mondayOf(today)) && date <= iso(mondayOf(today) + 6 * DAY_MS);

/** Workouts (not moves) with at least one move done, logged this Mon–Sun week. */
export function workoutsThisWeek(logs: LogEntry[], today: string): number {
  return sessionsDone(logs.filter((l) => inWeekOf(l.loggedOn, today))).size;
}

export type WeekDot = { label: string; scheduled: boolean; done: boolean; today: boolean };
const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** This week, Monday first: which days are planned, which have a workout logged, and which is today. */
export function weekDots(schedule: number[], logs: LogEntry[], today: string): WeekDot[] {
  const doneDates = new Set(logs.filter((l) => l.completed !== 'skip').map((l) => l.loggedOn));
  const monday = mondayOf(today);
  return LETTERS.map((label, d) => {
    const date = iso(monday + d * DAY_MS);
    return { label, scheduled: schedule.includes(d), done: doneDates.has(date), today: date === today };
  });
}

export type Best = { exerciseId: string; kind: 'weight' | 'reps'; value: number };
const most = (sets: SetLog[], pick: (s: SetLog) => number) => Math.max(0, ...sets.filter((s) => s.done).map(pick));

/**
 * Moves that beat their own record: heavier weight, or (bodyweight moves) more reps in a set.
 * A move's first ever log is not a best: there is nothing to beat yet.
 */
export function newBests(moves: { exerciseId: string; sets: SetLog[] }[], history: Record<string, SetLog[][]>): Best[] {
  const bests: Best[] = [];
  for (const { exerciseId, sets } of moves) {
    const past = (history[exerciseId] ?? []).flat();
    if (!past.some((s) => s.done) || !sets.some((s) => s.done)) continue;
    const weight = most(sets, (s) => s.weightKg ?? 0);
    const pastWeight = most(past, (s) => s.weightKg ?? 0);
    if (weight > 0 && pastWeight > 0) {
      if (weight > pastWeight) bests.push({ exerciseId, kind: 'weight', value: weight });
    } else if (weight === 0 && pastWeight === 0) {
      const reps = most(sets, (s) => s.reps);
      if (reps > most(past, (s) => s.reps)) bests.push({ exerciseId, kind: 'reps', value: reps });
    }
  }
  return bests;
}

/** Everything "last time" needs: each move's past sets (oldest first) and each workout's duration (key "planId:day"). */
export type History = { sets: Record<string, SetLog[][]>; seconds: Record<string, number> };

/** Builds the history from saved logs (oldest first) and sessions. Moves with no set done are left out. */
export function historyFrom(logs: LogEntry[], sessions: Session[]): History {
  const sets: Record<string, SetLog[][]> = {};
  for (const l of logs) if (l.sets?.some((s) => s.done)) sets[l.exerciseId] = [...(sets[l.exerciseId] ?? []), l.sets];
  return { sets, seconds: Object.fromEntries(sessions.map((s) => [`${s.planId}:${s.day}`, s.seconds])) };
}
