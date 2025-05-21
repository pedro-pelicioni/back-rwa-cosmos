const { pool } = require('./connection');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Iniciando migração...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, 'migrations', '012_add_timestamps_to_token_sales.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar a migração
    await pool.query(migrationSQL);
    console.log('Migração concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao executar migração:', error);
  } finally {
    await pool.end();
  }
}

runMigration(); 