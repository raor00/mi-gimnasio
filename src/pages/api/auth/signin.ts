import type { APIRoute } from "astro";
import { supabaseServerClient } from "../../../lib/supabase-server";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  const normalizeAuthError = (message: string) => {
    if (message.toLowerCase().includes('email not confirmed')) {
      return 'Tu correo todavía no está confirmado. Revisa tu bandeja de entrada o desactiva la confirmación de email en Supabase Auth si quieres acceso inmediato en local.';
    }

    return message;
  };

  if (!email || !password) {
    return redirect("/login?error=" + encodeURIComponent("Ingresa tu correo y contraseña"));
  }

  const supabase = supabaseServerClient(cookies);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect("/login?error=" + encodeURIComponent(normalizeAuthError(error.message)));
  }

  return redirect("/routines");
};
