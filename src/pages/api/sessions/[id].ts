import type { APIRoute } from 'astro';
import { supabaseServerClient } from '../../../lib/supabase-server';

export const GET: APIRoute = async ({ cookies, params }) => {
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`*, session_sets (*)`)
    .eq('id', params.id!)
    .eq('user_id', session.user.id)
    .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 404 });

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ cookies, params, request }) => {
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json();

  // Compute total volume from session_sets if completing
  let total_volume = 0;
  if (body.completed_at) {
    const { data: sets } = await supabase
      .from('session_sets')
      .select('weight, reps, completed')
      .eq('session_id', params.id!);

    total_volume = (sets || [])
      .filter((s) => s.completed)
      .reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
  }

  const { error } = await supabase
    .from('workout_sessions')
    .update({
      ...body,
      ...(body.completed_at ? { total_volume } : {}),
    })
    .eq('id', params.id!)
    .eq('user_id', session.user.id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true, total_volume }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
