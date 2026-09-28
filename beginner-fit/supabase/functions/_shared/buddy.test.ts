/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buddyStreak, mergeProfiles, weekday } from './buddy.ts';
import { fallbackPlan } from './plan.ts';
import type { Exercise, Profile } from './types.ts';
import { filterExercises } from './allowlist.ts';

test('mergeProfiles: shared equipment, union of injuries, shorter plan; both get the same plan', () => {
  const p = (over: Partial<Profile>): Profile => ({ goal: 'get_stronger', daysPerWeek: 3, minutesPerSession: 30, equipment: ['body only', 'dumbbell'], injuredAreas: [], ...over });
  const a = p({ equipment: ['body only', 'dumbbell'], injuredAreas: ['knee'], daysPerWeek: 4 });
  const b = p({ equipment: ['body only'], injuredAreas: ['wrist'], daysPerWeek: 2, minutesPerSession: 20 });
  const m = mergeProfiles(a, b);
  assert.deepEqual(m.equipment, ['body only']);
  assert.deepEqual(m.injuredAreas.sort(), ['knee', 'wrist']);
  assert.equal(m.daysPerWeek, 2);
  assert.equal(m.minutesPerSession, 20);

  const ex = (id: string, area: Exercise['stressAreas'], equipment: string): Exercise =>
    ({ id, name: id, level: 'beginner', equipment, primaryMuscles: [id], stressAreas: area });
  const all = [ex('a', [], 'body only'), ex('b', ['knee'], 'body only'), ex('c', ['wrist'], 'body only'), ex('d', [], 'dumbbell'), ex('e', [], 'body only'), ex('f', [], 'body only')];
  const safe = filterExercises(m, all).sort((x, y) => x.id.localeCompare(y.id));
  assert.deepEqual(safe.map((e) => e.id), ['a', 'e', 'f']); // no knee, no wrist, no dumbbell move
  // The same merged profile from either side gives the same plan.
  const planFrom = (x: Profile, y: Profile) => fallbackPlan(filterExercises(mergeProfiles(x, y), all).sort((q, r) => q.id.localeCompare(r.id)), mergeProfiles(x, y));
  assert.deepEqual(planFrom(a, b).days, planFrom(b, a).days);
});

// 2026-09-28 is a Monday.
test('weekday: Monday is 0, Sunday is 6', () => {
  assert.equal(weekday('2026-09-28'), 0);
  assert.equal(weekday('2026-10-04'), 6);
});

const mwf = { schedule: [0, 2, 4], done: ['2026-09-28', '2026-09-30', '2026-10-02'] };
const tts = { schedule: [1, 3, 5], done: ['2026-09-29', '2026-10-01', '2026-10-03'] };

test('buddyStreak: each person follows their own days; all six days met = 6', () => {
  assert.equal(buddyStreak(mwf, tts, '2026-09-28', '2026-10-03'), 6);
});

test('buddyStreak: breaks when someone misses their own day', () => {
  const missed = { ...tts, done: ['2026-09-29', '2026-10-03'] }; // skipped Thursday Oct 1
  assert.equal(buddyStreak(mwf, missed, '2026-09-28', '2026-10-03'), 2); // Friday and Saturday count after the break
});

test('buddyStreak: today still open does not break; days before pairing are ignored', () => {
  assert.equal(buddyStreak(mwf, tts, '2026-09-28', '2026-10-04'), 6); // Sunday: nobody scheduled
  assert.equal(buddyStreak(mwf, tts, '2026-09-28', '2026-10-05'), 6); // Monday open, not yet logged
  assert.equal(buddyStreak(mwf, tts, '2026-10-02', '2026-10-03'), 2); // paired Fri Oct 2
});

test('buddyStreak: shared day needs both; no schedules = 0', () => {
  const both = { schedule: [0], done: ['2026-09-28'] };
  assert.equal(buddyStreak(both, { schedule: [0], done: [] }, '2026-09-28', '2026-09-29'), 0);
  assert.equal(buddyStreak(both, { schedule: [0], done: ['2026-09-28'] }, '2026-09-28', '2026-09-29'), 1);
  assert.equal(buddyStreak({ schedule: [], done: [] }, { schedule: [], done: [] }, '2026-09-28', '2026-09-29'), 0);
});
