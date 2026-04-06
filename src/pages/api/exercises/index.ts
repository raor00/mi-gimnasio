import type { APIRoute } from 'astro';
import { supabaseServerClient } from '../../../lib/supabase-server';

export const GET: APIRoute = async ({ cookies }) => {
  const supabase = supabaseServerClient(cookies);

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
