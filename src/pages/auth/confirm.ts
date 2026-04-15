import type { APIRoute } from "astro";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServerClient } from "../../lib/supabase-server";

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const nextParam = url.searchParams.get("next") || "/routines";
  const next = nextParam.startsWith("/") ? nextParam : "/routines";

  if (!tokenHash || !type) {
    return redirect("/login?error=" + encodeURIComponent("El enlace de confirmación es inválido o está incompleto"));
  }

  const supabase = supabaseServerClient(cookies);
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    return redirect("/login?error=" + encodeURIComponent("El enlace de confirmación es inválido o expiró. Solicita uno nuevo o regístrate otra vez."));
  }

  return redirect(next);
};
