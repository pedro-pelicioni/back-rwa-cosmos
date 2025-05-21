const fs = require('fs').promises;
const path = require('path');
const { pool } = require('./connection');

async function runMigrations() {
  try {
    // Criar tabela de migrações se não existir
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ler diretório de migrações
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => f.endsWith('.js')).sort();

    // Executar migrações pendentes
    for (const file of migrationFiles) {
      const migrationName = path.basename(file, '.js');
      
      // Verificar se migração já foi executada
      const { rows } = await pool.query(
        'SELECT * FROM migrations WHERE name = $1',
        [migrationName]
      );

      if (rows.length === 0) {
        console.log(`Executando migração: ${migrationName}`);
        const migration = require(path.join(migrationsDir, file));
        
        await migration.up();
        
        // Registrar migração executada
        await pool.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migrationName]
        );
        
        console.log(`Migração ${migrationName} executada com sucesso`);
      }
    }

    console.log('Todas as migrações foram executadas com sucesso');
  } catch (error) {
    console.error('Erro ao executar migrações:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations(); 