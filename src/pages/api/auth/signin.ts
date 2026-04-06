import type { APIRoute } from "astro";
import { supabaseServerClient } from "../../../lib/supabase-server";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return redirect("/login?error=" + encodeURIComponent("Ingresa tu correo y contraseña"));
  }

  const supabase = supabaseServerClient(cookies);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/login?error=" + encodeURIComponent(error.message));
  }

  return redirect("/routines");
};
