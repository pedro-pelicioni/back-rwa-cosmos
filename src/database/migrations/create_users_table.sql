-- Remover tabela se existir (desenvolvimento)
DROP TABLE IF EXISTS kyc;
DROP TABLE IF EXISTS users CASCADE;

-- Criar tabela de usuários com estrutura limpa para wallet
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    wallet_address VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir admin inicial
INSERT INTO users (email, wallet_address) 
VALUES ('admin@rwa.com', 'neutron1admin'); 