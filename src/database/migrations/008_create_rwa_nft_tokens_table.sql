-- Tabela de tokens NFT gerados para o RWA
CREATE TABLE IF NOT EXISTS rwa_nft_tokens (
    id SERIAL PRIMARY KEY,
    rwa_id INTEGER NOT NULL REFERENCES rwa(id) ON DELETE CASCADE,
    token_identifier VARCHAR(100) NOT NULL,
    owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metadata_uri VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_token_per_rwa UNIQUE (rwa_id, token_identifier)
);

-- Índices para busca
CREATE INDEX idx_rwa_nft_tokens_rwa_id ON rwa_nft_tokens(rwa_id);
CREATE INDEX idx_rwa_nft_tokens_owner_user_id ON rwa_nft_tokens(owner_user_id); 