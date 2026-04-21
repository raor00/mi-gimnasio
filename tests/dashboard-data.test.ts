import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDashboardViewModel } from '../src/lib/dashboard-data.ts';

function isoDaysAgo(daysAgo: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

test('buildDashboardViewModel convierte queries vacías en empty states amigables', () => {
  const result = buildDashboardViewModel({
    userName: 'Ana',
    activeSession: null,
    routines: [],
    sessions: [],
    recentSets: [],
    historySets: [],
  });

  assert.equal(result.banner.kind, 'default');
  assert.equal(result.kpis.weeklyVolume.total, 0);
  assert.equal(result.kpis.weeklyFrequency.completed, 0);
  assert.equal(result.kpis.streak.value, 0);
  assert.equal(result.kpis.recentPr.value, 'Sin PRs');
  assert.equal(result.predictions.nextPr, null);
  assert.equal(result.chart.series.length, 7);
});

test('buildDashboardViewModel compone KPIs e insights con datos reales', () => {
  const result = buildDashboardViewModel({
    userName: 'Ana',
    activeSession: null,
    routines: [
      {
        id: 'push',
        name: 'Push Day',
        goal: 'strength',
        muscle_groups: ['chest', 'triceps'],
        routine_exercises: [
          { exercises: { muscle_groups: ['chest'] } },
          { exercises: { muscle_groups: ['triceps'] } },
          { exercises: { muscle_groups: ['shoulders'] } },
        ],
      },
      {
        id: 'pull',
        name: 'Pull Day',
        goal: 'hypertrophy',
        muscle_groups: ['back', 'biceps'],
        routine_exercises: [
          { exercises: { muscle_groups: ['back'] } },
          { exercises: { muscle_groups: ['biceps'] } },
        ],
      },
    ],
    sessions: [
      { completed_at: isoDaysAgo(0), routine_name: 'Push Day', muscle_groups: ['chest', 'triceps'], totalVolume: 1000 },
      { completed_at: isoDaysAgo(1), routine_name: 'Pull Day', muscle_groups: ['back', 'biceps'], totalVolume: 900 },
      { completed_at: isoDaysAgo(2), routine_name: 'Push Day', muscle_groups: ['chest', 'triceps'], totalVolume: 800 },
    ],
    recentSets: [
      { logged_at: isoDaysAgo(0), weight: 100, reps: 5, completed: true, exercise_name: 'Bench Press', exercises: { muscle_groups: ['chest'] } },
      { logged_at: isoDaysAgo(1), weight: 90, reps: 6, completed: true, exercise_name: 'Barbell Row', exercises: { muscle_groups: ['back'] } },
    ],
    historySets: [
      { logged_at: isoDaysAgo(10), weight: 90, reps: 5, completed: true, exercise_name: 'Bench Press', exercises: { muscle_groups: ['chest'] } },
      { logged_at: isoDaysAgo(0), weight: 100, reps: 5, completed: true, exercise_name: 'Bench Press', exercises: { muscle_groups: ['chest'] } },
      { logged_at: isoDaysAgo(7), weight: 95, reps: 5, completed: true, exercise_name: 'Bench Press', exercises: { muscle_groups: ['chest'] } },
    ],
  });

  assert.equal(result.kpis.weeklyVolume.total, 1040);
  assert.deepEqual(result.kpis.weeklyFrequency, { completed: 3, goal: 4 });
  assert.equal(result.kpis.streak.value, 3);
  assert.equal(result.kpis.recentPr.value, 'Bench Press');
  assert.equal(result.predictions.nextPr?.predictedWeight, 105);
  assert.equal(result.predictions.recovery[0]?.muscleGroup, 'chest');
  assert.equal(result.predictions.recommendedRoutine?.id, 'pull');
  assert.deepEqual(result.sections.nextRoutine, {
    id: 'pull',
    name: 'Pull Day',
    goalLabel: 'Hipertrofia',
    muscleGroup: 'back',
    estimatedDuration: 20,
    href: '/session?routine_id=pull',
  });
  assert.deepEqual(result.sections.recentSessions.map((session) => session.routineName), ['Push Day', 'Pull Day', 'Push Day']);
  assert.equal(result.sections.recentSessions[0]?.volumeLabel, '1,000 kg');
  assert.equal(result.sections.recentSessions.length, 3);
});

test('buildDashboardViewModel prioriza la sesión activa y limita las sesiones recientes a tres elementos', () => {
  const result = buildDashboardViewModel({
    userName: 'Ana',
    activeSession: { id: 'session-123', routine_name: 'Push Day', started_at: isoDaysAgo(0) },
    routines: [
      {
        id: 'push',
        name: 'Push Day',
        goal: 'strength',
        routine_exercises: [
          { exercises: { muscle_groups: ['chest'] } },
          { exercises: { muscle_groups: ['shoulders'] } },
          { exercises: { muscle_groups: ['triceps'] } },
        ],
      },
    ],
    sessions: [
      { completed_at: isoDaysAgo(0), routine_name: 'Push Day', muscle_groups: ['chest'], totalVolume: 1400 },
      { completed_at: isoDaysAgo(1), routine_name: 'Pull Day', muscle_groups: ['back'], totalVolume: 1200 },
      { completed_at: isoDaysAgo(2), routine_name: 'Leg Day', muscle_groups: ['legs'], totalVolume: 1300 },
      { completed_at: isoDaysAgo(3), routine_name: 'Upper Day', muscle_groups: ['chest'], totalVolume: 900 },
    ],
    recentSets: [],
    historySets: [],
  });

  assert.deepEqual(result.sections.nextRoutine, {
    id: 'push',
    name: 'Push Day',
    goalLabel: 'Fuerza',
    muscleGroup: 'chest',
    estimatedDuration: 30,
    href: '/session?session_id=session-123',
  });
  assert.equal(result.sections.recentSessions.length, 3);
  assert.deepEqual(result.sections.recentSessions.map((session) => session.routineName), ['Push Day', 'Pull Day', 'Leg Day']);
});
