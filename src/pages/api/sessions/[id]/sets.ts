import type { APIRoute } from 'astro';
import { supabaseServerClient } from '../../../../lib/supabase-server';

export const POST: APIRoute = async ({ cookies, params, request }) => {
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json();
  const { exercise_id, exercise_name, set_number, weight, reps } = body as {
    exercise_id: string;
    exercise_name: string;
    set_number: number;
    weight: number;
    reps: number;
  };

  const { data, error } = await supabase
    .from('session_sets')
    .insert({
      session_id: params.id!,
      exercise_id,
      exercise_name,
      set_number,
      weight: weight || 0,
      reps: reps || 0,
      completed: false,
    })
    .select()
    .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const PUT: APIRoute = async ({ cookies, request }) => {
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json();
  const { set_id, weight, reps, completed } = body as {
    set_id: string;
    weight?: number;
    reps?: number;
    completed?: boolean;
  };

  const updates: Record<string, unknown> = {};
  if (weight !== undefined) updates.weight = weight;
  if (reps !== undefined) updates.reps = reps;
  if (completed !== undefined) updates.completed = completed;

  const { data, error } = await supabase
    .from('session_sets')
    .update(updates)
    .eq('id', set_id)
    .select()
    .single();

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
