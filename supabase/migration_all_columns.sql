-- Agrega todas las columnas que faltan en client_integrations
-- Es seguro correr múltiples veces (IF NOT EXISTS)

alter table client_integrations
  add column if not exists google_access_token   text default '',
  add column if not exists google_refresh_token  text default '',
  add column if not exists google_token_expiry   timestamptz,
  add column if not exists google_calendar_id    text default 'primary',
  add column if not exists google_connected_at   timestamptz,
  add column if not exists calendar_status       text default 'disconnected'
    check (calendar_status in ('synced', 'disconnected')),
  add column if not exists resend_api_key        text default '',
  add column if not exists resend_email          text default '',
  add column if not exists resend_status         text default 'disconnected'
    check (resend_status in ('connected', 'disconnected')),
  add column if not exists domain_status         text default 'pending'
    check (domain_status in ('pending', 'connected', 'error')),
  add column if not exists whatsapp_status       text default 'disconnected'
    check (whatsapp_status in ('connected', 'disconnected')),
  add column if not exists transfer_banco        text default '',
  add column if not exists transfer_cuenta       text default '',
  add column if not exists transfer_rut          text default '',
  add column if not exists transfer_status       text default 'unverified'
    check (transfer_status in ('verified', 'unverified')),
  add column if not exists webpay_status         text default 'inactive'
    check (webpay_status in ('active', 'inactive'));

-- Agrega google_event_id a reservas si no existe
alter table reservas add column if not exists google_event_id text default '';

-- Migra tokens existentes al nuevo campo (por si ya había datos)
update client_integrations
  set google_access_token = google_calendar_token
  where google_calendar_token != '' and google_access_token = '';
