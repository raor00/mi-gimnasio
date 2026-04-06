import type { APIRoute } from "astro";
import { supabaseServerClient } from "../../../lib/supabase-server";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = supabaseServerClient(cookies);

    // 1. Verificamos que sí tengan un boleto de sesión real en los servidores
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(JSON.stringify({ error: "No autorizado. Inicie sesión." }), {
        status: 401,
      });
    }

    // 2. Extraer el body enviado desde JS a nuestra API Node
    const body = await request.json();
    const { title, focus_area, exercises } = body;

    if (!title) {
      return new Response(JSON.stringify({ error: "El título de la rutina es requerido" }), {
        status: 400,
      });
    }

    // 3. Efectuar la orden de INSERT. 
    // Magia de RLS: no es forzosamente necesario pasar el user_id siempre que estemos como 'postgres',
    // IMPORTANTE: Dado que estamos usando la anon-key y cookies, la política RLS FOR INSERT de Supabase asume 
    // que TIENES que mandar user_id, así que lo mapeamos de manera estricta del token de session
    const { data, error } = await supabase
      .from("routines")
      .insert([
        {
          user_id: session.user.id,
          title,
          focus_area: focus_area || "General",
          exercises: exercises || [],
        },
      ])
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    // Retorna OK de validación
    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
