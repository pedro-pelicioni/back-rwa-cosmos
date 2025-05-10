-- Tabela de histórico de propriedade dos tokens do RWA
CREATE TABLE IF NOT EXISTS rwa_ownership_history (
    id SERIAL PRIMARY KEY,
    rwa_id INTEGER NOT NULL REFERENCES rwa(id) ON DELETE CASCADE,
    token_id INTEGER REFERENCES rwa_nft_tokens(id) ON DELETE SET NULL,
    from_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tx_hash VARCHAR(255),
    CONSTRAINT fk_token_rwa FOREIGN KEY (token_id, rwa_id) REFERENCES rwa_nft_tokens(id, rwa_id) ON DELETE SET NULL
);

-- Índices para busca
CREATE INDEX idx_rwa_ownership_history_rwa_id ON rwa_ownership_history(rwa_id);
CREATE INDEX idx_rwa_ownership_history_to_user_id ON rwa_ownership_history(to_user_id);
CREATE INDEX idx_rwa_ownership_history_from_user_id ON rwa_ownership_history(from_user_id); 