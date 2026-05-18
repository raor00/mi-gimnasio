type RuntimeEnv = Record<string, string | undefined>;

const EXAMPLE_SUPABASE_URL = 'https://your-project.supabase.co';
const EXAMPLE_SUPABASE_ANON_KEY = 'your-anon-key';

function readEnv(name: string) {
  const runtimeEnv = (import.meta as ImportMeta & { env?: RuntimeEnv }).env;

  return runtimeEnv?.[name] ?? process.env[name];
}

function isConfiguredSupabaseUrl(value?: string) {
  return Boolean(value && value !== EXAMPLE_SUPABASE_URL);
}

function isConfiguredSupabaseAnonKey(value?: string) {
  return Boolean(value && value !== EXAMPLE_SUPABASE_ANON_KEY);
}

export function getSupabaseConfig() {
  const url =
    readEnv('PUBLIC_SUPABASE_URL') ||
    readEnv('SUPABASE_URL');

  const anonKey =
    readEnv('PUBLIC_SUPABASE_ANON_KEY') ||
    readEnv('SUPABASE_ANON_KEY');

  const serviceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!isConfiguredSupabaseUrl(url) || !isConfiguredSupabaseAnonKey(anonKey)) {
    const missing = [
      !isConfiguredSupabaseUrl(url) ? 'PUBLIC_SUPABASE_URL (or SUPABASE_URL)' : null,
      !isConfiguredSupabaseAnonKey(anonKey) ? 'PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)' : null,
    ].filter(Boolean).join(', ');

    throw new Error(
      `Missing Supabase environment variables: ${missing}. ` +
      'Copy .env.example to .env, replace the example values with your real Supabase credentials, and restart the dev server.'
    );
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
  };
}
