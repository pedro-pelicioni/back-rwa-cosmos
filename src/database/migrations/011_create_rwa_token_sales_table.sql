-- Criar tabela de vendas de tokens
CREATE TABLE IF NOT EXISTS rwa_token_sales (
    id SERIAL PRIMARY KEY,
    token_id INTEGER NOT NULL REFERENCES rwa_nft_tokens(id),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    buyer_id INTEGER REFERENCES users(id),
    quantity INTEGER NOT NULL,
    price_per_token DECIMAL NOT NULL,
    tx_hash VARCHAR(255),
    signature TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'cancelled'))
);

-- Criar índices para melhorar performance
CREATE INDEX idx_rwa_token_sales_token_id ON rwa_token_sales(token_id);
CREATE INDEX idx_rwa_token_sales_seller_id ON rwa_token_sales(seller_id);
CREATE INDEX idx_rwa_token_sales_buyer_id ON rwa_token_sales(buyer_id);
CREATE INDEX idx_rwa_token_sales_status ON rwa_token_sales(status); 