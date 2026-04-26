import type { APIRoute } from 'astro';
import type { AstroCookies } from 'astro';
import { handleProgressGet, handleProgressPost, type ProgressRepository } from '../../lib/progress-api.ts';
import { supabaseServerClient } from '../../lib/supabase-server';

function createProgressRepository(cookies: AstroCookies): ProgressRepository {
  const supabase = supabaseServerClient(cookies);

  return {
    async listRecentByUserId(userId) {
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const { data, error } = await supabase
        .from('user_progress_logs')
        .select('id, user_id, log_date, body_weight_kg, body_fat_pct, arm_cm, chest_cm, waist_cm, thigh_cm, fatigue_level, energy_level, sleep_quality, symptoms, notes, created_at')
        .eq('user_id', userId)
        .gte('log_date', since.toISOString().split('T')[0])
        .order('log_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data ?? [];
    },
    async insertByUserId(userId, payload) {
      const { data, error } = await supabase
        .from('user_progress_logs')
        .insert({ user_id: userId, ...payload })
        .select('id, user_id, log_date, body_weight_kg, body_fat_pct, arm_cm, chest_cm, waist_cm, thigh_cm, fatigue_level, energy_level, sleep_quality, symptoms, notes, created_at')
        .single();

      if (error) throw error;
      return data;
    },
  };
}

export const GET: APIRoute = async ({ cookies, locals }) => handleProgressGet({
  userId: locals.auth?.userId ?? null,
  repo: createProgressRepository(cookies),
});

export const POST: APIRoute = async ({ cookies, locals, request }) => handleProgressPost({
  userId: locals.auth?.userId ?? null,
  body: await request.json(),
  repo: createProgressRepository(cookies),
});
