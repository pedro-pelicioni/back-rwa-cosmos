-- Adicionar a coluna image_data à tabela rwa_images
ALTER TABLE rwa_images ADD COLUMN IF NOT EXISTS image_data TEXT; 