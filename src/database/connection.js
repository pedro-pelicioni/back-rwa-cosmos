const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Lê o certificado CA
const ca = fs.readFileSync(path.join(__dirname, '../../ca.pem'), 'utf8');

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  connectionString: process.env.NODE_ENV === 'production' 
    ? 'postgres://avnadmin:AVNS_zw8vtVrsCTR_oC7ZVJR@imolatan-rwa-imolatam.g.aivencloud.com:13273/defaultdb'
    : 'postgres://postgres:admin@localhost:5432/postgres',
  ssl: process.env.NODE_ENV === 'production' 
    ? {
        ca,
        rejectUnauthorized: true
      }
    : false
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