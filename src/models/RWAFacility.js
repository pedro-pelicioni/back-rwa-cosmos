const db = require('../database/connection');

class RWAFacility {
    static async create(facilityData) {
        const { rwa_id, name, description, size_m2, floor_number, type, status } = facilityData;
        
        const query = `
            INSERT INTO rwa_facilities (rwa_id, name, description, size_m2, floor_number, type, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        
        const values = [rwa_id, name, description, size_m2, floor_number, type, status];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao criar instalação do RWA: ${error.message}`);
        }
    }

    static async getById(id) {
        const query = 'SELECT * FROM rwa_facilities WHERE id = $1';
        
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao buscar instalação do RWA: ${error.message}`);
        }
    }

    static async getByRWAId(rwa_id) {
        const query = 'SELECT * FROM rwa_facilities WHERE rwa_id = $1 ORDER BY type, name';
        
        try {
            const result = await db.query(query, [rwa_id]);
            return result.rows;
        } catch (error) {
            throw new Error(`Erro ao buscar instalações do RWA: ${error.message}`);
        }
    }

    static async getByType(rwa_id, type) {
        const query = 'SELECT * FROM rwa_facilities WHERE rwa_id = $1 AND type = $2 ORDER BY name';
        
        try {
            const result = await db.query(query, [rwa_id, type]);
            return result.rows;
        } catch (error) {
            throw new Error(`Erro ao buscar instalações por tipo: ${error.message}`);
        }
    }

    static async update(id, facilityData) {
        const { name, description, size_m2, floor_number, type, status } = facilityData;
        
        const query = `
            UPDATE rwa_facilities
            SET name = $1,
                description = $2,
                size_m2 = $3,
                floor_number = $4,
                type = $5,
                status = $6,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *
        `;
        
        const values = [name, description, size_m2, floor_number, type, status, id];
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao atualizar instalação do RWA: ${error.message}`);
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM rwa_facilities WHERE id = $1 RETURNING *';
        
        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao deletar instalação do RWA: ${error.message}`);
        }
    }

    static async getTypes() {
        const query = 'SELECT DISTINCT type FROM rwa_facilities ORDER BY type';
        
        try {
            const result = await db.query(query);
            return result.rows.map(row => row.type);
        } catch (error) {
            throw new Error(`Erro ao buscar tipos de instalações: ${error.message}`);
        }
    }

    static async getFacilitiesByFilter(filters) {
        const { type, min_size, max_size, floor_number, status } = filters;
        let query = 'SELECT * FROM rwa_facilities WHERE 1=1';
        const values = [];
        let paramCount = 1;

        if (type) {
            query += ` AND type = $${paramCount}`;
            values.push(type);
            paramCount++;
        }

        if (min_size) {
            query += ` AND size_m2 >= $${paramCount}`;
            values.push(min_size);
            paramCount++;
        }

        if (max_size) {
            query += ` AND size_m2 <= $${paramCount}`;
            values.push(max_size);
            paramCount++;
        }

        if (floor_number) {
            query += ` AND floor_number = $${paramCount}`;
            values.push(floor_number);
            paramCount++;
        }

        if (status) {
            query += ` AND status = $${paramCount}`;
            values.push(status);
            paramCount++;
        }

        query += ' ORDER BY type, name';

        try {
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Erro ao buscar instalações com filtros: ${error.message}`);
        }
    }
}

module.exports = RWAFacility; 