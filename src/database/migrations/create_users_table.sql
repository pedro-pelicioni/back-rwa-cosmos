-- Remover tabela se existir (desenvolvimento)
DROP TABLE IF EXISTS kyc;
DROP TABLE IF EXISTS users;

-- Criar tabela de usuários com estrutura limpa para wallet
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir admin inicial
INSERT INTO users (name, address, role) 
VALUES ('Admin', 'neutron1admin', 'admin'); 