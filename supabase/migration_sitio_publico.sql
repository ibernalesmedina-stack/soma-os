-- ============================================================
-- Migración: Sitio público por cliente
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Agregar columna domain a perfiles
alter table perfiles add column if not exists domain text default '';

-- 2. Permitir lectura pública (anon) de servicios activos
create policy "servicios_anon_read" on servicios for select
  to anon
  using (true);

-- 3. Permitir lectura pública (anon) de perfiles (para mostrar nombre del negocio)
create policy "perfiles_anon_read" on perfiles for select
  to anon
  using (true);
