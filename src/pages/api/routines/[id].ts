import type { APIRoute } from 'astro';
import { supabaseServerClient } from '../../../lib/supabase-server';
import { normalizeRoutineExercises, normalizeRoutineName } from '../../../lib/workout-utils';

export const GET: APIRoute = async ({ cookies, params, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

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
  const { name, goal, exercises } = body as {
    name: string;
    goal: string;
    exercises: Array<{ exercise_id: string; order_index: number; target_sets: number; target_reps: string }>;
  };
  const normalizedName = normalizeRoutineName(name);
  const normalizedExercises = normalizeRoutineExercises(exercises || []);

  if (!normalizedName) {
    return new Response(JSON.stringify({ error: 'Routine name is required' }), { status: 400 });
  }

  if (normalizedName.length > 80) {
    return new Response(JSON.stringify({ error: 'Routine name is too long' }), { status: 400 });
  }

  if (normalizedExercises.length === 0) {
    return new Response(JSON.stringify({ error: 'Add at least one exercise' }), { status: 400 });
  }

  const { error: updateError } = await supabase
    .from('routines')
    .update({
      name: normalizedName,
      goal,
      estimated_duration: normalizedExercises.length * 10,
      updated_at: new Date().toISOString(),
    })
    .eq('id', params.id!)
    .eq('user_id', userId);

  if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });

  // Replace exercises: delete old, insert new
  await supabase.from('routine_exercises').delete().eq('routine_id', params.id!);

  if (normalizedExercises.length > 0) {
    const exerciseRows = normalizedExercises.map((ex) => ({
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

export const DELETE: APIRoute = async ({ cookies, params, locals }) => {
  const supabase = supabaseServerClient(cookies);
  const userId = locals.auth?.userId;
  if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', params.id!)
    .eq('user_id', userId);

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
