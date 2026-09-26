import { CAPS } from './plan.ts';
import type { Area, Exercise, Plan, PlanItem, WorkoutLog } from './types.ts';

export type Adaptation = { plan: Plan; changes: string[]; seeProfessional: boolean };

/**
 * Next week's plan from this week's logs. Deterministic — no AI, so it is safe and free.
 * Rules: pain → swap (or reduce), never progress. Too easy twice in a row → small capped increase.
 * Too hard last time → reduce.
 */
export function adaptPlan(plan: Plan, logs: WorkoutLog[], allowlist: Exercise[]): Adaptation {
  const byId = new Map(allowlist.map((e) => [e.id, e]));
  const name = (id: string) => byId.get(id)?.name ?? id;
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const planIds = new Set(plan.days.flat().map((i) => i.exerciseId));
  const changes: string[] = [];
  const decided = new Map<string, (item: PlanItem) => PlanItem>();

  // Same painful area on 2+ different days → tell them to see someone.
  const painDays = new Map<string, Set<string>>();
  for (const l of sorted.filter((l) => l.pain)) {
    const k = l.painArea ?? 'unspecified';
    painDays.set(k, (painDays.get(k) ?? new Set()).add(l.date));
  }
  const seeProfessional = [...painDays.values()].some((d) => d.size >= 2);

  for (const id of [...planIds]) {
    const mine = sorted.filter((l) => l.exerciseId === id);
    const painAreas = new Set(mine.filter((l) => l.pain && l.painArea).map((l) => l.painArea as Area));

    if (mine.some((l) => l.pain)) {
      const muscle = byId.get(id)?.primaryMuscles[0];
      const swap = allowlist.find(
        (e) => e.primaryMuscles[0] === muscle && !planIds.has(e.id) && !e.stressAreas.some((a) => painAreas.has(a)),
      );
      if (swap) {
        planIds.add(swap.id); // don't hand the same replacement to two exercises
        changes.push(`Swapped ${name(id)} for ${swap.name} because it caused pain.`);
        decided.set(id, (i) => ({ ...i, exerciseId: swap.id }));
      } else {
        changes.push(`Made ${name(id)} lighter because it caused pain.`);
        decided.set(id, (i) => ({ ...i, sets: Math.max(CAPS.sets.min, i.sets - 1) }));
      }
      continue;
    }

    const last2 = mine.slice(-2);
    if (last2.length === 2 && last2.every((l) => l.difficulty === 1)) {
      decided.set(id, (i) => {
        if (i.reps < CAPS.reps.max) return { ...i, reps: Math.min(CAPS.reps.max, i.reps + 2) };
        if (i.sets < CAPS.sets.max) return { ...i, sets: i.sets + 1, reps: 10 };
        return i;
      });
      changes.push(`${name(id)} felt easy, so it's a little harder now.`);
    } else if (mine.at(-1)?.difficulty === 3) {
      decided.set(id, (i) =>
        i.reps > CAPS.reps.min
          ? { ...i, reps: Math.max(CAPS.reps.min, i.reps - 2) }
          : { ...i, sets: Math.max(CAPS.sets.min, i.sets - 1) },
      );
      changes.push(`${name(id)} felt too hard, so it's a little easier now.`);
    }
  }

  return {
    plan: { week: plan.week + 1, days: plan.days.map((day) => day.map((i) => decided.get(i.exerciseId)?.(i) ?? i)) },
    changes,
    seeProfessional,
  };
}
