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

async function createRWATables() {
  try {
    console.log('Iniciando criação das tabelas de RWA...');

    // 1. Criar tabela RWA
    await pool.query(`
      DROP TABLE IF EXISTS rwa_ownership_history;
      DROP TABLE IF EXISTS rwa_nft_tokens;
      DROP TABLE IF EXISTS rwa_facilities;
      DROP TABLE IF EXISTS rwa_images;
      DROP TABLE IF EXISTS rwa CASCADE;

      CREATE TABLE rwa (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          name VARCHAR(255) NOT NULL,
          gps_coordinates VARCHAR(255) NOT NULL,
          city VARCHAR(100) NOT NULL,
          country VARCHAR(100) NOT NULL,
          description TEXT,
          current_value DECIMAL(18, 2) NOT NULL,
          total_tokens INTEGER NOT NULL,
          year_built INTEGER,
          size_m2 DECIMAL(10, 2),
          status VARCHAR(20) DEFAULT 'active',
          geometry JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela RWA criada com sucesso!');

    // 2. Criar tabela de imagens
    await pool.query(`
      CREATE TABLE rwa_images (
          id SERIAL PRIMARY KEY,
          rwa_id INTEGER REFERENCES rwa(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          cid_link VARCHAR(255),
          file_path VARCHAR(255),
          image_data TEXT,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela RWA Images criada com sucesso!');

    // 3. Criar tabela de instalações
    await pool.query(`
      CREATE TABLE rwa_facilities (
          id SERIAL PRIMARY KEY,
          rwa_id INTEGER REFERENCES rwa(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          size_m2 DECIMAL(10, 2),
          floor_number INTEGER,
          type VARCHAR(50) NOT NULL,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela RWA Facilities criada com sucesso!');

    // 4. Criar tabela de tokens NFT
    await pool.query(`
      CREATE TABLE rwa_nft_tokens (
          id SERIAL PRIMARY KEY,
          rwa_id INTEGER REFERENCES rwa(id) ON DELETE CASCADE,
          token_identifier VARCHAR(255) NOT NULL,
          owner_user_id INTEGER REFERENCES users(id),
          metadata_uri VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela RWA NFT Tokens criada com sucesso!');

    // 5. Criar tabela de histórico de propriedade
    await pool.query(`
      CREATE TABLE rwa_ownership_history (
          id SERIAL PRIMARY KEY,
          rwa_id INTEGER REFERENCES rwa(id) ON DELETE CASCADE,
          token_id INTEGER REFERENCES rwa_nft_tokens(id),
          from_user_id INTEGER REFERENCES users(id),
          to_user_id INTEGER REFERENCES users(id) NOT NULL,
          quantity INTEGER NOT NULL,
          transfer_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          tx_hash VARCHAR(255)
      );
    `);
    console.log('Tabela RWA Ownership History criada com sucesso!');

    // 6. Inserir dados de exemplo para testes
    await pool.query(`
      INSERT INTO rwa (user_id, name, gps_coordinates, city, country, description, current_value, total_tokens, year_built, size_m2, status)
      VALUES (
          1, 
          'Apartamento Centro SP', 
          '-23.550520,-46.633308', 
          'São Paulo', 
          'Brasil',
          'Apartamento de luxo no centro de São Paulo com vista panorâmica', 
          1200000.00, 
          1000, 
          2015, 
          120.50, 
          'active'
      );

      INSERT INTO rwa (user_id, name, gps_coordinates, city, country, description, current_value, total_tokens, year_built, size_m2, status)
      VALUES (
          1, 
          'Casa de Praia Guarujá', 
          '-23.993440,-46.258231', 
          'Guarujá', 
          'Brasil',
          'Linda casa à beira-mar com acesso exclusivo à praia', 
          2500000.00, 
          2000, 
          2010, 
          350.00, 
          'active'
      );
    `);
    console.log('Dados de exemplo inseridos com sucesso!');

    console.log('Todas as tabelas RWA foram criadas e configuradas com sucesso!');
  } catch (err) {
    console.error('Erro ao criar tabelas de RWA:', err);
  } finally {
    await pool.end();
  }
}

createRWATables(); 