const { Model } = require('objection');
const db = require('../database/knex');

// Conectar o Model ao Knex
Model.knex(db);

class RWAFacility extends Model {
    static get tableName() {
        return 'rwa_facilities';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['rwa_id', 'name', 'type'],
            properties: {
                id: { type: 'integer' },
                rwa_id: { type: 'integer' },
                name: { type: 'string' },
                description: { type: ['string', 'null'] },
                size_m2: { type: ['number', 'null'] },
                floor_number: { type: ['integer', 'null'] },
                type: { type: 'string' },
                status: { 
                    type: 'string',
                    enum: ['active', 'inactive', 'maintenance']
                },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        };
    }

    static get relationMappings() {
        const RWA = require('./RWA');

        return {
            rwa: {
                relation: Model.BelongsToOneRelation,
                modelClass: RWA,
                join: {
                    from: 'rwa_facilities.rwa_id',
                    to: 'rwa.id'
                }
            }
        };
    }

    static async create(facilityData) {
        try {
            return await RWAFacility.query().insert(facilityData);
        } catch (error) {
            throw new Error(`Erro ao criar instalação do RWA: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await RWAFacility.query().findById(id);
        } catch (error) {
            throw new Error(`Erro ao buscar instalação do RWA: ${error.message}`);
        }
    }

    static async getByRWAId(rwa_id) {
        try {
            return await RWAFacility.query()
                .where('rwa_id', rwa_id)
                .orderBy(['type', 'name']);
        } catch (error) {
            throw new Error(`Erro ao buscar instalações do RWA: ${error.message}`);
        }
    }

    static async getByType(rwa_id, type) {
        try {
            return await RWAFacility.query()
                .where({ rwa_id, type })
                .orderBy('name');
        } catch (error) {
            throw new Error(`Erro ao buscar instalações por tipo: ${error.message}`);
        }
    }

    static async update(id, facilityData) {
        try {
            return await RWAFacility.query()
                .patchAndFetchById(id, {
                    ...facilityData,
                    updated_at: new Date().toISOString()
                });
        } catch (error) {
            throw new Error(`Erro ao atualizar instalação do RWA: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            return await RWAFacility.query().deleteById(id);
        } catch (error) {
            throw new Error(`Erro ao deletar instalação do RWA: ${error.message}`);
        }
    }

    static async getTypes() {
        try {
            const result = await RWAFacility.query()
                .distinct('type')
                .orderBy('type');
            return result.map(row => row.type);
        } catch (error) {
            throw new Error(`Erro ao buscar tipos de instalações: ${error.message}`);
        }
    }

    static async getFacilitiesByFilter(filters) {
        try {
            let query = RWAFacility.query();

            if (filters.type) {
                query = query.where('type', filters.type);
            }

            if (filters.min_size) {
                query = query.where('size_m2', '>=', filters.min_size);
            }

            if (filters.max_size) {
                query = query.where('size_m2', '<=', filters.max_size);
            }

            if (filters.floor_number) {
                query = query.where('floor_number', filters.floor_number);
            }

            if (filters.status) {
                query = query.where('status', filters.status);
            }

            return await query.orderBy(['type', 'name']);
        } catch (error) {
            throw new Error(`Erro ao buscar instalações com filtros: ${error.message}`);
        }
    }
}

module.exports = RWAFacility; 