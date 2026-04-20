import { s as supabaseServerClient } from './supabase-server_DmlcIR_W.mjs';

const GET = async ({ cookies, redirect }) => {
  const supabase = supabaseServerClient(cookies);
  await supabase.auth.signOut();
  return redirect("/login");
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
