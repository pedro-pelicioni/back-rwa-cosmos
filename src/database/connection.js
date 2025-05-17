const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  connectionString: 'postgres://avnadmin:AVNS_zw8vtVrsCTR_oC7ZVJR@imolatan-rwa-imolatam.g.aivencloud.com:13273/defaultdb?sslmode=require',
  ssl: {
    rejectUnauthorized: false // Necessário para conexões SSL
  }
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