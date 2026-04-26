import test from 'node:test';
import assert from 'node:assert/strict';

import { handleProgressGet, handleProgressPost } from '../src/lib/progress-api.ts';

test('handleProgressGet rechaza usuarios no autenticados', async () => {
  const response = await handleProgressGet({
    userId: null,
    repo: { listRecentByUserId: async () => [], insertByUserId: async () => ({ log_date: '2026-04-24' }) },
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Unauthorized' });
});

test('handleProgressGet devuelve los registros recientes ordenados por fecha', async () => {
  const response = await handleProgressGet({
    userId: 'user-1',
    repo: {
      listRecentByUserId: async () => ([
        { id: '2', log_date: '2026-04-20', fatigue_level: 5 },
        { id: '1', log_date: '2026-04-21', fatigue_level: 8 },
      ]),
      insertByUserId: async () => ({ log_date: '2026-04-24' }),
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    logs: [
      { id: '1', log_date: '2026-04-21', fatigue_level: 8 },
      { id: '2', log_date: '2026-04-20', fatigue_level: 5 },
    ],
  });
});

test('handleProgressPost valida síntomas permitidos y rangos de bienestar', async () => {
  const response = await handleProgressPost({
    userId: 'user-1',
    body: {
      log_date: '2026-04-24',
      fatigue_level: 11,
      symptoms: ['Dolor inventado'],
    },
    repo: {
      listRecentByUserId: async () => [],
      insertByUserId: async () => {
        throw new Error('no debería ejecutarse');
      },
    },
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Nivel de fatiga fuera de rango. Usa un valor entre 1 y 10.',
  });
});

test('handleProgressPost normaliza y registra una nueva entrada de progreso', async () => {
  let savedPayload: Record<string, unknown> | null = null;

  const response = await handleProgressPost({
    userId: 'user-1',
    body: {
      log_date: '2026-04-24',
      body_weight_kg: '79.4',
      body_fat_pct: '16.2',
      arm_cm: '38',
      chest_cm: '108',
      waist_cm: '82',
      thigh_cm: '61',
      fatigue_level: '7',
      energy_level: '3',
      sleep_quality: '6',
      symptoms: ['Dolor de espalda', 'Tensión muscular', 'Dolor de espalda'],
      notes: '  Ajustar descarga esta semana.  ',
    },
    repo: {
      listRecentByUserId: async () => [],
      insertByUserId: async (userId, payload) => {
        savedPayload = { userId, ...payload };
        return {
          id: 'log-1',
          user_id: userId,
          created_at: '2026-04-24T09:00:00.000Z',
          ...payload,
        };
      },
    },
  });

  assert.equal(response.status, 201);
  assert.deepEqual(savedPayload, {
    userId: 'user-1',
    log_date: '2026-04-24',
    body_weight_kg: 79.4,
    body_fat_pct: 16.2,
    arm_cm: 38,
    chest_cm: 108,
    waist_cm: 82,
    thigh_cm: 61,
    fatigue_level: 7,
    energy_level: 3,
    sleep_quality: 6,
    symptoms: ['Dolor de espalda', 'Tensión muscular'],
    notes: 'Ajustar descarga esta semana.',
  });
  assert.deepEqual(await response.json(), {
    success: true,
    log: {
      id: 'log-1',
      user_id: 'user-1',
      created_at: '2026-04-24T09:00:00.000Z',
      log_date: '2026-04-24',
      body_weight_kg: 79.4,
      body_fat_pct: 16.2,
      arm_cm: 38,
      chest_cm: 108,
      waist_cm: 82,
      thigh_cm: 61,
      fatigue_level: 7,
      energy_level: 3,
      sleep_quality: 6,
      symptoms: ['Dolor de espalda', 'Tensión muscular'],
      notes: 'Ajustar descarga esta semana.',
    },
  });
});
