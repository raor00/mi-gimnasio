import test from 'node:test';
import assert from 'node:assert/strict';

import {
  detectOvertraining,
  getMuscleRecoveryStatus,
  getRecentPRs,
  getRecommendedRoutine,
  getSmartBannerState,
  getStreak,
  getWeeklyFrequency,
  getWeeklyVolume,
  predictNextPR,
} from '../src/lib/predictions.ts';

function isoDaysAgo(daysAgo: number, hour = 12) {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

test('getSmartBannerState prioriza sesión activa sobre otros estados', () => {
  const result = getSmartBannerState(
    { id: 'session-1', routine_name: 'Push Day', started_at: isoDaysAgo(0) },
    [{ completed_at: isoDaysAgo(2), routine_name: 'Leg Day' }],
    [
      { logged_at: isoDaysAgo(0), weight: 100, reps: 5, completed: true, exercise_name: 'Bench Press' },
      { logged_at: isoDaysAgo(0), weight: 105, reps: 5, completed: true, exercise_name: 'Bench Press' },
    ],
    [{ id: 'routine-1', name: 'Leg Day' }],
    'Ana',
  );

  assert.equal(result.kind, 'active-session');
  assert.equal(result.cta.href, '/session?session_id=session-1');
  assert.match(result.title, /Continua/i);
});

test('getSmartBannerState muestra streak en riesgo cuando el usuario lleva dos días sin entrenar', () => {
  const result = getSmartBannerState(
    null,
    [
      { completed_at: isoDaysAgo(2), routine_name: 'Pull Day' },
      { completed_at: isoDaysAgo(3), routine_name: 'Push Day' },
      { completed_at: isoDaysAgo(4), routine_name: 'Leg Day' },
    ],
    [],
    [{ id: 'routine-1', name: 'Push Day' }],
    'Ana',
  );

  assert.equal(result.kind, 'streak-risk');
  assert.match(result.description, /racha/i);
});

test('getSmartBannerState sugiere una rutina cuando no hay alertas más importantes', () => {
  const result = getSmartBannerState(
    null,
    [
      { completed_at: isoDaysAgo(4), routine_name: 'Push Day', muscle_groups: ['chest', 'triceps'] },
      { completed_at: isoDaysAgo(1), routine_name: 'Leg Day', muscle_groups: ['legs'] },
    ],
    [],
    [
      { id: 'push', name: 'Push Day', muscle_groups: ['chest', 'triceps'] },
      { id: 'pull', name: 'Pull Day', muscle_groups: ['back', 'biceps'] },
    ],
    'Ana',
  );

  assert.equal(result.kind, 'suggested-routine');
  assert.equal(result.cta.href, '/session?routine_id=pull');
});

test('getSmartBannerState recomienda descanso cuando detecta sobrecarga reciente', () => {
  const sets = [
    { logged_at: isoDaysAgo(0), weight: 120, reps: 8, completed: true, exercise_name: 'Squat' },
    { logged_at: isoDaysAgo(0), weight: 120, reps: 8, completed: true, exercise_name: 'Squat' },
    { logged_at: isoDaysAgo(0), weight: 120, reps: 8, completed: true, exercise_name: 'Squat' },
    { logged_at: isoDaysAgo(1), weight: 40, reps: 10, completed: true, exercise_name: 'Bench Press' },
    { logged_at: isoDaysAgo(2), weight: 40, reps: 10, completed: true, exercise_name: 'Bench Press' },
    { logged_at: isoDaysAgo(3), weight: 40, reps: 10, completed: true, exercise_name: 'Bench Press' },
  ];

  const result = getSmartBannerState(
    null,
    [{ completed_at: isoDaysAgo(0), routine_name: 'Leg Day' }],
    sets,
    [],
    'Ana',
  );

  assert.equal(result.kind, 'recovery');
  assert.match(result.description, /descanso/i);
});

test('getSmartBannerState muestra PR reciente cuando no hay otros estados prioritarios', () => {
  const result = getSmartBannerState(
    null,
    [{ completed_at: isoDaysAgo(0), routine_name: 'Push Day' }],
    [
      { logged_at: isoDaysAgo(8), weight: 90, reps: 5, completed: true, exercise_name: 'Bench Press' },
      { logged_at: isoDaysAgo(1), weight: 95, reps: 5, completed: true, exercise_name: 'Bench Press' },
    ],
    [],
    'Ana',
  );

  assert.equal(result.kind, 'recent-pr');
  assert.match(result.title, /PR/i);
});

test('getSmartBannerState devuelve fallback amigable cuando no hay datos relevantes', () => {
  const result = getSmartBannerState(null, [], [], [], 'Ana');

  assert.equal(result.kind, 'default');
  assert.match(result.title, /Ana/);
});

test('getWeeklyVolume devuelve siete días con volumen agrupado y relleno en cero', () => {
  const result = getWeeklyVolume([
    { logged_at: isoDaysAgo(0), weight: 100, reps: 5, completed: true },
    { logged_at: isoDaysAgo(0), weight: 60, reps: 10, completed: true },
    { logged_at: isoDaysAgo(2), weight: 80, reps: 8, completed: true },
    { logged_at: isoDaysAgo(9), weight: 200, reps: 1, completed: true },
  ]);

  assert.equal(result.length, 7);
  assert.equal(result.at(-1)?.volume, 1100);
  assert.equal(result.at(-3)?.volume, 640);
  assert.equal(result.at(0)?.volume, 0);
});

test('getWeeklyFrequency cuenta sesiones completadas y conserva la meta semanal', () => {
  assert.deepEqual(getWeeklyFrequency([], 4), { completed: 0, goal: 4 });
  assert.deepEqual(getWeeklyFrequency([{ completed_at: isoDaysAgo(0) }, { completed_at: isoDaysAgo(3) }], 4), { completed: 2, goal: 4 });
  assert.deepEqual(
    getWeeklyFrequency([
      { completed_at: isoDaysAgo(0) },
      { completed_at: isoDaysAgo(1) },
      { completed_at: isoDaysAgo(2) },
      { completed_at: isoDaysAgo(3) },
      { completed_at: isoDaysAgo(4) },
    ], 4),
    { completed: 5, goal: 4 },
  );
});

test('getStreak calcula días consecutivos a partir de la sesión más reciente', () => {
  assert.equal(getStreak([]), 0);
  assert.equal(getStreak([{ completed_at: isoDaysAgo(1) }, { completed_at: isoDaysAgo(2) }, { completed_at: isoDaysAgo(3) }]), 3);
  assert.equal(getStreak([{ completed_at: isoDaysAgo(1) }, { completed_at: isoDaysAgo(3) }]), 1);
});

test('getRecentPRs detecta PRs recientes por ejercicio y calcula la mejora', () => {
  const result = getRecentPRs([
    { logged_at: isoDaysAgo(10), weight: 90, reps: 5, completed: true, exercise_name: 'Bench Press' },
    { logged_at: isoDaysAgo(3), weight: 95, reps: 5, completed: true, exercise_name: 'Bench Press' },
    { logged_at: isoDaysAgo(8), weight: 120, reps: 3, completed: true, exercise_name: 'Squat' },
    { logged_at: isoDaysAgo(2), weight: 125, reps: 3, completed: true, exercise_name: 'Squat' },
  ]);

  assert.equal(result.length, 2);
  assert.equal(result[0]?.exerciseName, 'Squat');
  assert.equal(result[0]?.increase, 5);
  assert.equal(result[1]?.exerciseName, 'Bench Press');
});

test('getMuscleRecoveryStatus clasifica músculos según horas desde el último entrenamiento', () => {
  const result = getMuscleRecoveryStatus([], [
    { logged_at: isoDaysAgo(1), completed: true, exercises: { muscle_groups: ['chest'] } },
    { logged_at: isoDaysAgo(3), completed: true, exercises: { muscle_groups: ['back'] } },
    { logged_at: isoDaysAgo(6), completed: true, exercises: { muscle_groups: ['legs'] } },
  ]);

  assert.deepEqual(
    result.map((item) => [item.muscleGroup, item.status]),
    [
      ['chest', 'recovering'],
      ['back', 'ready'],
      ['legs', 'fully-recovered'],
    ],
  );
});

test('getMuscleRecoveryStatus devuelve vacío sin historial', () => {
  assert.deepEqual(getMuscleRecoveryStatus([], []), []);
});

test('predictNextPR proyecta una progresión simple al alza', () => {
  const result = predictNextPR([
    { logged_at: isoDaysAgo(14), weight: 90 },
    { logged_at: isoDaysAgo(7), weight: 92.5 },
    { logged_at: isoDaysAgo(0), weight: 95 },
  ]);

  assert.equal(result?.predictedWeight, 97.5);
  assert.equal(result?.trend, 'up');
});

test('predictNextPR detecta tendencia plana y datos insuficientes', () => {
  const flat = predictNextPR([
    { logged_at: isoDaysAgo(14), weight: 80 },
    { logged_at: isoDaysAgo(7), weight: 80 },
    { logged_at: isoDaysAgo(0), weight: 80 },
  ]);

  assert.equal(flat?.predictedWeight, 80);
  assert.equal(flat?.trend, 'flat');
  assert.equal(predictNextPR([{ logged_at: isoDaysAgo(0), weight: 100 }]), null);
});

test('detectOvertraining detecta sobrecarga por volumen superior al 30% y respeta el borde', () => {
  const overloaded = detectOvertraining([
    { completed_at: isoDaysAgo(0), totalVolume: 1600 },
    { completed_at: isoDaysAgo(2), totalVolume: 1000 },
    { completed_at: isoDaysAgo(4), totalVolume: 1000 },
  ]);
  const borderline = detectOvertraining([
    { completed_at: isoDaysAgo(0), totalVolume: 1300 },
    { completed_at: isoDaysAgo(2), totalVolume: 1000 },
    { completed_at: isoDaysAgo(4), totalVolume: 1000 },
  ]);

  assert.equal(overloaded.isOvertraining, true);
  assert.match(overloaded.message, /30%/);
  assert.equal(borderline.isOvertraining, false);
  assert.equal(detectOvertraining([]).isOvertraining, false);
});

test('getRecommendedRoutine devuelve la rutina con más descanso, desempata por orden alfabético y maneja vacío', () => {
  const routines = [
    { id: 'push', name: 'Push Day', muscle_groups: ['chest', 'triceps'] },
    { id: 'legs', name: 'Leg Day', muscle_groups: ['legs'] },
    { id: 'pull', name: 'Pull Day', muscle_groups: ['back', 'biceps'] },
  ];

  const withHistory = getRecommendedRoutine(routines, [
    { completed_at: isoDaysAgo(1), routine_name: 'Leg Day', muscle_groups: ['legs'] },
    { completed_at: isoDaysAgo(2), routine_name: 'Push Day', muscle_groups: ['chest', 'triceps'] },
    { completed_at: isoDaysAgo(5), routine_name: 'Pull Day', muscle_groups: ['back', 'biceps'] },
  ]);

  const tie = getRecommendedRoutine(
    [
      { id: 'a', name: 'Arms Day', muscle_groups: ['biceps'] },
      { id: 'b', name: 'Back Day', muscle_groups: ['back'] },
    ],
    [],
  );

  assert.equal(withHistory?.id, 'pull');
  assert.equal(tie?.id, 'a');
  assert.equal(getRecommendedRoutine([], []).id, null);
});
