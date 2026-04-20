import type { APIRoute } from 'astro';
import { supabaseServerClient } from '../../../lib/supabase-server';
import { hasCompletedSets } from '../../../lib/workout-utils';

export const GET: APIRoute = async ({ cookies, params, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`*, session_sets (*)`)
    .eq('id', params.id!)
    .eq('user_id', userId)
    .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404 });

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ cookies, params, request, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json();

  // Compute total volume from session_sets if completing
  let total_volume = 0;
  if (body.completed_at) {
    const { data: sets } = await supabase
      .from('session_sets')
      .select('weight, reps, completed')
      .eq('session_id', params.id!);

    const completedSets = (sets || []).filter((s) => s.completed);
    if (!hasCompletedSets(completedSets)) {
      return new Response(JSON.stringify({ error: 'Complete at least one set before finishing the workout' }), { status: 400 });
    }

    total_volume = completedSets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
  }

  const { error } = await supabase
    .from('workout_sessions')
    .update({
      ...body,
      ...(body.completed_at ? { total_volume } : {}),
      ...(body.completed_at ? { cancelled_at: null } : {}),
    })
    .eq('id', params.id!)
    .eq('user_id', userId);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true, total_volume }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ cookies, params, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { error } = await supabase
    .from('workout_sessions')
    .update({
      cancelled_at: new Date().toISOString(),
      completed_at: null,
      total_volume: 0,
    })
    .eq('id', params.id!)
    .eq('user_id', userId)
    .is('completed_at', null);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
