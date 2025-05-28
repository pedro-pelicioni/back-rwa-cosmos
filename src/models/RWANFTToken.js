const { Model } = require('objection');
const db = require('../database/knex');

// Conectar o Model ao Knex
Model.knex(db);

class RWANFTToken extends Model {
  static get tableName() {
    return 'rwa_nft_tokens';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['rwa_id', 'token_identifier', 'owner_user_id'],
      properties: {
        id: { type: 'integer' },
        rwa_id: { type: 'integer' },
        token_identifier: { type: 'string' },
        owner_user_id: { type: 'integer' },
        metadata_uri: { type: ['string', 'null'] },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    const RWA = require('./RWA');
    const User = require('./User');

    return {
      rwa: {
        relation: Model.BelongsToOneRelation,
        modelClass: RWA,
        join: {
          from: 'rwa_nft_tokens.rwa_id',
          to: 'rwa.id'
        }
      },
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'rwa_nft_tokens.owner_user_id',
          to: 'users.id'
        }
      }
    };
  }

  static async create(tokenData) {
    try {
      return await RWANFTToken.query().insert(tokenData);
    } catch (error) {
      throw new Error(`Erro ao criar token: ${error.message}`);
    }
  }

  static async getById(id) {
    try {
      return await RWANFTToken.query()
        .findById(id)
        .withGraphFetched('[rwa, owner]');
    } catch (error) {
      throw new Error(`Erro ao buscar token: ${error.message}`);
    }
  }

  static async getByRWAId(rwa_id) {
    try {
      return await RWANFTToken.query()
        .where('rwa_id', rwa_id)
        .orderBy('created_at', 'desc')
        .withGraphFetched('[rwa, owner]');
    } catch (error) {
      throw new Error(`Erro ao buscar tokens do RWA: ${error.message}`);
    }
  }

  static async getByOwnerId(owner_user_id) {
    try {
      return await RWANFTToken.query()
        .where('owner_user_id', owner_user_id)
        .orderBy('created_at', 'desc')
        .withGraphFetched('[rwa, owner]');
    } catch (error) {
      throw new Error(`Erro ao buscar tokens do usuário: ${error.message}`);
    }
  }

  static async getByTokenIdentifier(token_identifier) {
    try {
      return await RWANFTToken.query()
        .where('token_identifier', token_identifier)
        .withGraphFetched('[rwa, owner]')
        .first();
    } catch (error) {
      throw new Error(`Erro ao buscar token por identificador: ${error.message}`);
    }
  }

  static async update(id, tokenData) {
    try {
      return await RWANFTToken.query()
        .patchAndFetchById(id, tokenData);
    } catch (error) {
      throw new Error(`Erro ao atualizar token: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      return await RWANFTToken.query().deleteById(id);
    } catch (error) {
      throw new Error(`Erro ao deletar token: ${error.message}`);
    }
  }
}

module.exports = RWANFTToken; 