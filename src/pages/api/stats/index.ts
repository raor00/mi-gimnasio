import type { APIRoute } from 'astro';
import { supabaseServerClient } from '../../../lib/supabase-server';

export const GET: APIRoute = async ({ cookies, url }) => {
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const range = url.searchParams.get('range') || '30d';
  const days = range === '7d' ? 7 : range === '6m' ? 180 : 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Volume per day
  const { data: sets } = await supabase
    .from('session_sets')
    .select(`
      weight,
      reps,
      completed,
      logged_at,
      exercise_name,
      exercises (muscle_groups),
      workout_sessions!inner (user_id, completed_at)
    `)
    .eq('workout_sessions.user_id', session.user.id)
    .not('workout_sessions.completed_at', 'is', null)
    .eq('completed', true)
    .gte('logged_at', since.toISOString());

  // Group volume by day
  const volumeByDay: Record<string, number> = {};
  const muscleCount: Record<string, number> = {};
  const topLifts: Record<string, number> = {};

  for (const s of (sets || [])) {
    const day = new Date(s.logged_at).toISOString().split('T')[0];
    const vol = (s.weight || 0) * (s.reps || 0);
    volumeByDay[day] = (volumeByDay[day] || 0) + vol;

    // Muscle groups
    const muscles = (s.exercises as any)?.muscle_groups || [];
    for (const m of muscles) {
      muscleCount[m] = (muscleCount[m] || 0) + 1;
    }

    // Top lifts (max weight per exercise)
    if (s.weight > 0) {
      topLifts[s.exercise_name] = Math.max(topLifts[s.exercise_name] || 0, s.weight);
    }
  }

  // Build array of last N days
  const volumeArray: Array<{ date: string; volume: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    volumeArray.push({ date: key, volume: Math.round(volumeByDay[key] || 0) });
  }

  // Sort top lifts by weight desc, take top 5
  const sortedLifts = Object.entries(topLifts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, weight]) => ({ name, weight }));

  return new Response(
    JSON.stringify({
      volumeByDay: volumeArray,
      topLifts: sortedLifts,
      muscleDistribution: muscleCount,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
