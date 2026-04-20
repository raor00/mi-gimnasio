import { s as supabaseServerClient } from './supabase-server_C-QUcOYR.mjs';
import { c as clampNullableMetric, b as normalizeNumericInput } from './workout-utils_kQPgPin9.mjs';

const POST = async ({ cookies, params, request, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const body = await request.json();
  const { exercise_id, exercise_name, set_number, weight, reps, rpe, rir, completed } = body;
  if (!exercise_id || !exercise_name || !Number.isFinite(set_number) || set_number <= 0) {
    return new Response(JSON.stringify({ error: "Invalid set payload" }), { status: 400 });
  }
  const safeWeight = normalizeNumericInput(weight, 0, false);
  const safeReps = normalizeNumericInput(reps, 0, true);
  const safeRpe = clampNullableMetric(rpe, 10, false);
  const safeRir = clampNullableMetric(rir, 10, true);
  const { data, error } = await supabase.from("session_sets").insert({
    session_id: params.id,
    exercise_id,
    exercise_name,
    set_number,
    weight: safeWeight,
    reps: safeReps,
    rpe: safeRpe,
    rir: safeRir,
    completed: Boolean(completed)
  }).select().single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { "Content-Type": "application/json" }
  });
};
const PUT = async ({ cookies, request, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const body = await request.json();
  const { set_id, weight, reps, completed, rpe, rir } = body;
  if (!set_id) {
    return new Response(JSON.stringify({ error: "set_id is required" }), { status: 400 });
  }
  const updates = {};
  if (weight !== void 0) updates.weight = normalizeNumericInput(weight, 0, false);
  if (reps !== void 0) updates.reps = normalizeNumericInput(reps, 0, true);
  if (completed !== void 0) updates.completed = completed;
  if (rpe !== void 0) updates.rpe = clampNullableMetric(rpe, 10, false);
  if (rir !== void 0) updates.rir = clampNullableMetric(rir, 10, true);
  const { data, error } = await supabase.from("session_sets").update(updates).eq("id", set_id).select().single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
