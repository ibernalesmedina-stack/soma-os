-- ============================================================
-- SomaOS — Schema completo con RLS
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Perfiles (extiende auth.users)
create table if not exists perfiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null default '',
  business_name text not null default '',
  phone text default '',
  role text default 'user' check (role in ('user', 'admin')),
  plan text default 'basic' check (plan in ('basic', 'pro', 'premium', 'clinic')),
  tipo_negocio text default 'psicologa' check (tipo_negocio in ('nutricionista', 'cosmetologa', 'odontologa', 'psicologa')),
  submodulos text[] default '{}',
  payment_methods jsonb default '{"webpay": true, "transferencia": true}',
  whatsapp_number text default '',
  google_calendar_connected boolean default false,
  active boolean default true,
  created_at timestamptz default now()
);

-- Reservas
create table if not exists reservas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id text not null default '',
  client_name text not null default '',
  date timestamptz not null,
  service_id text not null default '',
  service_name text not null default '',
  status text default 'pendiente' check (status in ('confirmada', 'pendiente', 'cancelada', 'completada')),
  amount numeric not null default 0,
  tipo_atencion text check (tipo_atencion in ('online', 'presencial')),
  es_control boolean default false,
  created_at timestamptz default now()
);

-- Pagos
create table if not exists pagos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id text not null default '',
  client_name text not null default '',
  date timestamptz not null,
  amount numeric not null default 0,
  method text check (method in ('WebPay', 'Transferencia', 'Efectivo')),
  status text default 'pendiente' check (status in ('pagado', 'pendiente', 'fallido')),
  reserva_id uuid references reservas(id) on delete set null,
  created_at timestamptz default now()
);

-- Servicios
create table if not exists servicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text default '',
  price numeric not null default 0,
  duration_min integer not null default 60,
  active boolean default true,
  created_at timestamptz default now()
);

-- Fichas de clientes
create table if not exists fichas_clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_key text not null,
  client_name text not null,
  email text,
  phone text,
  birth_date text,
  address text,
  occupation text,
  emergency_contact text,
  motivo_consulta text,
  tipo_atencion text,
  antecedentes_medicos text,
  alergias text,
  medicacion text,
  antecedentes_familiares text,
  evaluacion_inicial text,
  plan_tratamiento text,
  objetivos text,
  notas_generales text,
  edad text,
  estado text default 'activo' check (estado in ('activo', 'pausa', 'alta')),
  altura text,
  peso_inicial text,
  peso_actual text,
  porc_grasa text,
  porc_muscular text,
  objetivo_texto text,
  evaluacion_nivel text check (evaluacion_nivel in ('bajo', 'medio', 'alto')),
  progreso_texto text,
  alertas text,
  tipo_piel text,
  sensibilidad text,
  frecuencia text,
  rutina_actual text,
  diagnostico text,
  proxima_accion text,
  dental jsonb,
  recomendaciones text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, client_key)
);

-- Notas de sesión
create table if not exists notas_sesion (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_key text not null,
  reserva_id uuid references reservas(id) on delete set null,
  date timestamptz not null default now(),
  title text not null default '',
  content text default '',
  created_at timestamptz default now()
);

-- Registros flexibles por tipo de negocio
create table if not exists registros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id text not null default '',
  client_name text not null default '',
  tipo text not null,
  titulo text not null default '',
  fecha timestamptz not null default now(),
  data jsonb default '{}',
  notas text,
  created_at timestamptz default now()
);

-- Bloqueos de agenda
create table if not exists bloqueos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  motivo text default '',
  created_at timestamptz default now()
);

-- Entradas de progreso (nutrición, etc.)
create table if not exists progreso (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_key text not null,
  fecha timestamptz not null,
  peso numeric,
  porc_grasa numeric,
  porc_muscular numeric,
  notas text,
  created_at timestamptz default now()
);

-- Automatizaciones
create table if not exists automatizaciones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text default '',
  channel text default 'whatsapp_email',
  enabled boolean default false,
  created_at timestamptz default now(),
  unique(user_id, name)
);

