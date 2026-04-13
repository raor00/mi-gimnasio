-- ============================================================
-- Mi Gimnasio — Supabase Schema
-- Pegar en: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

------------------------------------------------------------
-- 1. TABLAS
------------------------------------------------------------

-- Perfil extendido del usuario (se crea automáticamente al registrarse)
CREATE TABLE IF NOT EXISTS public.profiles (
  id   UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Biblioteca global de ejercicios (solo lectura para usuarios)
CREATE TABLE IF NOT EXISTS public.exercises (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL,
  muscle_groups TEXT[]      NOT NULL,  -- ej: ['chest','triceps']
  category      TEXT        NOT NULL,  -- 'compound' | 'isolation'
  equipment     TEXT        NOT NULL,  -- 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Rutinas creadas por el usuario
CREATE TABLE IF NOT EXISTS public.routines (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name               TEXT NOT NULL,
  goal               TEXT DEFAULT 'hypertrophy',  -- 'hypertrophy' | 'strength' | 'endurance'
  estimated_duration INT,                          -- minutos
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Ejercicios ordenados dentro de una rutina
CREATE TABLE IF NOT EXISTS public.routine_exercises (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id  UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  order_index INT  NOT NULL,
  target_sets INT  DEFAULT 3,
  target_reps TEXT DEFAULT '8-12',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sesión de entrenamiento (en progreso o completada)
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id   UUID REFERENCES public.routines(id) ON DELETE SET NULL,
  routine_name TEXT        NOT NULL,
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,            -- NULL = en progreso
  cancelled_at TIMESTAMPTZ,            -- NULL = activa
  total_volume FLOAT DEFAULT 0,        -- kg totales levantados
  notes        TEXT
);

-- Series individuales registradas durante una sesión
CREATE TABLE IF NOT EXISTS public.session_sets (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id    UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id   UUID REFERENCES public.exercises(id),
  exercise_name TEXT  NOT NULL,        -- snapshot por si se borra el ejercicio
  set_number    INT   NOT NULL,
  weight        FLOAT DEFAULT 0,
  reps          INT   DEFAULT 0,
  rpe           NUMERIC(3,1),
  rir           INT,
  completed     BOOLEAN DEFAULT FALSE,
  logged_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.workout_sessions
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

ALTER TABLE public.session_sets
  ADD COLUMN IF NOT EXISTS rpe NUMERIC(3,1);

ALTER TABLE public.session_sets
  ADD COLUMN IF NOT EXISTS rir INT;

------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
------------------------------------------------------------

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_sets      ENABLE ROW LEVEL SECURITY;

-- Perfiles: solo el propio usuario
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Ejercicios: lectura para todos los usuarios autenticados
CREATE POLICY "exercises_read" ON public.exercises
  FOR SELECT USING (auth.role() = 'authenticated');

-- Rutinas: solo el dueño
CREATE POLICY "routines_own" ON public.routines
  FOR ALL USING (auth.uid() = user_id);

-- Ejercicios de rutinas: heredado del dueño de la rutina
CREATE POLICY "routine_exercises_own" ON public.routine_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.routines r
      WHERE r.id = routine_id AND r.user_id = auth.uid()
    )
  );

-- Sesiones: solo el dueño
CREATE POLICY "sessions_own" ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Series: heredado del dueño de la sesión
CREATE POLICY "sets_own" ON public.session_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions s
      WHERE s.id = session_id AND s.user_id = auth.uid()
    )
  );

------------------------------------------------------------
-- 3. TRIGGER — Auto-crear perfil al registrarse
------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, split_part(NEW.email, '@', 1));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

------------------------------------------------------------
-- 4. SEED — Biblioteca de 20 ejercicios
------------------------------------------------------------

INSERT INTO public.exercises (name, muscle_groups, category, equipment) VALUES
  ('Barbell Bench Press',      ARRAY['chest','triceps','shoulders'], 'compound',  'barbell'),
  ('Incline Dumbbell Press',   ARRAY['chest','triceps'],             'compound',  'dumbbell'),
  ('Cable Fly',                ARRAY['chest'],                       'isolation', 'cable'),
  ('Dumbbell Shoulder Press',  ARRAY['shoulders','triceps'],         'compound',  'dumbbell'),
  ('Lateral Raise',            ARRAY['shoulders'],                   'isolation', 'dumbbell'),
  ('Tricep Pushdown',          ARRAY['triceps'],                     'isolation', 'cable'),
  ('Skull Crushers',           ARRAY['triceps'],                     'isolation', 'barbell'),
  ('Barbell Back Squat',       ARRAY['quads','glutes','hamstrings'], 'compound',  'barbell'),
  ('Romanian Deadlift',        ARRAY['hamstrings','glutes'],         'compound',  'barbell'),
  ('Leg Press',                ARRAY['quads','glutes'],              'compound',  'machine'),
  ('Leg Curl',                 ARRAY['hamstrings'],                  'isolation', 'machine'),
  ('Calf Raise',               ARRAY['calves'],                      'isolation', 'machine'),
  ('Deadlift',                 ARRAY['back','hamstrings','glutes'],  'compound',  'barbell'),
  ('Barbell Row',              ARRAY['back','biceps'],               'compound',  'barbell'),
  ('Pull Up',                  ARRAY['back','biceps'],               'compound',  'bodyweight'),
  ('Lat Pulldown',             ARRAY['back','biceps'],               'compound',  'machine'),
  ('Cable Row',                ARRAY['back','biceps'],               'compound',  'cable'),
  ('Barbell Curl',             ARRAY['biceps'],                      'isolation', 'barbell'),
  ('Dumbbell Curl',            ARRAY['biceps'],                      'isolation', 'dumbbell'),
  ('Plank',                    ARRAY['core'],                        'isolation', 'bodyweight')
ON CONFLICT DO NOTHING;
