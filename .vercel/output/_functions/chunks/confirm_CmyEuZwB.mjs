import { s as supabaseServerClient } from './supabase-server_C-QUcOYR.mjs';

const GET = async ({ url, cookies, redirect }) => {
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const nextParam = url.searchParams.get("next") || "/routines";
  const next = nextParam.startsWith("/") ? nextParam : "/routines";
  if (!tokenHash || !type) {
    return redirect("/login?error=" + encodeURIComponent("El enlace de confirmación es inválido o está incompleto"));
  }
  const supabase = supabaseServerClient(cookies);
  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type
  });
  if (error) {
    return redirect("/login?error=" + encodeURIComponent("El enlace de confirmación es inválido o expiró. Solicita uno nuevo o regístrate otra vez."));
  }
  return redirect(next);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
