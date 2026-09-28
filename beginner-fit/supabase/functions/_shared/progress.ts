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
