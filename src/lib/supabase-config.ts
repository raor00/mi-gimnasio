function readEnv(name: string) {
  return import.meta.env[name] || process.env[name];
}

export function getSupabaseConfig() {
  const url =
    readEnv('PUBLIC_SUPABASE_URL') ||
    readEnv('SUPABASE_URL');

  const anonKey =
    readEnv('PUBLIC_SUPABASE_ANON_KEY') ||
    readEnv('SUPABASE_ANON_KEY');

  const serviceRoleKey = readEnv('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !anonKey) {
    const missing = [
      !url ? 'PUBLIC_SUPABASE_URL (or SUPABASE_URL)' : null,
      !anonKey ? 'PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)' : null,
    ].filter(Boolean).join(', ');

    throw new Error(`Missing Supabase environment variables: ${missing}`);
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
  };
}
