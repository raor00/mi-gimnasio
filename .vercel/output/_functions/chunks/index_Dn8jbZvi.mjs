import { s as supabaseServerClient } from './supabase-server_C-QUcOYR.mjs';

const GET = async ({ cookies }) => {
  const supabase = supabaseServerClient(cookies);
  const { data, error } = await supabase.from("exercises").select("*").order("name");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
