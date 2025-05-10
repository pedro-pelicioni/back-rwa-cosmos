-- Atualiza a tabela kyc para usar wallet_address
ALTER TABLE IF EXISTS kyc RENAME COLUMN user_address TO wallet_address;

-- Verifica se a tabela kyc existe e se não, cria com a estrutura correta
CREATE TABLE IF NOT EXISTS kyc (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL REFERENCES users(wallet_address) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    documento_frente_cid VARCHAR(255) NOT NULL,
    documento_verso_cid VARCHAR(255) NOT NULL,
    selfie_1_cid VARCHAR(255) NOT NULL,
    selfie_2_cid VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cria um índice para busca rápida por wallet_address
CREATE INDEX IF NOT EXISTS idx_kyc_wallet_address ON kyc(wallet_address); 