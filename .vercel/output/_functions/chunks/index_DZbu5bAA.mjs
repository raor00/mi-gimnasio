import { s as supabaseServerClient } from './supabase-server_DmlcIR_W.mjs';

const GET = async ({ cookies, url, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  const range = url.searchParams.get("range") || "30d";
  const days = range === "7d" ? 7 : range === "6m" ? 180 : 30;
  const since = /* @__PURE__ */ new Date();
  since.setDate(since.getDate() - days);
  const { data: sets } = await supabase.from("session_sets").select(`
      weight,
      reps,
      completed,
      logged_at,
      exercise_name,
      exercises (muscle_groups),
      workout_sessions!inner (user_id, completed_at)
    `).eq("workout_sessions.user_id", userId).not("workout_sessions.completed_at", "is", null).eq("completed", true).gte("logged_at", since.toISOString());
  const volumeByDay = {};
  const muscleCount = {};
  const topLifts = {};
  for (const s of sets || []) {
    const day = new Date(s.logged_at).toISOString().split("T")[0];
    const vol = (s.weight || 0) * (s.reps || 0);
    volumeByDay[day] = (volumeByDay[day] || 0) + vol;
    const muscles = s.exercises?.muscle_groups || [];
    for (const m of muscles) {
      muscleCount[m] = (muscleCount[m] || 0) + 1;
    }
    if (s.weight > 0) {
      topLifts[s.exercise_name] = Math.max(topLifts[s.exercise_name] || 0, s.weight);
    }
  }
  const volumeArray = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    volumeArray.push({ date: key, volume: Math.round(volumeByDay[key] || 0) });
  }
  const sortedLifts = Object.entries(topLifts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, weight]) => ({ name, weight }));
  return new Response(
    JSON.stringify({
      volumeByDay: volumeArray,
      topLifts: sortedLifts,
      muscleDistribution: muscleCount
    }),
    { headers: { "Content-Type": "application/json" } }
  );
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
