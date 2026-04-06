-- SQL SCRIPT DE CREACION PARA: Mi Gimnasio
-- Ve a tu panel en "Supabase -> SQL Editor -> New Query" y pega todo este código.

----------------------------------------------------
-- 1. CREACIÓN DE TABLAS DE DATOS
----------------------------------------------------

-- Creamos la tabla 'routines' apuntada al dueño (user_id)
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    focus_area VARCHAR(100),         -- ej. 'Chest & Triceps'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exercises JSONB DEFAULT '[]'::JSONB -- Usamos JSON para guardar libremente la lista de ejercicios adentro!
);

-- Creamos una tabla para rastrear la Metadata de los 'Archivos Físicos' subidos
CREATE TABLE IF NOT EXISTS public.user_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    content_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

----------------------------------------------------
-- 2. POLÍTICAS DE SEGURIDAD (RLS) - "EL AISLADOR"
----------------------------------------------------

-- Obligamos a que Supabase exija politicas en estas tablas y nadie pueda saltárselas
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_files ENABLE ROW LEVEL SECURITY;

-- POLITICA RUTINAS: "Solo el dueño que concuerde con auth.uid() puede VER y EDITAR sus rutinas"
CREATE POLICY "Users can fully manage their own routines" 
ON public.routines 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- POLITICA ARCHIVOS: "Solo el dueño puede VER y EDITAR la info de sus documentos subidos"
CREATE POLICY "Users can fully manage their own files metadata" 
ON public.user_files 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

----------------------------------------------------
-- 3. ALMACENAMIENTO DE ARCHIVOS REALES (STORAGE)
----------------------------------------------------

-- Insertamos un nuevo Bucket físico llamado 'gym_files' donde irán fotos y PDFs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gym_files', 'gym_files', false)
ON CONFLICT (id) DO NOTHING;

-- Configuracion RLS para el Bucket a los discos duros de la plataforma
CREATE POLICY "Users can upload files to their personal folder" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'gym_files' AND 
  auth.uid() = owner
);

CREATE POLICY "Users can read their own files" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'gym_files' AND 
  auth.uid() = owner
);

CREATE POLICY "Users can update their files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'gym_files' AND 
  auth.uid() = owner
);

CREATE POLICY "Users can delete their files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'gym_files' AND 
  auth.uid() = owner
);

-- FIN. Ejecuta todo esto y tu base de datos estará blindada!
