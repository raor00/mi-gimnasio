import { s as supabaseServerClient } from './supabase-server_DmlcIR_W.mjs';

const POST = async ({ request, cookies, redirect }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  if (!email || !password) {
    return redirect("/register?error=" + encodeURIComponent("Por favor, llena todos los campos"));
  }
  const supabase = supabaseServerClient(cookies);
  const emailRedirectTo = new URL("/auth/confirm", request.url).toString();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo
    }
  });
  if (error) {
    return redirect("/register?error=" + encodeURIComponent(error.message));
  }
  const hasSession = Boolean(data.session);
  const status = hasSession ? "authenticated" : "confirmation_required";
  return redirect(`/register?success=true&status=${status}`);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
