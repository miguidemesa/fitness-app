/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fromLogRow, nextDay, stageFor, toWorkoutLog, weeklyStreak } from './progress.ts';

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

test('weeklyStreak: consecutive Mon–Sun weeks, this week may still be empty, a gap resets', () => {
  const on = (d: string) => row(0, { logged_on: d });
  // 2026-09-28 is a Monday.
  assert.equal(weeklyStreak([], '2026-09-30'), 0);
  assert.equal(weeklyStreak([on('2026-09-28')], '2026-09-30'), 1);
  assert.equal(weeklyStreak([on('2026-09-21'), on('2026-09-15')], '2026-09-30'), 2); // this week empty: not broken yet
  assert.equal(weeklyStreak([on('2026-09-28'), on('2026-09-13')], '2026-09-30'), 1); // gap week of Sep 21
  assert.equal(weeklyStreak([on('2026-09-06')], '2026-09-30'), 0); // last week missed
  assert.equal(weeklyStreak([on('2026-09-27'), on('2026-09-28')], '2026-09-28'), 2); // Sunday and Monday are different weeks
  assert.equal(weeklyStreak([row(0, { logged_on: '2026-09-28', completed: 'skip', difficulty: null })], '2026-09-28'), 0);
});

test('stageFor: thresholds and next stage', () => {
  assert.equal(stageFor(0).stage.name, 'Pup');
  assert.equal(stageFor(4).stage.name, 'Athlete');
  assert.equal(stageFor(3).next?.name, 'Athlete');
  assert.equal(stageFor(99).next, null);
});
