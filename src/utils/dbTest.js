const db = require('../config/database');

async function testConnection() {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('Conexão com o banco de dados estabelecida com sucesso!');
        console.log('Timestamp do servidor:', result.rows[0].now);
    } catch (error) {
        console.error('Erro ao conectar com o banco de dados:', error.message);
    } finally {
        db.pool.end();
    }
}

testConnection(); 