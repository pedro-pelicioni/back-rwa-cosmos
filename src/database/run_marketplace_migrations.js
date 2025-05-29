const { pool } = require('./connection');
const fs = require('fs');
const path = require('path');

async function runMarketplaceMigrations() {
    try {
        console.log('Iniciando migrações do marketplace...');
        
        // Lista de migrations a serem executadas
        const migrations = [
            '013_create_rwa_token_listings_table.sql',
            '014_create_rwa_token_price_history_table.sql'
        ];

        for (const migrationFile of migrations) {
            console.log(`Executando migração: ${migrationFile}`);
            const migrationPath = path.join(__dirname, 'migrations', migrationFile);
            const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
            
            await pool.query(migrationSQL);
            console.log(`Migração ${migrationFile} concluída com sucesso!`);
        }

        console.log('Todas as migrações do marketplace foram concluídas com sucesso!');
    } catch (error) {
        console.error('Erro ao executar migrações:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMarketplaceMigrations(); 