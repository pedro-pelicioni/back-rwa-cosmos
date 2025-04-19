const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runMigration() {
    try {
        // Lê o arquivo SQL
        const sqlFile = path.join(__dirname, 'migrations', 'create_users_table.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Executa o SQL
        await db.query(sql);
        console.log('Migração executada com sucesso!');
    } catch (error) {
        console.error('Erro ao executar migração:', error.message);
    } finally {
        db.pool.end();
    }
}

runMigration(); 