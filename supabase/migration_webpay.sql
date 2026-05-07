-- WebPay credentials en client_integrations
alter table client_integrations
  add column if not exists webpay_api_key text default '';

-- Campos de estado en pagos para el flujo WebPay
alter table pagos
  add column if not exists webpay_token              text default '',
  add column if not exists webpay_authorization_code text default '',
  add column if not exists webpay_transaction_date   timestamptz;
