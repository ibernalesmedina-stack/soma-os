-- Google OAuth tokens (cifrados)
alter table client_integrations
  add column if not exists google_access_token  text default '',
  add column if not exists google_refresh_token text default '',
  add column if not exists google_token_expiry  timestamptz,
  add column if not exists google_calendar_id   text default 'primary',
  add column if not exists google_webhook_channel text default '',
  add column if not exists google_webhook_expiry  timestamptz,
  add column if not exists google_connected_at    timestamptz;

-- Guardar el ID del evento en Google Calendar por reserva
alter table reservas add column if not exists google_event_id text default '';
