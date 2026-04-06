import { createClient } from '@supabase/supabase-js';

// Cliente Público: Usa la Anon Key.
// Seguro de exportar y usar desde el lado del Cliente (Componentes UI / Navegador)
export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

// Cliente Admin (Privilegiado): Usa el Service Role Key.
// EXTREMADAMENTE PELIGROSO SI SE EXPONE AL NAVEGADOR.
// Solo debe utilizarse en Endpoints de API (.ts/.js locales de Astro) o durante GetStaticPaths / Astro.SSR.
export const supabaseAdmin = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY
);
