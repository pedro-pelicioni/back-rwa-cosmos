const db = require('../config/database');

class RWANFTToken {
  static async create(tokenData) {
    const { rwa_id, token_identifier, owner_user_id, metadata_uri } = tokenData;
    const query = `
      INSERT INTO rwa_nft_tokens (rwa_id, token_identifier, owner_user_id, metadata_uri)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [rwa_id, token_identifier, owner_user_id, metadata_uri];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getById(id) {
    const query = 'SELECT * FROM rwa_nft_tokens WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getByRWAId(rwa_id) {
    const query = 'SELECT * FROM rwa_nft_tokens WHERE rwa_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [rwa_id]);
    return result.rows;
  }

  static async getByOwnerId(owner_user_id) {
    const query = 'SELECT * FROM rwa_nft_tokens WHERE owner_user_id = $1 ORDER BY created_at DESC';
    const result = await db.query(query, [owner_user_id]);
    return result.rows;
  }

  static async update(id, tokenData) {
    const { token_identifier, owner_user_id, metadata_uri } = tokenData;
    const query = `
      UPDATE rwa_nft_tokens
      SET token_identifier = $1,
          owner_user_id = $2,
          metadata_uri = $3,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const values = [token_identifier, owner_user_id, metadata_uri, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM rwa_nft_tokens WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = RWANFTToken; 