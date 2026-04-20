import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from './supabase-config';

const { url, anonKey, serviceRoleKey } = getSupabaseConfig();

// Cliente Público: Usa la Anon Key.
// Seguro de exportar y usar desde el lado del Cliente (Componentes UI / Navegador)
export const supabase = createClient(
  url,
  anonKey
);

// Cliente Admin (Privilegiado): Usa el Service Role Key.
// EXTREMADAMENTE PELIGROSO SI SE EXPONE AL NAVEGADOR.
// Solo debe utilizarse en Endpoints de API (.ts/.js locales de Astro) o durante GetStaticPaths / Astro.SSR.
export const supabaseAdmin = createClient(
  url,
  serviceRoleKey!
);
