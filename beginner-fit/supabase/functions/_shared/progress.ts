import type { LogEntry, WorkoutLog } from './types.ts';

type LogRow = {
  plan_id: string;
  day: number;
  exercise_id: string;
  logged_on: string;
  completed: LogEntry['completed'];
  difficulty: LogEntry['difficulty'];
  pain: boolean;
  pain_area: LogEntry['painArea'];
};

export const fromLogRow = (r: LogRow): LogEntry => ({
  planId: r.plan_id,
  day: r.day,
  exerciseId: r.exercise_id,
  loggedOn: r.logged_on,
  completed: r.completed,
  difficulty: r.difficulty,
  pain: r.pain,
  painArea: r.pain_area,
});

/** First day of the plan with nothing logged yet; null when the whole week is done. */
export function nextDay(daysInPlan: number, planId: string, logs: LogEntry[]): number | null {
  const done = new Set(logs.filter((l) => l.planId === planId).map((l) => l.day));
  for (let d = 0; d < daysInPlan; d++) if (!done.has(d)) return d;
  return null;
}

/** Stored logs → what the adapt rules read. A skipped move counts as "about right" so it never triggers a change on its own. */
export const toWorkoutLog = (l: LogEntry): WorkoutLog => ({
  exerciseId: l.exerciseId,
  date: l.loggedOn,
  completed: l.completed !== 'skip',
  difficulty: l.difficulty ?? 2,
  pain: l.pain,
  painArea: l.painArea,
});

const DAY = 86_400_000;
/** Monday-based week number for a YYYY-MM-DD date (days since Mon 1970-01-05, so week 0 starts then). */
const weekOf = (date: string) => Math.floor((Date.parse(date) / DAY - 4) / 7);

/**
 * Weekly streak: consecutive calendar weeks (Mon–Sun) with at least one logged workout, ending this week.
 * A week with nothing yet doesn't break the streak until it's over, so it may end last week.
 */
export function weeklyStreak(logs: LogEntry[], today: string): number {
  const hit = new Set(logs.filter((l) => l.completed !== 'skip').map((l) => weekOf(l.loggedOn)));
  let w = weekOf(today);
  if (!hit.has(w)) w--;
  let n = 0;
  while (hit.has(w--)) n++;
  return n;
}

/** Capy grows with total workouts done. Name and threshold: first workout, then 4, 12, 30. */
export const STAGES = [
  { name: 'Pup', at: 0 },
  { name: 'Explorer', at: 1 },
  { name: 'Athlete', at: 4 },
  { name: 'Champion', at: 12 },
  { name: 'Legend', at: 30 },
] as const;

export function stageFor(workouts: number) {
  const i = STAGES.findLastIndex((s) => workouts >= s.at);
  return { stage: STAGES[i], next: STAGES[i + 1] ?? null };
}
