import type { APIRoute } from 'astro';
import { supabaseServerClient } from '../../../../lib/supabase-server';
import { clampNullableMetric, normalizeNumericInput } from '../../../../lib/workout-utils';

export const POST: APIRoute = async ({ cookies, params, request }) => {
  const supabase = supabaseServerClient(cookies);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  const body = await request.json();
  const { exercise_id, exercise_name, set_number, weight, reps, rpe, rir } = body as {
    exercise_id: string;
    exercise_name: string;
    set_number: number;
    weight: number;
    reps: number;
    rpe?: number | null;
    rir?: number | null;
  };

  if (!exercise_id || !exercise_name || !Number.isFinite(set_number) || set_number <= 0) {
    return new Response(JSON.stringify({ error: 'Invalid set payload' }), { status: 400 });
  }

  const safeWeight = normalizeNumericInput(weight, 0, false);
  const safeReps = normalizeNumericInput(reps, 0, true);
  const safeRpe = clampNullableMetric(rpe, 10, false);
  const safeRir = clampNullableMetric(rir, 10, true);

  const { data, error } = await supabase
    .from('session_sets')
    .insert({
      session_id: params.id!,
      exercise_id,
      exercise_name,
      set_number,
      weight: safeWeight,
      reps: safeReps,
      rpe: safeRpe,
      rir: safeRir,
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
  const { set_id, weight, reps, completed, rpe, rir } = body as {
    set_id: string;
    weight?: number;
    reps?: number;
    completed?: boolean;
    rpe?: number | null;
    rir?: number | null;
  };

  if (!set_id) {
    return new Response(JSON.stringify({ error: 'set_id is required' }), { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (weight !== undefined) updates.weight = normalizeNumericInput(weight, 0, false);
  if (reps !== undefined) updates.reps = normalizeNumericInput(reps, 0, true);
  if (completed !== undefined) updates.completed = completed;
  if (rpe !== undefined) updates.rpe = clampNullableMetric(rpe, 10, false);
  if (rir !== undefined) updates.rir = clampNullableMetric(rir, 10, true);

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
