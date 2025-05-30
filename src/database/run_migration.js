const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function runMigration() {
  try {
    // Lê o arquivo SQL
    const sqlFile = path.join(__dirname, 'migrations', '010_update_kyc_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Executa a migração
    await pool.query(sql);
    console.log('Migração executada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao executar migração:', error);
    process.exit(1);
  }
}

runMigration(); 