import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

/**
 * Creates securely integrated Supabase client configured to use the server's cookies.
 * This ensures cookies are automatically written/read protecting the browser's access tokens.
 * ONLY TO BE USED inside `.astro` files frontmatter, middleware, or `api` routes where Astro.cookies is accessible.
 */
export const supabaseServerClient = (cookies: AstroCookies) => {
  return createServerClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(key: string) {
          return cookies.get(key)?.value;
        },
        set(key: string, value: string, options: CookieOptions) {
          cookies.set(key, value, {
            ...options,
            path: "/"
          });
        },
        remove(key: string, options: CookieOptions) {
          cookies.delete(key, {
            ...options,
            path: "/"
          });
        },
      },
    }
  );
};
