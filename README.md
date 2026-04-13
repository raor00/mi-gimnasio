# Mi Gimnasio

App personal de entrenamiento construida con Astro + Tailwind + Supabase.

## Qué hace hoy

- Registro e inicio de sesión con Supabase Auth
- CRUD de rutinas
- Biblioteca de ejercicios base
- Sesiones activas con registro de series, repeticiones, peso, RPE y RIR
- Dashboard con sesión en curso, volumen semanal y streak
- Calendario de sesiones completadas
- Estadísticas con volumen, top lifts y distribución muscular

## Stack

- Astro SSR (`@astrojs/node`)
- Tailwind CSS v4
- Supabase Auth + Database + RLS

## Requisitos

- Node.js `>=22.12.0`
- Proyecto en Supabase

## Variables de entorno

Copia `.env.example` a `.env` y completa los valores:

```bash
cp .env.example .env
```

Variables necesarias:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Setup

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Crea el proyecto en Supabase.

3. Ejecuta el contenido de `database_schema.sql` en el SQL Editor de Supabase.

4. Crea el archivo `.env` con las credenciales del proyecto.

5. Levanta el entorno local:

   ```bash
   npm run dev
   ```

## Scripts

| Command | Acción |
| :-- | :-- |
| `npm run dev` | Levanta el servidor local |
| `npm run build` | Genera el build SSR |
| `npm run preview` | Previsualiza el build |

## Base de datos

El esquema principal está en:

- `database_schema.sql`

Incluye:

- tablas de perfiles, rutinas, ejercicios, sesiones y sets
- Row Level Security
- trigger para crear perfil al registrarse
- seed inicial de ejercicios

## Notas importantes

- La app está pensada para uso personal o pocos usuarios.
- `SUPABASE_SERVICE_ROLE_KEY` solo debe usarse del lado servidor.
- Si ya tienes una base existente, vuelve a ejecutar `database_schema.sql` para aplicar las columnas nuevas de `cancelled_at`, `rpe` y `rir` mediante `ALTER TABLE IF NOT EXISTS`.
