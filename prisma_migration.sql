-- Adiciona suporte a conta de cliente (portal VIP)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS password_hash TEXT;
