import type { APIRoute } from "astro";
import { supabaseServerClient } from "../../../lib/supabase-server";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return redirect("/register?error=" + encodeURIComponent("Por favor, llena todos los campos"));
  }

  const supabase = supabaseServerClient(cookies);

  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return redirect("/register?error=" + encodeURIComponent(error.message));
  }

  // If email confirmations are disabled in Supabase, this auto-logs them in securely since cookies are set natively
  return redirect("/register?success=true");
};
