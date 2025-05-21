-- Adicionar colunas de timestamp para vendas de tokens
ALTER TABLE rwa_token_sales
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE; 