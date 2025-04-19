const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function runMigration() {
    try {
        console.log('Iniciando migração das tabelas...');
        
        // Lê o arquivo SQL da tabela de usuários
        const usersSqlFile = path.join(__dirname, 'migrations', 'create_users_table.sql');
        const usersSql = fs.readFileSync(usersSqlFile, 'utf8');

        // Executa o SQL para criar tabela de usuários
        await pool.query(usersSql);
        console.log('Tabela de usuários criada ou atualizada com sucesso!');
        
        // Lê o arquivo SQL da tabela de KYC
        const kycSqlFile = path.join(__dirname, 'migrations', 'create_kyc_table.sql');
        const kycSql = fs.readFileSync(kycSqlFile, 'utf8');
        
        // Executa o SQL para criar tabela de KYC
        await pool.query(kycSql);
        console.log('Tabela de KYC criada ou atualizada com sucesso!');
        
        console.log('Todas as migrações foram executadas com sucesso!');
    } catch (error) {
        console.error('Erro ao executar migração:', error.message);
    } finally {
        pool.end();
    }
}

// Executa a migração
runMigration(); 