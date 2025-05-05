-- Criar tabela de KYC
CREATE TABLE kyc (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(100) REFERENCES users(address),
  nome VARCHAR(100),
  cpf VARCHAR(20),
  documento_frente_cid VARCHAR(255),
  documento_verso_cid VARCHAR(255),
  selfie_1_cid VARCHAR(255),
  selfie_2_cid VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 