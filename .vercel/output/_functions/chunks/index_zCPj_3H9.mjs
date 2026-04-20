import { s as supabaseServerClient } from './supabase-server_DmlcIR_W.mjs';

const GET = async ({ cookies, url, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const range = url.searchParams.get("range") || "30d";
  const days = range === "7d" ? 7 : range === "6m" ? 180 : 30;
  const since = /* @__PURE__ */ new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase.from("workout_sessions").select("*").eq("user_id", userId).not("completed_at", "is", null).gte("completed_at", since.toISOString()).order("completed_at", { ascending: false });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
};
const POST = async ({ cookies, request, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const body = await request.json();
  const { routine_id, routine_name } = body;
  if (!routine_id || !routine_name?.trim()) {
    return new Response(JSON.stringify({ error: "routine_id and routine_name are required" }), { status: 400 });
  }
  const { data: existingSession } = await supabase.from("workout_sessions").select("id, routine_id, routine_name, started_at").eq("user_id", userId).is("completed_at", null).is("cancelled_at", null).order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (existingSession) {
    return new Response(JSON.stringify(existingSession), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }
  const { data, error } = await supabase.from("workout_sessions").insert({
    user_id: userId,
    routine_id,
    routine_name: routine_name.trim()
  }).select().single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
