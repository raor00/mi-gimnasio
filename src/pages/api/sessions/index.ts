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

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', session.user.id)
    .not('completed_at', 'is', null)
    .gte('completed_at', since.toISOString())
    .order('completed_at', { ascending: false });

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ cookies, request }) => {
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json();
  const { routine_id, routine_name } = body as { routine_id: string; routine_name: string };

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: session.user.id,
      routine_id,
      routine_name,
    })
    .select()
    .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
