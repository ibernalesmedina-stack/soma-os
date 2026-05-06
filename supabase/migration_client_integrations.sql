-- ============================================================
-- Migración: client_integrations — tokens cifrados con pgcrypto
-- Ejecutar en Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Activar extensión de criptografía
create extension if not exists pgcrypto;

-- 2. Guardar clave de cifrado como setting de sesión
--    Cambia 'SOMA_SECRET_KEY_2026' por tu propia clave segura
--    Puedes generarla con: SELECT gen_random_uuid()::text
alter database postgres set app.encryption_key = 'SOMA_SECRET_KEY_2026';

-- 3. Funciones helper de cifrado/descifrado
create or replace function encrypt_value(val text)
returns text
language plpgsql security definer as $$
begin
  if val is null or val = '' then return ''; end if;
  return encode(
    pgp_sym_encrypt(val, current_setting('app.encryption_key', true)),
    'base64'
  );
end;
$$;

create or replace function decrypt_value(val text)
returns text
language plpgsql security definer as $$
begin
  if val is null or val = '' then return ''; end if;
  return pgp_sym_decrypt(
    decode(val, 'base64'),
    current_setting('app.encryption_key', true)
  );
exception when others then
  return '';
end;
$$;

-- 4. Tabla principal
create table if not exists client_integrations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null unique,
  -- Campos de texto plano
  whatsapp_number  text not null default '',
  dominio          text not null default '',
  -- Campos cifrados (se guardan y leen via las funciones encrypt/decrypt)
  whatsapp_token          text not null default '',
  google_calendar_token   text not null default '',
  webpay_merchant_code    text not null default '',
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

comment on column client_integrations.whatsapp_token        is 'Cifrado con pgp_sym_encrypt';
comment on column client_integrations.google_calendar_token is 'Cifrado con pgp_sym_encrypt';
comment on column client_integrations.webpay_merchant_code  is 'Cifrado con pgp_sym_encrypt';

-- 5. Trigger: updated_at automático
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists client_integrations_updated_at on client_integrations;
create trigger client_integrations_updated_at
  before update on client_integrations
  for each row execute function touch_updated_at();

-- 6. RLS
alter table client_integrations enable row level security;

create policy "integrations_select" on client_integrations for select
  using (user_id = auth.uid() or is_admin());

create policy "integrations_insert" on client_integrations for insert
  with check (user_id = auth.uid());

create policy "integrations_update" on client_integrations for update
  using (user_id = auth.uid() or is_admin());

create policy "integrations_delete" on client_integrations for delete
  using (user_id = auth.uid() or is_admin());

-- 7. Vista segura (desencripta solo para el dueño)
create or replace view my_integrations as
  select
    id, user_id,
    whatsapp_number,
    dominio,
    decrypt_value(whatsapp_token)          as whatsapp_token,
    decrypt_value(google_calendar_token)   as google_calendar_token,
    decrypt_value(webpay_merchant_code)    as webpay_merchant_code,
    created_at, updated_at
  from client_integrations
  where user_id = auth.uid();
