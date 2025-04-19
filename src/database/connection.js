const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'rwa_cosmos',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
});

// Teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão com banco de dados PostgreSQL estabelecida com sucesso');
  release();
});

module.exports = { pool }; 