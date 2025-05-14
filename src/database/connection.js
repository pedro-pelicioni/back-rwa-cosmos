const { Pool } = require('pg');
const dotenv = require('dotenv');
let neonConfig;

// Tentativa de importar a configuração do Neon
try {
  neonConfig = require('./neon-config');
} catch (e) {
  console.log('Arquivo neon-config.js não encontrado, usando variáveis de ambiente');
}

dotenv.config();

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
                   (neonConfig ? neonConfig.connectionString : 'postgresql://neondb_owner:npg_jue6LpGKXAJ4@ep-shiny-king-ac9i6o7y-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'),
  ssl: {
    rejectUnauthorized: false // Necessário para conexões SSL com Neon
  }
});

// Teste de conexão
pool.connect((err, client, release) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conexão com banco de dados PostgreSQL Neon estabelecida com sucesso');
  release();
});

module.exports = { pool }; 