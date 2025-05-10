const db = require('../database/connection');

class RWA {
    static async create(rwaData) {
        const {
            userId,
            name,
            gpsCoordinates,
            city,
            country,
            description,
            currentValue,
            totalTokens,
            yearBuilt,
            sizeM2,
            geometry
        } = rwaData;

        const query = `
            INSERT INTO rwa (
                user_id, name, gps_coordinates, city, country, description,
                current_value, total_tokens, year_built, size_m2, geometry
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ST_GeomFromGeoJSON($11))
            RETURNING *
        `;

        const values = [
            userId, name, gpsCoordinates, city, country, description,
            currentValue, totalTokens, yearBuilt, sizeM2,
            geometry ? JSON.stringify(geometry) : null
        ];

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao criar RWA: ${error.message}`);
        }
    }

    static async findById(id) {
        const query = `
            SELECT r.*, 
                   u.email as owner_email,
                   ST_AsGeoJSON(r.geometry)::json as geometry
            FROM rwa r
            JOIN users u ON r.user_id = u.id
            WHERE r.id = $1
        `;

        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao buscar RWA: ${error.message}`);
        }
    }

    static async findByUserId(userId) {
        const query = `
            SELECT r.*, 
                   ST_AsGeoJSON(r.geometry)::json as geometry
            FROM rwa r
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `;

        try {
            const result = await db.query(query, [userId]);
            return result.rows;
        } catch (error) {
            throw new Error(`Erro ao buscar RWAs do usuário: ${error.message}`);
        }
    }

    static async update(id, rwaData) {
        const {
            name,
            gpsCoordinates,
            city,
            country,
            description,
            currentValue,
            totalTokens,
            yearBuilt,
            sizeM2,
            status,
            geometry
        } = rwaData;

        const query = `
            UPDATE rwa
            SET 
                name = COALESCE($1, name),
                gps_coordinates = COALESCE($2, gps_coordinates),
                city = COALESCE($3, city),
                country = COALESCE($4, country),
                description = COALESCE($5, description),
                current_value = COALESCE($6, current_value),
                total_tokens = COALESCE($7, total_tokens),
                year_built = COALESCE($8, year_built),
                size_m2 = COALESCE($9, size_m2),
                status = COALESCE($10, status),
                geometry = COALESCE(ST_GeomFromGeoJSON($11), geometry),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $12
            RETURNING *, ST_AsGeoJSON(geometry)::json as geometry
        `;

        const values = [
            name, gpsCoordinates, city, country, description,
            currentValue, totalTokens, yearBuilt, sizeM2,
            status, geometry ? JSON.stringify(geometry) : null, id
        ];

        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao atualizar RWA: ${error.message}`);
        }
    }

    static async delete(id) {
        const query = 'DELETE FROM rwa WHERE id = $1 RETURNING *';

        try {
            const result = await db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao deletar RWA: ${error.message}`);
        }
    }

    static async listAll(filters = {}, page = 1, limit = 10) {
        let query = `
            SELECT r.*, 
                   ST_AsGeoJSON(r.geometry)::json as geometry
            FROM rwa r
        `;
        const values = [];
        let whereClause = '';
        let paramCount = 1;

        // Aplicar filtros
        if (filters.city) {
            whereClause += ` r.city ILIKE $${paramCount} AND`;
            values.push(`%${filters.city}%`);
            paramCount++;
        }

        if (filters.country) {
            whereClause += ` r.country ILIKE $${paramCount} AND`;
            values.push(`%${filters.country}%`);
            paramCount++;
        }

        if (filters.status) {
            whereClause += ` r.status = $${paramCount} AND`;
            values.push(filters.status);
            paramCount++;
        }

        if (whereClause) {
            query += ' WHERE ' + whereClause.slice(0, -4);
        }

        // Adicionar paginação
        const offset = (page - 1) * limit;
        query += ` ORDER BY r.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        try {
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            throw new Error(`Erro ao listar RWAs: ${error.message}`);
        }
    }

    // Método para buscar RWAs por proximidade
    static async findByProximity(latitude, longitude, radiusInMeters = 1000) {
        const query = `
            SELECT r.*, 
                   ST_AsGeoJSON(r.geometry)::json as geometry,
                   ST_Distance(
                       r.geometry::geography,
                       ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
                   ) as distance
            FROM rwa r
            WHERE ST_DWithin(
                r.geometry::geography,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                $3
            )
            ORDER BY distance
        `;

        try {
            const result = await db.query(query, [longitude, latitude, radiusInMeters]);
            return result.rows;
        } catch (error) {
            throw new Error(`Erro ao buscar RWAs por proximidade: ${error.message}`);
        }
    }
}

module.exports = RWA; 