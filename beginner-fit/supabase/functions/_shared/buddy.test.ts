/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buddyStreak, weekday } from './buddy.ts';

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
