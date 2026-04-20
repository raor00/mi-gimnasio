import { defineMiddleware } from "astro:middleware";
import { supabaseServerClient } from "./lib/supabase-server";

const PUBLIC_ROUTES = ['/login', '/register', '/auth/confirm'];
const API_AUTH_PREFIX = '/api/auth/';

export const onRequest = defineMiddleware(async ({ url, cookies, redirect, locals }, next) => {
  const path = url.pathname;
  const isApiRoute = path.startsWith('/api/');

  locals.auth = null;

  if (PUBLIC_ROUTES.includes(path) || path.startsWith(API_AUTH_PREFIX)) {
    return next();
  }

  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    if (isApiRoute) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return redirect('/login');
  }

  let displayName = session.user.email?.split('@')[0] || 'Usuario';

  if (!isApiRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', session.user.id)
      .maybeSingle();

    displayName = profile?.name || displayName;
  }

  locals.auth = {
    session,
    userId: session.user.id,
    displayName,
    initials: displayName.slice(0, 2).toUpperCase(),
  };

  return next();
});
