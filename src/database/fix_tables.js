const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuração da conexão com o PostgreSQL (Aiven)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://avnadmin:AVNS_zw8vtVrsCTR_oC7ZVJR@imolatan-rwa-imolatam.g.aivencloud.com:13273/defaultdb',
  ssl: {
    rejectUnauthorized: true
  }
});

async function fixTables() {
  try {
    console.log('Iniciando correção das tabelas...');

    // 1. Criar tabela de usuários
    await pool.query(`
      -- Remover tabela se existir (desenvolvimento)
      DROP TABLE IF EXISTS kyc;
      DROP TABLE IF EXISTS wallet_nonces;
      DROP TABLE IF EXISTS users CASCADE;

      -- Criar tabela de usuários
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
    `);
    console.log('Tabela de usuários criada com sucesso!');

    // 2. Criar tabela wallet_nonces
    await pool.query(`
      CREATE TABLE wallet_nonces (
        address VARCHAR(100) PRIMARY KEY,
        nonce VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela wallet_nonces criada com sucesso!');

    // 3. Criar tabela kyc
    await pool.query(`
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
    `);
    console.log('Tabela kyc criada com sucesso!');

    console.log('Todas as tabelas foram corrigidas com sucesso!');
  } catch (err) {
    console.error('Erro ao corrigir tabelas:', err);
  } finally {
    await pool.end();
  }
}

fixTables(); 