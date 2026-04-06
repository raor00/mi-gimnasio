import type { APIRoute } from "astro";
import { supabaseServerClient } from "../../../lib/supabase-server";

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const supabase = supabaseServerClient(cookies);
  // Borra la sesión actual
  await supabase.auth.signOut();
  
  return redirect("/login");
};
