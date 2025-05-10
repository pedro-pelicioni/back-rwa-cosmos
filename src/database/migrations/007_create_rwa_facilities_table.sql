-- Criar tabela de instalações do RWA
CREATE TABLE IF NOT EXISTS rwa_facilities (
    id SERIAL PRIMARY KEY,
    rwa_id INTEGER NOT NULL REFERENCES rwa(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    size_m2 DECIMAL(10,2),
    floor_number INTEGER,
    type VARCHAR(50) NOT NULL, -- quarto, sala, cozinha, banheiro, etc
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, under_renovation
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_facility_name_per_rwa UNIQUE (rwa_id, name)
);

-- Criar índices para melhorar performance de busca
CREATE INDEX idx_rwa_facilities_rwa_id ON rwa_facilities(rwa_id);
CREATE INDEX idx_rwa_facilities_type ON rwa_facilities(type);
CREATE INDEX idx_rwa_facilities_status ON rwa_facilities(status); 