/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stressAreas } from './stress-tags.ts';

test('stress tags: squats load knee and hip; push-ups load shoulder and wrist', () => {
  assert.deepEqual(stressAreas({ name: 'Bodyweight Squat', primaryMuscles: ['quadriceps'] }), ['knee', 'hip']);
  assert.deepEqual(stressAreas({ name: 'Pushups', primaryMuscles: ['chest'] }), ['shoulder', 'wrist']);
});

test('stress tags: calf raises are ankle-only, not shoulder', () => {
  assert.deepEqual(stressAreas({ name: 'Standing Calf Raises', primaryMuscles: ['calves'] }), ['ankle']);
  assert.ok(stressAreas({ name: 'Side Lateral Raise', primaryMuscles: ['shoulders'] }).includes('shoulder'));
});

test('stress tags: tagging by muscle catches names the keywords miss', () => {
  assert.ok(stressAreas({ name: 'Superman', primaryMuscles: ['lower back'] }).includes('lower_back'));
  assert.deepEqual(stressAreas({ name: 'Plate Pinch', primaryMuscles: ['forearms'] }), ['wrist']);
});
