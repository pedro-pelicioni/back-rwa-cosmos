const { Model } = require('objection');
const db = require('../database/knex');
const { pool } = require('../database/connection');

// Conectar o Model ao Knex
Model.knex(db);

class RWA extends Model {
    static get tableName() {
        return 'rwa';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['name', 'gps_coordinates', 'city', 'country', 'current_value', 'total_tokens', 'user_id'],
            properties: {
                id: { type: 'integer' },
                user_id: { type: 'integer', minimum: 1 },
                name: { type: 'string' },
                gps_coordinates: { type: 'string' },
                city: { type: 'string' },
                country: { type: 'string' },
                description: { type: ['string', 'null'] },
                current_value: { type: 'number', minimum: 0 },
                total_tokens: { type: 'integer', minimum: 1 },
                year_built: { type: ['integer', 'null'] },
                size_m2: { type: ['number', 'null'] },
                status: { 
                    type: 'string',
                    enum: ['active', 'inactive', 'sold']
                },
                geometry: { type: ['object', 'null'] },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        };
    }

    static get relationMappings() {
        const User = require('./User');
        const RWANFTToken = require('./RWANFTToken');
        const RWAImage = require('./RWAImage');
        const RWAFacility = require('./RWAFacility');

        return {
            owner: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'rwa.user_id',
                    to: 'users.id'
                }
            },
            tokens: {
                relation: Model.HasManyRelation,
                modelClass: RWANFTToken,
                join: {
                    from: 'rwa.id',
                    to: 'rwa_nft_tokens.rwa_id'
                }
            },
            images: {
                relation: Model.HasManyRelation,
                modelClass: RWAImage,
                join: {
                    from: 'rwa.id',
                    to: 'rwa_images.rwa_id'
                }
            },
            facilities: {
                relation: Model.HasManyRelation,
                modelClass: RWAFacility,
                join: {
                    from: 'rwa.id',
                    to: 'rwa_facilities.rwa_id'
                }
            }
        };
    }

    static async create(rwaData) {
        try {
            // Garantir que os campos numéricos sejam números e tenham valores válidos
            const data = {
                ...rwaData,
                current_value: Number(rwaData.current_value || 0),
                total_tokens: Number(rwaData.total_tokens || 1),
                user_id: Number(rwaData.user_id),
                year_built: rwaData.year_built ? Number(rwaData.year_built) : null,
                size_m2: rwaData.size_m2 ? Number(rwaData.size_m2) : null
            };

            // Validar campos obrigatórios
            if (!data.user_id || data.user_id <= 0) {
                throw new Error('user_id é obrigatório e deve ser maior que zero');
            }

            if (data.current_value < 0) {
                throw new Error('current_value deve ser maior ou igual a zero');
            }

            if (data.total_tokens < 1) {
                throw new Error('total_tokens deve ser maior que zero');
            }

            const rwa = await RWA.query().insert(data);
            return await RWA.query()
                .findById(rwa.id)
                .withGraphFetched('[owner, images, facilities]');
        } catch (error) {
            throw new Error(`Erro ao criar RWA: ${error.message}`);
        }
    }

    static async createToken(tokenData, trx) {
        try {
            const RWANFTToken = require('./RWANFTToken');
            const token = await RWANFTToken.query(trx).insert({
                rwa_id: tokenData.rwa_id,
                token_identifier: tokenData.token_identifier,
                owner_user_id: tokenData.owner_user_id,
                metadata_uri: tokenData.metadata_uri
            });

            return token;
        } catch (error) {
            throw new Error(`Erro ao criar token NFT: ${error.message}`);
        }
    }

    static async createTokensInBatches(rwaId, ownerUserId, totalTokens, batchSize = 100) {
        const trx = await db.transaction();
        try {
            const tokens = [];
            for (let i = 0; i < totalTokens; i += batchSize) {
                const batchPromises = [];
                const currentBatchSize = Math.min(batchSize, totalTokens - i);
                
                for (let j = 0; j < currentBatchSize; j++) {
                    const tokenNumber = i + j + 1;
                    const tokenData = {
                        rwa_id: rwaId,
                        token_identifier: `${rwaId}-${tokenNumber}`,
                        owner_user_id: ownerUserId,
                        metadata_uri: null
                    };
                    batchPromises.push(RWA.createToken(tokenData, trx));
                }
                
                const batchTokens = await Promise.all(batchPromises);
                tokens.push(...batchTokens);
                console.log(`Lote ${i/batchSize + 1} concluído: ${currentBatchSize} tokens criados`);
            }
            
            await trx.commit();
            return tokens;
        } catch (error) {
            await trx.rollback();
            throw error;
        }
    }

    static async findById(id) {
        try {
            const rwa = await RWA.query()
                .findById(id)
                .withGraphFetched('[owner, images, facilities]');
            
            if (!rwa) return null;

            // Garantir que os campos numéricos sejam números e tenham valores válidos
            return {
                ...rwa,
                current_value: Number(rwa.current_value || 0),
                total_tokens: Number(rwa.total_tokens || 1),
                user_id: Number(rwa.user_id || 0),
                year_built: rwa.year_built ? Number(rwa.year_built) : null,
                size_m2: rwa.size_m2 ? Number(rwa.size_m2) : null
            };
        } catch (error) {
            throw new Error(`Erro ao buscar RWA: ${error.message}`);
        }
    }

    static async findByUserId(userId) {
        try {
            const rwas = await RWA.query()
                .where('user_id', userId)
                .orderBy('created_at', 'desc')
                .withGraphFetched('[owner, images, facilities]');

            // Garantir que os campos numéricos sejam números e tenham valores válidos
            return rwas.map(rwa => ({
                ...rwa,
                current_value: Number(rwa.current_value || 0),
                total_tokens: Number(rwa.total_tokens || 1),
                user_id: Number(rwa.user_id || 0),
                year_built: rwa.year_built ? Number(rwa.year_built) : null,
                size_m2: rwa.size_m2 ? Number(rwa.size_m2) : null
            }));
        } catch (error) {
            throw new Error(`Erro ao buscar RWAs do usuário: ${error.message}`);
        }
    }

    static async update(id, rwaData) {
        try {
            // Garantir que os campos numéricos sejam números e tenham valores válidos
            const data = {
                ...rwaData,
                current_value: rwaData.current_value !== undefined ? Number(rwaData.current_value) : undefined,
                total_tokens: rwaData.total_tokens !== undefined ? Number(rwaData.total_tokens) : undefined,
                user_id: rwaData.user_id !== undefined ? Number(rwaData.user_id) : undefined,
                year_built: rwaData.year_built !== undefined ? Number(rwaData.year_built) : undefined,
                size_m2: rwaData.size_m2 !== undefined ? Number(rwaData.size_m2) : undefined
            };

            // Validar campos se fornecidos
            if (data.current_value !== undefined && data.current_value < 0) {
                throw new Error('current_value deve ser maior ou igual a zero');
            }

            if (data.total_tokens !== undefined && data.total_tokens < 1) {
                throw new Error('total_tokens deve ser maior que zero');
            }

            if (data.user_id !== undefined && data.user_id <= 0) {
                throw new Error('user_id deve ser maior que zero');
            }

            await RWA.query().patchAndFetchById(id, data);
            return await RWA.query()
                .findById(id)
                .withGraphFetched('[owner, images, facilities]');
        } catch (error) {
            throw new Error(`Erro ao atualizar RWA: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            return await RWA.query().deleteById(id);
        } catch (error) {
            throw new Error(`Erro ao deletar RWA: ${error.message}`);
        }
    }

    static async listAll(filters = {}, page = 1, limit = 10) {
        try {
            let query = RWA.query();

            // Aplicar filtros
            if (filters.city) {
                query = query.where('city', 'ilike', `%${filters.city}%`);
            }

            if (filters.country) {
                query = query.where('country', 'ilike', `%${filters.country}%`);
            }

            if (filters.status) {
                query = query.where('status', filters.status);
            }

            // Adicionar paginação
            const offset = (page - 1) * limit;
            const rwas = await query
                .orderBy('created_at', 'desc')
                .limit(limit)
                .offset(offset)
                .withGraphFetched('[owner, images, facilities]');

            // Garantir que os campos numéricos sejam números e tenham valores válidos
            return rwas.map(rwa => ({
                ...rwa,
                current_value: Number(rwa.current_value || 0),
                total_tokens: Number(rwa.total_tokens || 1),
                user_id: Number(rwa.user_id || 0),
                year_built: rwa.year_built ? Number(rwa.year_built) : null,
                size_m2: rwa.size_m2 ? Number(rwa.size_m2) : null
            }));
        } catch (error) {
            throw new Error(`Erro ao listar RWAs: ${error.message}`);
        }
    }

    static async findByProximity(latitude, longitude, radius = 1000) {
        try {
            const rwas = await RWA.query()
                .orderBy('created_at', 'desc')
                .withGraphFetched('[owner, images, facilities]');

            // Garantir que os campos numéricos sejam números e tenham valores válidos
            return rwas.map(rwa => ({
                ...rwa,
                current_value: Number(rwa.current_value || 0),
                total_tokens: Number(rwa.total_tokens || 1),
                user_id: Number(rwa.user_id || 0),
                year_built: rwa.year_built ? Number(rwa.year_built) : null,
                size_m2: rwa.size_m2 ? Number(rwa.size_m2) : null
            }));
        } catch (error) {
            throw new Error(`Erro ao buscar RWAs por proximidade: ${error.message}`);
        }
    }

    static async findTokensByOwner(userId) {
        try {
            const result = await pool.query(
                `SELECT t.*, r.name as rwa_name, r.city, r.state
                 FROM rwa_nft_tokens t
                 JOIN rwa r ON t.rwa_id = r.id
                 WHERE t.owner_user_id = $1
                 ORDER BY t.created_at DESC`,
                [userId]
            );
            return result.rows;
        } catch (error) {
            throw new Error(`Erro ao buscar tokens do usuário: ${error.message}`);
        }
    }

    static async findUserById(userId) {
        try {
            const user = await db('users')
                .select('id', 'email', 'wallet_address', 'created_at')
                .where('id', userId)
                .first();

            return user;
        } catch (error) {
            throw new Error(`Erro ao buscar usuário: ${error.message}`);
        }
    }
}

module.exports = RWA; 