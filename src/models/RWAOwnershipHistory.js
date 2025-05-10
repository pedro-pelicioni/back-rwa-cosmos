const { pool } = require('../database/connection');

class RWAOwnershipHistory {
  static async create(historyData) {
    const { rwa_id, token_id, from_user_id, to_user_id, quantity, tx_hash } = historyData;
    const query = `
      INSERT INTO rwa_ownership_history (rwa_id, token_id, from_user_id, to_user_id, quantity, tx_hash)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [rwa_id, token_id, from_user_id, to_user_id, quantity, tx_hash];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getById(id) {
    const query = 'SELECT * FROM rwa_ownership_history WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByRWAId(rwa_id) {
    const query = 'SELECT * FROM rwa_ownership_history WHERE rwa_id = $1 ORDER BY transfer_date DESC';
    const result = await pool.query(query, [rwa_id]);
    return result.rows;
  }

  static async getByTokenId(token_id) {
    const query = 'SELECT * FROM rwa_ownership_history WHERE token_id = $1 ORDER BY transfer_date DESC';
    const result = await pool.query(query, [token_id]);
    return result.rows;
  }

  static async getByUserId(user_id, type) {
    let query;
    if (type === 'sent') {
      query = 'SELECT * FROM rwa_ownership_history WHERE from_user_id = $1 ORDER BY transfer_date DESC';
    } else if (type === 'received') {
      query = 'SELECT * FROM rwa_ownership_history WHERE to_user_id = $1 ORDER BY transfer_date DESC';
    } else {
      query = `
        SELECT * FROM rwa_ownership_history 
        WHERE from_user_id = $1 OR to_user_id = $1 
        ORDER BY transfer_date DESC
      `;
    }
    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  static async update(id, historyData) {
    const { token_id, from_user_id, to_user_id, quantity, tx_hash } = historyData;
    const query = `
      UPDATE rwa_ownership_history
      SET token_id = $1,
          from_user_id = $2,
          to_user_id = $3,
          quantity = $4,
          tx_hash = $5,
          transfer_date = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    const values = [token_id, from_user_id, to_user_id, quantity, tx_hash, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM rwa_ownership_history WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = RWAOwnershipHistory; 