-- ============================================================
-- Trigger: crear perfil automáticamente al registrarse
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table perfiles enable row level security;
alter table reservas enable row level security;
alter table pagos enable row level security;
alter table servicios enable row level security;
alter table fichas_clientes enable row level security;
alter table notas_sesion enable row level security;
alter table registros enable row level security;
alter table bloqueos enable row level security;
alter table progreso enable row level security;
alter table automatizaciones enable row level security;

-- Helper: es admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from perfiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Perfiles: cada usuario ve/edita el suyo; admins ven todos
create policy "perfiles_select" on perfiles for select
  using (id = auth.uid() or is_admin());

create policy "perfiles_insert" on perfiles for insert
  with check (id = auth.uid());

create policy "perfiles_update" on perfiles for update
  using (id = auth.uid() or is_admin());

-- Tabla genérica: cada usuario ve sus datos; admins ven todo
-- (aplicamos el mismo patrón a todas las tablas con user_id)

create policy "reservas_select" on reservas for select
  using (user_id = auth.uid() or is_admin());
create policy "reservas_insert" on reservas for insert
  with check (user_id = auth.uid());
create policy "reservas_update" on reservas for update
  using (user_id = auth.uid() or is_admin());
create policy "reservas_delete" on reservas for delete
  using (user_id = auth.uid() or is_admin());

create policy "pagos_select" on pagos for select
  using (user_id = auth.uid() or is_admin());
create policy "pagos_insert" on pagos for insert
  with check (user_id = auth.uid());
create policy "pagos_update" on pagos for update
  using (user_id = auth.uid() or is_admin());
create policy "pagos_delete" on pagos for delete
  using (user_id = auth.uid() or is_admin());

create policy "servicios_select" on servicios for select
  using (user_id = auth.uid() or is_admin());
create policy "servicios_insert" on servicios for insert
  with check (user_id = auth.uid());
create policy "servicios_update" on servicios for update
  using (user_id = auth.uid() or is_admin());
create policy "servicios_delete" on servicios for delete
  using (user_id = auth.uid() or is_admin());

create policy "fichas_select" on fichas_clientes for select
  using (user_id = auth.uid() or is_admin());
create policy "fichas_insert" on fichas_clientes for insert
  with check (user_id = auth.uid());
create policy "fichas_update" on fichas_clientes for update
  using (user_id = auth.uid() or is_admin());
create policy "fichas_delete" on fichas_clientes for delete
  using (user_id = auth.uid() or is_admin());

create policy "notas_select" on notas_sesion for select
  using (user_id = auth.uid() or is_admin());
create policy "notas_insert" on notas_sesion for insert
  with check (user_id = auth.uid());
create policy "notas_update" on notas_sesion for update
  using (user_id = auth.uid() or is_admin());
create policy "notas_delete" on notas_sesion for delete
  using (user_id = auth.uid() or is_admin());

create policy "registros_select" on registros for select
  using (user_id = auth.uid() or is_admin());
create policy "registros_insert" on registros for insert
  with check (user_id = auth.uid());
create policy "registros_delete" on registros for delete
  using (user_id = auth.uid() or is_admin());

create policy "bloqueos_select" on bloqueos for select
  using (user_id = auth.uid() or is_admin());
create policy "bloqueos_insert" on bloqueos for insert
  with check (user_id = auth.uid());
create policy "bloqueos_delete" on bloqueos for delete
  using (user_id = auth.uid() or is_admin());

create policy "progreso_select" on progreso for select
  using (user_id = auth.uid() or is_admin());
create policy "progreso_insert" on progreso for insert
  with check (user_id = auth.uid());
create policy "progreso_delete" on progreso for delete
  using (user_id = auth.uid() or is_admin());

create policy "automatizaciones_select" on automatizaciones for select
  using (user_id = auth.uid() or is_admin());
create policy "automatizaciones_insert" on automatizaciones for insert
  with check (user_id = auth.uid());
create policy "automatizaciones_update" on automatizaciones for update
  using (user_id = auth.uid() or is_admin());
create policy "automatizaciones_delete" on automatizaciones for delete
  using (user_id = auth.uid() or is_admin());
