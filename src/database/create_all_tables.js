const fs = require('fs');
const path = require('path');
const { pool } = require('./connection');

async function createAllTables() {
    try {
        // Lê todos os arquivos SQL na pasta migrations
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Garante ordem alfabética

        // Executa cada arquivo SQL em sequência
        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            
            console.log(`Executando migração: ${file}`);
            try {
                await pool.query(sql);
                console.log(`Migração ${file} concluída com sucesso`);
            } catch (error) {
                // Ignora erro de tabela já existente
                if (error.code === '42P07') {
                    console.log(`Tabela já existe, ignorando erro: ${file}`);
                } else {
                    throw error;
                }
            }
        }

        console.log('Todas as tabelas foram criadas com sucesso!');
    } catch (error) {
        console.error('Erro ao criar tabelas:', error);
        throw error;
    }
}

// Executa a função se este arquivo for executado diretamente
if (require.main === module) {
    createAllTables()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = createAllTables; 