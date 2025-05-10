-- Criar tabela de imagens do RWA
CREATE TABLE IF NOT EXISTS rwa_images (
    id SERIAL PRIMARY KEY,
    rwa_id INTEGER NOT NULL REFERENCES rwa(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cid_link VARCHAR(255),
    file_path VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_image_order_per_rwa UNIQUE (rwa_id, display_order)
);

-- Criar índice para melhorar performance de busca
CREATE INDEX idx_rwa_images_rwa_id ON rwa_images(rwa_id); 