const { pool } = require('../connection');

async function up() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rwa_token_transactions (
        id SERIAL PRIMARY KEY,
        token_id INTEGER NOT NULL REFERENCES rwa_nft_tokens(id),
        from_user_id INTEGER NOT NULL REFERENCES users(id),
        to_user_id INTEGER NOT NULL REFERENCES users(id),
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('sale', 'transfer')),
        price_per_token DECIMAL(20,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_rwa_token_transactions_token_id ON rwa_token_transactions(token_id);
      CREATE INDEX idx_rwa_token_transactions_from_user_id ON rwa_token_transactions(from_user_id);
      CREATE INDEX idx_rwa_token_transactions_to_user_id ON rwa_token_transactions(to_user_id);
      CREATE INDEX idx_rwa_token_transactions_type ON rwa_token_transactions(transaction_type);
    `);
    console.log('Migração rwa_token_transactions criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar migração rwa_token_transactions:', error);
    throw error;
  }
}

async function down() {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS rwa_token_transactions CASCADE;
    `);
    console.log('Migração rwa_token_transactions removida com sucesso');
  } catch (error) {
    console.error('Erro ao remover migração rwa_token_transactions:', error);
    throw error;
  }
}

module.exports = { up, down }; 