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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return redirect("/register?error=" + encodeURIComponent(error.message));
  }

  const hasSession = Boolean(data.session);
  const status = hasSession ? 'authenticated' : 'confirmation_required';

  return redirect(`/register?success=true&status=${status}`);
};
