/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { completedFromSets, historyFrom, newBests, sessionFocus, setStats, weekDots, workoutsThisWeek, type SetLog } from './session.ts';
import type { LogEntry } from './types.ts';

const set = (reps: number, weightKg: number | null = null, done = true): SetLog => ({ reps, weightKg, done });
const log = (day: number, loggedOn: string, over: Partial<LogEntry> = {}): LogEntry => ({
  planId: 'p1',
  day,
  exerciseId: 'squat',
  loggedOn,
  completed: 'all',
  difficulty: 2,
  pain: false,
  painArea: null,
  ...over,
});

test('completedFromSets: all done, some done, none done', () => {
  assert.equal(completedFromSets([set(10), set(10)]), 'all');
  assert.equal(completedFromSets([set(10), set(10, null, false)]), 'some');
  assert.equal(completedFromSets([set(10, null, false)]), 'skip');
  assert.equal(completedFromSets([]), 'skip');
});

test('sessionFocus: names the day by where most of the work is', () => {
  assert.equal(sessionFocus(['quadriceps', 'glutes', 'hamstrings', 'calves', 'chest']), 'Lower body');
  assert.equal(sessionFocus(['chest', 'shoulders', 'triceps', 'lats']), 'Upper body');
  assert.equal(sessionFocus(['quadriceps', 'chest', 'abdominals', 'lats']), 'Full body');
  assert.equal(sessionFocus(['abdominals', 'abdominals', 'lower back']), 'Core');
  assert.equal(sessionFocus([]), 'Full body');
});

test('setStats: counts only done sets; volume only where there is weight', () => {
  const stats = setStats([[set(10, 8), set(8, 8), set(10, 8, false)], [set(12)]]);
  assert.deepEqual(stats, { sets: 3, reps: 30, volumeKg: 144 });
});

test('workoutsThisWeek: distinct sessions this Mon–Sun, skipped-only sessions do not count', () => {
  // 2026-10-05 is a Monday.
  const logs = [
    log(0, '2026-10-05'),
    log(0, '2026-10-05', { exerciseId: 'pushup' }),
    log(1, '2026-10-07', { completed: 'skip', difficulty: null }),
    log(2, '2026-10-03'), // last week
  ];
  assert.equal(workoutsThisWeek(logs, '2026-10-09'), 1);
});

test('weekDots: Mon–Sun with scheduled, done and today flags', () => {
  const dots = weekDots([0, 2, 4], [log(0, '2026-10-05')], '2026-10-07');
  assert.equal(dots.length, 7);
  assert.deepEqual(dots[0], { label: 'M', scheduled: true, done: true, today: false });
  assert.deepEqual(dots[2], { label: 'W', scheduled: true, done: false, today: true });
  assert.deepEqual(dots[1], { label: 'T', scheduled: false, done: false, today: false });
});

test('newBests: beats the previous heaviest weight, or most reps for bodyweight; first time is not a best', () => {
  const history = { goblet: [[set(10, 8)]], pushup: [[set(8), set(9)]] };
  const bests = newBests(
    [
      { exerciseId: 'goblet', sets: [set(10, 10)] },
      { exerciseId: 'pushup', sets: [set(10)] },
      { exerciseId: 'plank', sets: [set(30)] },
      { exerciseId: 'goblet2', sets: [set(5, 4, false)] },
    ],
    history,
  );
  assert.deepEqual(bests, [
    { exerciseId: 'goblet', kind: 'weight', value: 10 },
    { exerciseId: 'pushup', kind: 'reps', value: 10 },
  ]);
});

test('historyFrom: past sets per move (oldest first, only ones with a set done) and seconds per workout', () => {
  const a = [set(10, 8)];
  const b = [set(10, 10)];
  const history = historyFrom(
    [
      log(0, '2026-10-05', { sets: a }),
      log(0, '2026-10-05', { exerciseId: 'pushup' }), // logged before sets existed
      log(1, '2026-10-07', { exerciseId: 'plank', sets: [set(30, null, false)] }), // nothing done
      log(2, '2026-10-09', { sets: b }),
    ],
    [{ planId: 'p1', day: 0, loggedOn: '2026-10-05', seconds: 1500, note: null }],
  );
  assert.deepEqual(history.sets, { squat: [a, b] });
  assert.deepEqual(history.seconds, { 'p1:0': 1500 });
});
