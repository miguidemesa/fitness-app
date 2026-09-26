/// <reference types="node" />
// Run: npm test  (Node's built-in runner; no Jest needed for pure functions)
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { adaptPlan } from './adapt.ts';
import { filterExercises } from './allowlist.ts';
import { fallbackPlan, validatePlan } from './plan.ts';
import { isHighRisk, needsInjuryAreas, SCREENING_QUESTIONS } from './screening.ts';
import type { Exercise, Plan, WorkoutLog } from './types.ts';

const ex = (id: string, muscle: string, stressAreas: Exercise['stressAreas'] = [], extra: Partial<Exercise> = {}): Exercise => ({
  id, name: id, level: 'beginner', equipment: 'body only', primaryMuscles: [muscle], stressAreas, ...extra,
});
const LIB = [
  ex('squat', 'quadriceps', ['knee']),
  ex('lunge', 'quadriceps', ['knee']),
  ex('wall_sit', 'quadriceps'),
  ex('glute_bridge', 'glutes'),
  ex('pushup', 'chest', ['wrist', 'shoulder']),
  ex('plank', 'abdominals'),
  ex('db_row', 'lats', [], { equipment: 'dumbbell' }),
  ex('pistol', 'quadriceps', ['knee'], { level: 'expert' }),
];
const allNo = Object.fromEntries(SCREENING_QUESTIONS.map((q) => [q.id, false]));
const log = (exerciseId: string, date: string, over: Partial<WorkoutLog> = {}): WorkoutLog => ({
  exerciseId, date, completed: true, difficulty: 2, pain: false, painArea: null, ...over,
});

test('screening: all "no" is clear; any high-risk yes or a skipped question blocks', () => {
  assert.equal(isHighRisk(allNo), false);
  assert.equal(isHighRisk({ ...allNo, heart: true }), true);
  const { chest_pain, ...skipped } = allNo;
  assert.equal(isHighRisk(skipped), true);
});

test('screening: joint problem does not block, but asks for injured areas', () => {
  assert.equal(isHighRisk({ ...allNo, joints: true }), false);
  assert.equal(needsInjuryAreas({ ...allNo, joints: true }), true);
  assert.equal(needsInjuryAreas(allNo), false);
});

test('allowlist: knee injury removes knee exercises; experts and unowned equipment excluded', () => {
  const ids = filterExercises({ equipment: [], injuredAreas: ['knee'] }, LIB).map((e) => e.id);
  assert.deepEqual(ids, ['wall_sit', 'glute_bridge', 'pushup', 'plank']);
  assert.ok(filterExercises({ equipment: ['dumbbell'], injuredAreas: [] }, LIB).some((e) => e.id === 'db_row'));
});

test('validatePlan: rejects non-allowlisted exercise and out-of-cap numbers', () => {
  const allow = filterExercises({ equipment: [], injuredAreas: ['knee'] }, LIB);
  const bad = { week: 1, days: [[{ exerciseId: 'squat', sets: 2, reps: 10 }, { exerciseId: 'plank', sets: 9, reps: 10 }, { exerciseId: 'pushup', sets: 2, reps: 50 }]] };
  const errors = validatePlan(bad, allow, { daysPerWeek: 1 });
  assert.ok(errors.some((e) => e.includes('not allowed: squat')));
  assert.ok(errors.some((e) => e.includes('bad sets 9')));
  assert.ok(errors.some((e) => e.includes('bad reps 50')));
  assert.deepEqual(validatePlan('garbage', allow, { daysPerWeek: 1 }), ['plan.days is not an array']);
});

test('fallbackPlan: always passes validation and has no repeats within a day', () => {
  const allow = filterExercises({ equipment: [], injuredAreas: [] }, LIB);
  for (const daysPerWeek of [1, 3, 5]) {
    const p = fallbackPlan(allow, { daysPerWeek });
    assert.deepEqual(validatePlan(p, allow, { daysPerWeek }), []);
    for (const day of p.days) assert.equal(new Set(day.map((i) => i.exerciseId)).size, day.length);
  }
  assert.throws(() => fallbackPlan(allow.slice(0, 2), { daysPerWeek: 3 }));
});

const PLAN: Plan = { week: 1, days: [[{ exerciseId: 'squat', sets: 2, reps: 10 }, { exerciseId: 'plank', sets: 2, reps: 10 }, { exerciseId: 'pushup', sets: 2, reps: 10 }]] };
const ALL = filterExercises({ equipment: [], injuredAreas: [] }, LIB);

test('adapt: pain swaps to a same-muscle exercise that avoids the painful area, never progresses', () => {
  const r = adaptPlan(PLAN, [log('squat', '2026-09-01', { pain: true, painArea: 'knee', difficulty: 1 }), log('squat', '2026-09-03', { difficulty: 1 })], ALL);
  const item = r.plan.days[0][0];
  assert.equal(item.exerciseId, 'wall_sit'); // lunge also stresses knee → skipped
  assert.equal(item.reps, 10);
  assert.equal(r.plan.week, 2);
});

test('adapt: pain with no safe swap reduces sets', () => {
  const r = adaptPlan(PLAN, [log('plank', '2026-09-01', { pain: true, painArea: 'lower_back' })], ALL);
  assert.deepEqual(r.plan.days[0][1], { exerciseId: 'plank', sets: 1, reps: 10 });
});

test('adapt: too easy twice → capped increase; too hard → decrease', () => {
  const easy = adaptPlan(PLAN, [log('plank', '2026-09-01', { difficulty: 1 }), log('plank', '2026-09-03', { difficulty: 1 })], ALL);
  assert.equal(easy.plan.days[0][1].reps, 12);
  const capped = adaptPlan({ week: 1, days: [[{ exerciseId: 'plank', sets: 3, reps: 15 }]] }, [log('plank', '2026-09-01', { difficulty: 1 }), log('plank', '2026-09-03', { difficulty: 1 })], ALL);
  assert.deepEqual(capped.plan.days[0][0], { exerciseId: 'plank', sets: 3, reps: 15 });
  const hard = adaptPlan(PLAN, [log('pushup', '2026-09-01', { difficulty: 3 })], ALL);
  assert.equal(hard.plan.days[0][2].reps, 8);
});

test('adapt: same pain area on two different days → see a professional', () => {
  const once = adaptPlan(PLAN, [log('squat', '2026-09-01', { pain: true, painArea: 'knee' })], ALL);
  assert.equal(once.seeProfessional, false);
  const twice = adaptPlan(PLAN, [log('squat', '2026-09-01', { pain: true, painArea: 'knee' }), log('squat', '2026-09-03', { pain: true, painArea: 'knee' })], ALL);
  assert.equal(twice.seeProfessional, true);
});
