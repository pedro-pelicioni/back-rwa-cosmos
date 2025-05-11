const { Pool } = require('pg');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Configuração da conexão com o PostgreSQL
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'admin',
  port: process.env.POSTGRES_PORT || 5432,
});

async function addImageDataColumn() {
  const client = await pool.connect();
  try {
    console.log('Adicionando coluna image_data à tabela rwa_images...');
    
    // SQL para adicionar a coluna
    const sql = `ALTER TABLE rwa_images ADD COLUMN IF NOT EXISTS image_data TEXT;`;
    
    await client.query(sql);
    console.log('Coluna image_data adicionada com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar coluna image_data:', error);
  } finally {
    client.release();
  }
}

// Executa a função
addImageDataColumn()
  .then(() => {
    console.log('Migração concluída.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erro durante a migração:', error);
    process.exit(1);
  }); 