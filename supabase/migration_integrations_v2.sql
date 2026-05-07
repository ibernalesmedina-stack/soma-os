-- Agregar campos adicionales a client_integrations
alter table client_integrations add column if not exists resend_api_key text default '';
alter table client_integrations add column if not exists resend_email text default '';
alter table client_integrations add column if not exists transfer_banco text default '';
alter table client_integrations add column if not exists transfer_cuenta text default '';
alter table client_integrations add column if not exists transfer_rut text default '';
alter table client_integrations add column if not exists domain_status text default 'pending' check (domain_status in ('pending', 'connected', 'error'));
alter table client_integrations add column if not exists whatsapp_status text default 'disconnected' check (whatsapp_status in ('connected', 'disconnected'));
alter table client_integrations add column if not exists calendar_status text default 'disconnected' check (calendar_status in ('synced', 'disconnected'));
alter table client_integrations add column if not exists webpay_status text default 'inactive' check (webpay_status in ('active', 'inactive'));
alter table client_integrations add column if not exists transfer_status text default 'unverified' check (transfer_status in ('verified', 'unverified'));
alter table client_integrations add column if not exists resend_status text default 'disconnected' check (resend_status in ('connected', 'disconnected'));
