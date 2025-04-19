const db = require('../config/database');

async function testUsersTable() {
    try {
        // Buscar todos os usuários
        const result = await db.query('SELECT * FROM users');
        console.log('Usuários cadastrados:');
        console.log(result.rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error.message);
    } finally {
        db.pool.end();
    }
}

testUsersTable(); 