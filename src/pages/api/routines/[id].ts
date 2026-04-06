import type { APIRoute } from 'astro';
import { supabaseServerClient } from '../../../lib/supabase-server';

export const GET: APIRoute = async ({ cookies, params }) => {
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { data, error } = await supabase
    .from('routines')
    .select(`
      *,
      routine_exercises (
        id,
        order_index,
        target_sets,
        target_reps,
        exercises (id, name, muscle_groups, category, equipment)
      )
    `)
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
  const { name, goal, exercises } = body as {
    name: string;
    goal: string;
    exercises: Array<{ exercise_id: string; order_index: number; target_sets: number; target_reps: string }>;
  };

  const { error: updateError } = await supabase
    .from('routines')
    .update({
      name: name.trim(),
      goal,
      estimated_duration: exercises.length * 10,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id!)
    .eq('user_id', session.user.id);

  if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });

  // Replace exercises: delete old, insert new
  await supabase.from('routine_exercises').delete().eq('routine_id', params.id!);

  if (exercises?.length > 0) {
    const exerciseRows = exercises.map((ex) => ({
      routine_id: params.id!,
      exercise_id: ex.exercise_id,
      order_index: ex.order_index,
      target_sets: ex.target_sets || 3,
      target_reps: ex.target_reps || '8-12',
    }));
    const { error: exError } = await supabase.from('routine_exercises').insert(exerciseRows);
    if (exError) return new Response(JSON.stringify({ error: exError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ cookies, params }) => {
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', params.id!)
    .eq('user_id', session.user.id);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
