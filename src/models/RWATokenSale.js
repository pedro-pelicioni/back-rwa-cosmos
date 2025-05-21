const db = require('../config/database');

class RWATokenSale {
  static async initiate(saleData) {
    const { token_id, seller_id, quantity, price_per_token } = saleData;
    const query = `
      INSERT INTO rwa_token_sales 
      (token_id, seller_id, quantity, price_per_token, status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `;
    
    const values = [token_id, seller_id, quantity, price_per_token];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async confirm(saleId, buyerId, transactionHash, signature) {
    const query = `
      UPDATE rwa_token_sales 
      SET buyer_id = $1,
          transaction_hash = $2,
          signature = $3,
          status = 'completed',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND status = 'pending'
      RETURNING *
    `;
    
    const values = [buyerId, transactionHash, signature, saleId];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async cancel(saleId) {
    const query = `
      UPDATE rwa_token_sales 
      SET status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'pending'
      RETURNING *
    `;
    
    const result = await db.query(query, [saleId]);
    return result.rows[0];
  }

  static async getById(id) {
    const query = `
      SELECT * FROM rwa_token_sales 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getByTokenId(tokenId) {
    const query = `
      SELECT s.*, t.owner_user_id as current_owner_id
      FROM rwa_token_sales s
      JOIN rwa_nft_tokens t ON s.token_id = t.id
      WHERE s.token_id = $1
      ORDER BY s.created_at DESC
    `;
    
    const result = await db.query(query, [tokenId]);
    return result.rows;
  }

  static async getBySellerId(sellerId) {
    const query = `
      SELECT * FROM rwa_token_sales 
      WHERE seller_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [sellerId]);
    return result.rows;
  }

  static async getByBuyerId(buyerId) {
    const query = `
      SELECT * FROM rwa_token_sales 
      WHERE buyer_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await db.query(query, [buyerId]);
    return result.rows;
  }

  static async getAvailableSales(userId) {
    const query = `
      SELECT s.* 
      FROM rwa_token_sales s
      JOIN rwa_nft_tokens t ON s.token_id = t.id
      WHERE s.status = 'pending'
      AND t.owner_user_id != $1
      ORDER BY s.created_at DESC
    `;
    
    const result = await db.query(query, [userId]);
    return result.rows;
  }
}

module.exports = RWATokenSale; 