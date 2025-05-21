const { pool } = require('../connection');

async function up() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rwa_token_sales (
        id SERIAL PRIMARY KEY,
        token_id INTEGER NOT NULL REFERENCES rwa_nft_tokens(id),
        seller_id INTEGER NOT NULL REFERENCES users(id),
        buyer_id INTEGER NOT NULL REFERENCES users(id),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price_per_token DECIMAL(20,2) NOT NULL CHECK (price_per_token > 0),
        transaction_hash VARCHAR(255),
        signature TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_rwa_token_sales_token_id ON rwa_token_sales(token_id);
      CREATE INDEX idx_rwa_token_sales_seller_id ON rwa_token_sales(seller_id);
      CREATE INDEX idx_rwa_token_sales_buyer_id ON rwa_token_sales(buyer_id);
      CREATE INDEX idx_rwa_token_sales_status ON rwa_token_sales(status);
    `);
    console.log('Migração rwa_token_sales criada com sucesso');
  } catch (error) {
    console.error('Erro ao criar migração rwa_token_sales:', error);
    throw error;
  }
}

async function down() {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS rwa_token_sales CASCADE;
    `);
    console.log('Migração rwa_token_sales removida com sucesso');
  } catch (error) {
    console.error('Erro ao remover migração rwa_token_sales:', error);
    throw error;
  }
}

module.exports = { up, down }; 