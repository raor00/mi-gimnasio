import { createServerClient } from '@supabase/ssr';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "PUBLIC_SUPABASE_ANON_KEY": "test-anon", "PUBLIC_SUPABASE_URL": "https://example.supabase.co", "SITE": undefined, "SSR": true};
function readEnv(name) {
  return Object.assign(__vite_import_meta_env__, { _: "/Users/Jefemac/Documents/GitHub/mi-gimnasio/node_modules/.bin/astro", SUPABASE_SERVICE_ROLE_KEY: "test-service" })[name] || process.env[name];
}
function getSupabaseConfig() {
  const url = readEnv("PUBLIC_SUPABASE_URL") || readEnv("SUPABASE_URL");
  const anonKey = readEnv("PUBLIC_SUPABASE_ANON_KEY") || readEnv("SUPABASE_ANON_KEY");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anonKey) {
    const missing = [
      !url ? "PUBLIC_SUPABASE_URL (or SUPABASE_URL)" : null,
      !anonKey ? "PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_ANON_KEY)" : null
    ].filter(Boolean).join(", ");
    throw new Error(`Missing Supabase environment variables: ${missing}`);
  }
  return {
    url,
    anonKey,
    serviceRoleKey
  };
}

const supabaseServerClient = (cookies) => {
  const { url, anonKey } = getSupabaseConfig();
  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        get(key) {
          return cookies.get(key)?.value;
        },
        set(key, value, options) {
          cookies.set(key, value, {
            ...options,
            path: "/"
          });
        },
        remove(key, options) {
          cookies.delete(key, {
            ...options,
            path: "/"
          });
        }
      }
    }
  );
};

export { supabaseServerClient as s };
