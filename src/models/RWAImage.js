const db = require('../database/connection');

class RWAImage {
    static async create(imageData) {
        const { rwa_id, title, description, cid_link, file_path, display_order } = imageData;
        
        const query = `
            INSERT INTO rwa_images (rwa_id, title, description, cid_link, file_path, display_order)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const values = [rwa_id, title, description, cid_link, file_path, display_order];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao criar imagem do RWA: ${error.message}`);
        }
    }

    static async getById(id) {
        const query = 'SELECT * FROM rwa_images WHERE id = $1';
        
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao buscar imagem do RWA: ${error.message}`);
        }
    }

    static async getByRWAId(rwa_id) {
        const query = 'SELECT * FROM rwa_images WHERE rwa_id = $1 ORDER BY display_order ASC';
        
        try {
            const result = await db.query(query, [rwa_id]);
            return result.rows;
        } catch (error) {
            throw new Error(`Erro ao buscar imagens do RWA: ${error.message}`);
        }
    }

    static async update(id, imageData) {
        const { title, description, cid_link, file_path, display_order } = imageData;
        
        const query = `
            UPDATE rwa_images
            SET title = $1,
                description = $2,
                cid_link = $3,
                file_path = $4,
                display_order = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING *
        `;
        
        const values = [title, description, cid_link, file_path, display_order, id];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao atualizar imagem do RWA: ${error.message}`);
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM rwa_images WHERE id = $1 RETURNING *';
        
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao deletar imagem do RWA: ${error.message}`);
        }
    }

    static async reorder(rwa_id, imageOrders) {
        // imageOrders deve ser um array de objetos {id, display_order}
        const client = await db.getClient();
        
        try {
            await client.query('BEGIN');
            
            for (const { id, display_order } of imageOrders) {
                await client.query(
                    'UPDATE rwa_images SET display_order = $1 WHERE id = $2 AND rwa_id = $3',
                    [display_order, id, rwa_id]
                );
            }
            
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw new Error(`Erro ao reordenar imagens: ${error.message}`);
        } finally {
            client.release();
        }
    }
}

module.exports = RWAImage; 