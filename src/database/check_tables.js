const { pool } = require('./connection');

(async () => {
  try {
    const result = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    console.log('Tabelas no banco de dados:');
    result.rows.forEach(row => console.log(row.tablename));
    process.exit(0);
  } catch (err) {
    console.error('Erro ao listar tabelas:', err);
    process.exit(1);
  }
})(); 