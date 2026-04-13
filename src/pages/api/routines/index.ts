import type { APIRoute } from 'astro';
import { supabaseServerClient } from '../../../lib/supabase-server';
import { normalizeRoutineExercises, normalizeRoutineName } from '../../../lib/workout-utils';

export const GET: APIRoute = async ({ cookies }) => {
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
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

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

  const { data: routine, error: routineError } = await supabase
    .from('routines')
    .insert({
      user_id: session.user.id,
      name: normalizedName,
      goal: goal || 'hypertrophy',
      estimated_duration: normalizedExercises.length * 10,
    })
    .select()
    .single();

  if (routineError) return new Response(JSON.stringify({ error: routineError.message }), { status: 500 });

  if (normalizedExercises.length > 0) {
    const exerciseRows = normalizedExercises.map((ex) => ({
      routine_id: routine.id,
      exercise_id: ex.exercise_id,
      order_index: ex.order_index,
      target_sets: ex.target_sets || 3,
      target_reps: ex.target_reps || '8-12',
    }));

    const { error: exError } = await supabase.from('routine_exercises').insert(exerciseRows);
    if (exError) return new Response(JSON.stringify({ error: exError.message }), { status: 500 });
  }

  return new Response(JSON.stringify(routine), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
