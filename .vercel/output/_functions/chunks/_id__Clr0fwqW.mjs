import { s as supabaseServerClient } from './supabase-server_C-QUcOYR.mjs';
import { n as normalizeRoutineName, a as normalizeRoutineExercises } from './workout-utils_kQPgPin9.mjs';

const GET = async ({ cookies, params, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const { data, error } = await supabase.from("routines").select(`
      *,
      routine_exercises (
        id,
        order_index,
        target_sets,
        target_reps,
        exercises (id, name, muscle_groups, category, equipment)
      )
    `).eq("id", params.id).eq("user_id", userId).single();
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404 });
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" }
  });
};
const PUT = async ({ cookies, params, request, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const body = await request.json();
  const { name, goal, exercises } = body;
  const normalizedName = normalizeRoutineName(name);
  const normalizedExercises = normalizeRoutineExercises(exercises || []);
  if (!normalizedName) {
    return new Response(JSON.stringify({ error: "Routine name is required" }), { status: 400 });
  }
  if (normalizedName.length > 80) {
    return new Response(JSON.stringify({ error: "Routine name is too long" }), { status: 400 });
  }
  if (normalizedExercises.length === 0) {
    return new Response(JSON.stringify({ error: "Add at least one exercise" }), { status: 400 });
  }
  const { error: updateError } = await supabase.from("routines").update({
    name: normalizedName,
    goal,
    estimated_duration: normalizedExercises.length * 10,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", params.id).eq("user_id", userId);
  if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
  await supabase.from("routine_exercises").delete().eq("routine_id", params.id);
  if (normalizedExercises.length > 0) {
    const exerciseRows = normalizedExercises.map((ex) => ({
      routine_id: params.id,
      exercise_id: ex.exercise_id,
      order_index: ex.order_index,
      target_sets: ex.target_sets || 3,
      target_reps: ex.target_reps || "8-12"
    }));
    const { error: exError } = await supabase.from("routine_exercises").insert(exerciseRows);
    if (exError) return new Response(JSON.stringify({ error: exError.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
};
const DELETE = async ({ cookies, params, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const { error } = await supabase.from("routines").delete().eq("id", params.id).eq("user_id", userId);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" }
  });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  DELETE,
  GET,
  PUT
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
