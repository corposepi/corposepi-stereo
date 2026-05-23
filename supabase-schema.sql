-- ============================================================
-- CORPOSEPI STEREO — Schema de Supabase
-- Ejecuta este SQL en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Tabla de programas
CREATE TABLE IF NOT EXISTS programs (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  host         text DEFAULT '',
  description  text DEFAULT '',
  start_time   text NOT NULL DEFAULT '00:00',  -- formato "HH:MM"
  end_time     text NOT NULL DEFAULT '01:00',  -- formato "HH:MM"
  days         text NOT NULL DEFAULT 'all',    -- 'all' | 'weekdays' | 'weekends'
  is_active    boolean NOT NULL DEFAULT true,
  order_num    integer NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS programs_order_idx ON programs(order_num);
CREATE INDEX IF NOT EXISTS programs_active_idx ON programs(is_active);

-- Row Level Security
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Política: cualquiera puede LEER los programas (página de oyentes)
CREATE POLICY "Public can read programs"
  ON programs FOR SELECT
  USING (true);

-- Política: SOLO el service role puede escribir (nuestras API routes lo usan)
-- (No se necesita política de INSERT/UPDATE/DELETE para anon porque
--  las API routes usan la clave service_role que bypasa RLS)

-- Habilitar realtime para esta tabla
ALTER TABLE programs REPLICA IDENTITY FULL;

-- Agregar la tabla al canal de realtime
-- (en Supabase Dashboard: Database → Replication → programs ✓)

-- ── DATOS DE EJEMPLO ──────────────────────────────────────────
INSERT INTO programs (title, host, description, start_time, end_time, days, is_active, order_num)
VALUES
  ('Buenos Días CORPOSEPI',   'Equipo CORPOSEPI',     'Noticias educativas y reflexión matutina para comenzar el día',       '06:00', '08:00', 'all',      true, 0),
  ('Pensamiento Innovador',   'Lic. Carlos Mora',     'Debates pedagógicos y tendencias en educación contemporánea',         '08:00', '10:00', 'weekdays', true, 1),
  ('Voces Estudiantiles',     'Estudiantes CORPOSEPI','Espacio de expresión de estudiantes y presentación de proyectos',     '10:00', '12:00', 'weekdays', true, 2),
  ('Descanso Cultural',       'DJ CORPOSEPI',         'Música, arte y expresión cultural regional',                          '12:00', '14:00', 'all',      true, 3),
  ('Familia y Educación',     'Psic. Ana López',      'Orientación para padres, madres y cuidadores de la comunidad',       '14:00', '16:00', 'weekdays', true, 4),
  ('Tarde Juvenil',           'Equipo Juvenil',       'Contenido para jóvenes: música, tendencias, emprendimiento y más',   '16:00', '18:00', 'all',      true, 5),
  ('Noticiero CORPOSEPI',     'Periodismo CORPOSEPI', 'Resumen de noticias educativas, regionales y nacionales del día',    '18:00', '19:00', 'weekdays', true, 6),
  ('Noche de Clásicos',       'DJ CORPOSEPI Noche',   'Música clásica, jazz y géneros atemporales para el cierre del día',  '20:00', '22:00', 'all',      true, 7);
