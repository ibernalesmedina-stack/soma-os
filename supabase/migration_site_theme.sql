-- Configuración visual y de contenido por cliente
alter table perfiles
  add column if not exists theme jsonb default '{}'::jsonb,
  add column if not exists landing_config jsonb default '{}'::jsonb;

-- Índice para búsqueda por dominio personalizado
create index if not exists idx_client_integrations_dominio
  on client_integrations (dominio)
  where dominio != '';
