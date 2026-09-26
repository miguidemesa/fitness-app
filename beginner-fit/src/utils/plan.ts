import type { Exercise, Plan, Profile } from './types.ts';

// Beginner limits. ponytail: fixed caps, placeholder values until a trainer reviews them.
export const CAPS = {
  sets: { min: 1, max: 3 },
  reps: { min: 5, max: 15 },
  exercisesPerDay: { min: 3, max: 6 },
  days: { min: 1, max: 5 },
};

const within = (n: unknown, r: { min: number; max: number }) =>
  Number.isInteger(n) && (n as number) >= r.min && (n as number) <= r.max;

/** Check an AI-generated plan. Never trust its shape — it came from a model. Returns errors; empty = valid. */
export function validatePlan(plan: unknown, allowlist: Exercise[], profile: Pick<Profile, 'daysPerWeek'>): string[] {
  const errors: string[] = [];
  const allowed = new Set(allowlist.map((e) => e.id));
  const days = (plan as Plan | null)?.days;
  if (!Array.isArray(days)) return ['plan.days is not an array'];
  if (days.length !== profile.daysPerWeek || !within(days.length, CAPS.days)) {
    errors.push(`expected ${profile.daysPerWeek} days, got ${days.length}`);
  }
  days.forEach((day, d) => {
    if (!Array.isArray(day) || !within(day.length, CAPS.exercisesPerDay)) {
      errors.push(`day ${d}: needs ${CAPS.exercisesPerDay.min}-${CAPS.exercisesPerDay.max} exercises`);
      return;
    }
    day.forEach((item, i) => {
      if (!allowed.has(item?.exerciseId)) errors.push(`day ${d} item ${i}: exercise not allowed: ${item?.exerciseId}`);
      if (!within(item?.sets, CAPS.sets)) errors.push(`day ${d} item ${i}: bad sets ${item?.sets}`);
      if (!within(item?.reps, CAPS.reps)) errors.push(`day ${d} item ${i}: bad reps ${item?.reps}`);
    });
  });
  return errors;
}

/** Rule-built plan used when the AI fails validation twice. Interleaves muscle groups so each day is varied. */
export function fallbackPlan(allowlist: Exercise[], profile: Pick<Profile, 'daysPerWeek'>, week = 1): Plan {
  if (allowlist.length < CAPS.exercisesPerDay.min) throw new Error('allowlist too small for a safe plan');
  const groups = [...groupBy(allowlist, (e) => e.primaryMuscles[0] ?? 'other').values()];
  const order: Exercise[] = [];
  for (let i = 0; order.length < allowlist.length; i++) for (const g of groups) if (g[i]) order.push(g[i]);
  const perDay = Math.min(4, order.length);
  const days = Math.min(Math.max(profile.daysPerWeek, CAPS.days.min), CAPS.days.max);
  return {
    week,
    days: Array.from({ length: days }, (_, d) =>
      Array.from({ length: perDay }, (_, i) => ({ exerciseId: order[(d * perDay + i) % order.length].id, sets: 2, reps: 10 })),
    ),
  };
}

// Map.groupBy isn't in every JS engine Hermes/Deno versions ship; this is.
function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const t of items) m.set(key(t), [...(m.get(key(t)) ?? []), t]);
  return m;
}
