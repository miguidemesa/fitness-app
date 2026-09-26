/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { filterExercises } from './allowlist.ts';
import { toDbEquipment } from './equipment.ts';
import type { Exercise } from './types.ts';

test('equipment: home gear maps to free-exercise-db values; mat/bar/bench add nothing', () => {
  assert.deepEqual(toDbEquipment('home', ['mat', 'kettlebell', 'dumbbell', 'dumbbell']), ['dumbbell', 'kettlebells']);
  assert.deepEqual(toDbEquipment('outdoors', ['pullup', 'bench']), []);
});

test('equipment: gym unlocks free weights but not machines', () => {
  const gym = toDbEquipment('gym', []);
  assert.ok(gym.includes('dumbbell') && gym.includes('kettlebells'));
  assert.ok(!gym.includes('machine'));
});

test('equipment: mapped values actually unlock matching exercises in the filter', () => {
  const ex = (id: string, equipment: string | null): Exercise => ({ id, name: id, level: 'beginner', equipment, primaryMuscles: ['glutes'], stressAreas: [] });
  const lib = [ex('swing', 'kettlebells'), ex('bridge', 'body only'), ex('press', 'machine')];
  const ids = filterExercises({ equipment: toDbEquipment('home', ['kettlebell']), injuredAreas: [] }, lib).map((e) => e.id);
  assert.deepEqual(ids, ['swing', 'bridge']);
});
