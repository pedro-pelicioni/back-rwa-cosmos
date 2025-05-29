const { Model } = require('objection');
const db = require('../database/knex');

// Conectar o Model ao Knex
Model.knex(db);

class RWAImage extends Model {
    static get tableName() {
        return 'rwa_images';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['rwa_id', 'title'],
            properties: {
                id: { type: 'integer' },
                rwa_id: { type: 'integer' },
                title: { type: 'string' },
                description: { type: ['string', 'null'] },
                cid_link: { type: ['string', 'null'] },
                file_path: { type: ['string', 'null'] },
                image_data: { type: ['string', 'null'] },
                display_order: { type: 'integer' },
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
                    from: 'rwa_images.rwa_id',
                    to: 'rwa.id'
                }
            }
        };
    }

    static async create(imageData) {
        try {
            return await RWAImage.query().insert(imageData);
        } catch (error) {
            throw new Error(`Erro ao criar imagem do RWA: ${error.message}`);
        }
    }

    static async getById(id) {
        try {
            return await RWAImage.query().findById(id);
        } catch (error) {
            throw new Error(`Erro ao buscar imagem do RWA: ${error.message}`);
        }
    }

    static async getByRWAId(rwa_id) {
        try {
            return await RWAImage.query()
                .where('rwa_id', rwa_id)
                .orderBy('display_order', 'asc');
        } catch (error) {
            throw new Error(`Erro ao buscar imagens do RWA: ${error.message}`);
        }
    }

    static async update(id, imageData) {
        try {
            return await RWAImage.query()
                .patchAndFetchById(id, {
                    ...imageData,
                    updated_at: new Date().toISOString()
                });
        } catch (error) {
            throw new Error(`Erro ao atualizar imagem do RWA: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            return await RWAImage.query().deleteById(id);
        } catch (error) {
            throw new Error(`Erro ao deletar imagem do RWA: ${error.message}`);
        }
    }

    static async reorder(rwa_id, imageOrders) {
        const trx = await RWAImage.startTransaction();
        
        try {
            for (const { id, display_order } of imageOrders) {
                await RWAImage.query(trx)
                    .patch({ display_order })
                    .where({ id, rwa_id });
            }
            
            await trx.commit();
            return true;
        } catch (error) {
            await trx.rollback();
            throw new Error(`Erro ao reordenar imagens: ${error.message}`);
        }
    }
}

module.exports = RWAImage; 