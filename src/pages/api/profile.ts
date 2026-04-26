import type { APIRoute, AstroCookies } from 'astro';
import { handleProfileGet, handleProfilePost, type ProfileRepository } from '../../lib/profile-api.ts';
import { supabaseServerClient } from '../../lib/supabase-server';

function createProfileRepository(cookies: AstroCookies): ProfileRepository {
  const supabase = supabaseServerClient(cookies);

  return {
    async getByUserId(userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, age, height_cm, weight_kg, gender, experience_level, weekly_goal_sessions, preferred_units')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    async upsertByUserId(userId, payload) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...payload }, { onConflict: 'id' })
        .select('id, name, age, height_cm, weight_kg, gender, experience_level, weekly_goal_sessions, preferred_units')
        .single();

      if (error) throw error;
      return data;
    },
  };
}

export const GET: APIRoute = async ({ cookies, locals }) => handleProfileGet({
  userId: locals.auth?.userId ?? null,
  repo: createProfileRepository(cookies),
});

export const POST: APIRoute = async ({ cookies, locals, request }) => handleProfilePost({
  userId: locals.auth?.userId ?? null,
  body: await request.json(),
  repo: createProfileRepository(cookies),
});
