import test from 'node:test';
import assert from 'node:assert/strict';

import { handleProfileGet, handleProfilePost } from '../src/lib/profile-api.ts';

test('handleProfileGet rechaza usuarios no autenticados', async () => {
  const response = await handleProfileGet({
    userId: null,
    repo: { getByUserId: async () => null, upsertByUserId: async () => ({ id: 'user-1' }) },
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: 'Unauthorized' });
});

test('handleProfileGet devuelve el perfil actual del usuario autenticado', async () => {
  const response = await handleProfileGet({
    userId: 'user-1',
    repo: {
      getByUserId: async (userId) => ({
        id: userId,
        name: 'Ana',
        age: 29,
        weekly_goal_sessions: 5,
        preferred_units: 'kg',
      }),
      upsertByUserId: async () => ({ id: 'user-1' }),
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    id: 'user-1',
    name: 'Ana',
    age: 29,
    weekly_goal_sessions: 5,
    preferred_units: 'kg',
  });
});

test('handleProfilePost valida rangos y catálogos permitidos', async () => {
  const response = await handleProfilePost({
    userId: 'user-1',
    body: {
      name: 'Ana',
      age: 9,
      gender: 'No válido',
      preferred_units: 'stones',
    },
    repo: {
      getByUserId: async () => null,
      upsertByUserId: async () => {
        throw new Error('no debería ejecutarse');
      },
    },
  });

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    error: 'Edad fuera de rango. Usa un valor entre 10 y 120.',
  });
});

test('handleProfilePost normaliza y guarda los campos editables del perfil', async () => {
  let savedPayload: Record<string, unknown> | null = null;

  const response = await handleProfilePost({
    userId: 'user-1',
    body: {
      name: '  Ana María  ',
      age: '30',
      height_cm: '168',
      weight_kg: '62.5',
      gender: 'Femenino',
      experience_level: 'Intermedio',
      weekly_goal_sessions: '5',
      preferred_units: 'lbs',
    },
    repo: {
      getByUserId: async () => null,
      upsertByUserId: async (userId, payload) => {
        savedPayload = { userId, ...payload };
        return {
          id: userId,
          ...payload,
        };
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(savedPayload, {
    userId: 'user-1',
    name: 'Ana María',
    age: 30,
    height_cm: 168,
    weight_kg: 62.5,
    gender: 'Femenino',
    experience_level: 'Intermedio',
    weekly_goal_sessions: 5,
    preferred_units: 'lbs',
  });
  assert.deepEqual(await response.json(), {
    success: true,
    profile: {
      id: 'user-1',
      name: 'Ana María',
      age: 30,
      height_cm: 168,
      weight_kg: 62.5,
      gender: 'Femenino',
      experience_level: 'Intermedio',
      weekly_goal_sessions: 5,
      preferred_units: 'lbs',
    },
  });
});
