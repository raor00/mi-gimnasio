import { createServerClient } from '@supabase/ssr';

const supabaseServerClient = (cookies) => {
  return createServerClient(
    undefined                                   ,
    undefined                                        ,
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
