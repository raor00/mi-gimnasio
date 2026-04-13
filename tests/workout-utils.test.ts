import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clampNullableMetric,
  hasCompletedSets,
  normalizeNumericInput,
  normalizeRoutineExercises,
  normalizeRoutineName,
} from '../src/lib/workout-utils.ts';

test('normalizeRoutineExercises limpia payload y reindexa ejercicios', () => {
  const result = normalizeRoutineExercises([
    { exercise_id: 'bench', order_index: 9, target_sets: 0, target_reps: ' 5-8 ' },
    { exercise_id: '', order_index: 4, target_sets: 12, target_reps: '' },
    { exercise_id: 'row', order_index: 3, target_sets: 15, target_reps: '10' },
  ]);

  assert.deepEqual(result, [
    { exercise_id: 'bench', order_index: 0, target_sets: 3, target_reps: '5-8' },
    { exercise_id: 'row', order_index: 1, target_sets: 10, target_reps: '10' },
  ]);
});

test('normalizeRoutineName recorta espacios', () => {
  assert.equal(normalizeRoutineName('  Push Day  '), 'Push Day');
  assert.equal(normalizeRoutineName(''), '');
});

test('normalizeNumericInput asegura positivos y opcionalmente redondea', () => {
  assert.equal(normalizeNumericInput(-12, 0, false), 0);
  assert.equal(normalizeNumericInput('42.5', 0, false), 42.5);
  assert.equal(normalizeNumericInput('8.9', 0, true), 9);
  assert.equal(normalizeNumericInput('foo', 7, false), 7);
});

test('clampNullableMetric limita RPE y RIR correctamente', () => {
  assert.equal(clampNullableMetric(null, 10, false), null);
  assert.equal(clampNullableMetric('', 10, false), null);
  assert.equal(clampNullableMetric('12', 10, false), 10);
  assert.equal(clampNullableMetric('7.7', 10, true), 8);
});

test('hasCompletedSets detecta si al menos una serie fue completada', () => {
  assert.equal(hasCompletedSets([]), false);
  assert.equal(hasCompletedSets([{ completed: false }, { completed: false }]), false);
  assert.equal(hasCompletedSets([{ completed: false }, { completed: true }]), true);
});
