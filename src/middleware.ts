import { defineMiddleware } from "astro:middleware";
import { supabaseServerClient } from "./lib/supabase-server";

const PUBLIC_ROUTES = ['/login', '/register'];
const API_AUTH_PREFIX = '/api/auth/';

export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {
  const path = url.pathname;

  if (PUBLIC_ROUTES.includes(path) || path.startsWith(API_AUTH_PREFIX)) {
    return next();
  }

  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return redirect('/login');
  }

  return next();
});
