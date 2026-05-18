import test from 'node:test';
import assert from 'node:assert/strict';

import { getSupabaseConfig } from '../src/lib/supabase-config.ts';

const ENV_KEYS = [
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

function snapshotEnv() {
  return Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));
}

function restoreEnv(snapshot: Record<string, string | undefined>) {
  for (const key of ENV_KEYS) {
    const value = snapshot[key];

    if (value === undefined) {
      delete process.env[key];
      continue;
    }

    process.env[key] = value;
  }
}

test('getSupabaseConfig lee fallback de process.env cuando import.meta.env no existe', () => {
  const envSnapshot = snapshotEnv();

  try {
    delete process.env.PUBLIC_SUPABASE_URL;
    delete process.env.PUBLIC_SUPABASE_ANON_KEY;
    process.env.SUPABASE_URL = 'https://demo-project.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'demo-anon-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'demo-service-role-key';

    assert.deepEqual(getSupabaseConfig(), {
      url: 'https://demo-project.supabase.co',
      anonKey: 'demo-anon-key',
      serviceRoleKey: 'demo-service-role-key',
    });
  } finally {
    restoreEnv(envSnapshot);
  }
});

test('getSupabaseConfig falla con instrucciones claras cuando faltan variables', () => {
  const envSnapshot = snapshotEnv();

  try {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }

    assert.throws(
      () => getSupabaseConfig(),
      /Missing Supabase environment variables: PUBLIC_SUPABASE_URL \(or SUPABASE_URL\), PUBLIC_SUPABASE_ANON_KEY \(or SUPABASE_ANON_KEY\)\. Copy \.env\.example to \.env/
    );
  } finally {
    restoreEnv(envSnapshot);
  }
});

test('getSupabaseConfig rechaza los placeholders del .env.example', () => {
  const envSnapshot = snapshotEnv();

  try {
    process.env.PUBLIC_SUPABASE_URL = 'https://your-project.supabase.co';
    process.env.PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    assert.throws(
      () => getSupabaseConfig(),
      /replace the example values with your real Supabase credentials/
    );
  } finally {
    restoreEnv(envSnapshot);
  }
});
