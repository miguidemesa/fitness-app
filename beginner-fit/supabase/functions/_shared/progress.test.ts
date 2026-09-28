/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fromLogRow, nextDay, toWorkoutLog } from './progress.ts';

const row = (day: number, over = {}) =>
  fromLogRow({ plan_id: 'p1', day, exercise_id: 'squat', logged_on: '2026-09-26', completed: 'all', difficulty: 2, pain: false, pain_area: null, ...over });

test('nextDay: first unlogged day, ignoring other plans; null when the week is done', () => {
  assert.equal(nextDay(3, 'p1', []), 0);
  assert.equal(nextDay(3, 'p1', [row(0), row(2)]), 1);
  assert.equal(nextDay(3, 'p1', [row(0), row(1), { ...row(2), planId: 'old' }]), 2);
  assert.equal(nextDay(2, 'p1', [row(0), row(1)]), null);
});

test('toWorkoutLog: skipped move is neutral, pain is kept', () => {
  const skipped = toWorkoutLog(row(0, { completed: 'skip', difficulty: null }));
  assert.equal(skipped.completed, false);
  assert.equal(skipped.difficulty, 2);
  assert.equal(toWorkoutLog(row(0, { pain: true, pain_area: 'knee' })).painArea, 'knee');
});
