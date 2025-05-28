const { Model } = require('objection');
const db = require('../database/knex');

// Conectar o Model ao Knex
Model.knex(db);

class User extends Model {
    static get tableName() {
        return 'users';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                id: { type: 'integer' },
                email: { type: 'string', format: 'email' },
                password: { type: 'string', minLength: 6 },
                name: { type: ['string', 'null'] },
                role: { 
                    type: 'string',
                    enum: ['user', 'admin']
                },
                status: { 
                    type: 'string',
                    enum: ['active', 'inactive']
                },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        };
    }

    static get relationMappings() {
        const RWA = require('./RWA');
        const RWANFTToken = require('./RWANFTToken');

        return {
            rwas: {
                relation: Model.HasManyRelation,
                modelClass: RWA,
                join: {
                    from: 'users.id',
                    to: 'rwa.user_id'
                }
            },
            tokens: {
                relation: Model.HasManyRelation,
                modelClass: RWANFTToken,
                join: {
                    from: 'users.id',
                    to: 'rwa_nft_tokens.owner_user_id'
                }
            }
        };
    }

    static async create(userData) {
        try {
            return await User.query().insert(userData);
        } catch (error) {
            throw new Error(`Erro ao criar usuário: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            return await User.query().findById(id);
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`);
        }
    }

    static async findByEmail(email) {
        try {
            return await User.query()
                .where('email', email)
                .first();
        } catch (error) {
            throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
        }
    }

    static async update(id, userData) {
        try {
            return await User.query()
                .patchAndFetchById(id, userData);
        } catch (error) {
            throw new Error(`Erro ao atualizar usuário: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            return await User.query().deleteById(id);
        } catch (error) {
            throw new Error(`Erro ao deletar usuário: ${error.message}`);
        }
    }
}

module.exports = User; 