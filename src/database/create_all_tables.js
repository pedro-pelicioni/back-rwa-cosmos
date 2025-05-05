const { pool } = require('./connection');

const queries = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    address VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS kyc (
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
  );`,
  `CREATE TABLE IF NOT EXISTS wallet_nonces (
    address VARCHAR(100) PRIMARY KEY,
    nonce VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`
];

(async () => {
  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('Tabelas criadas ou já existentes!');
    process.exit(0);
  } catch (err) {
    console.error('Erro ao criar tabelas:', err);
    process.exit(1);
  }
})(); 