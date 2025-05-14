-- Corrigir problemas nas migrações

-- 1. Corrigir a referência na tabela kyc (user_address referencia wallet_address em vez de address)
DROP TABLE IF EXISTS kyc;

CREATE TABLE kyc (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(100) REFERENCES users(wallet_address),
  nome VARCHAR(100),
  cpf VARCHAR(20),
  documento_frente_cid VARCHAR(255),
  documento_verso_cid VARCHAR(255),
  selfie_1_cid VARCHAR(255),
  selfie_2_cid VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Criar a tabela wallet_nonces se não existir
CREATE TABLE IF NOT EXISTS wallet_nonces (
  address VARCHAR(100) PRIMARY KEY,
  nonce VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 