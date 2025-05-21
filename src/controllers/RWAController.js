const RWA = require('../models/RWA');

class RWAController {
    static async create(req, res) {
        try {
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
                geometry
            } = req.body;

            // Validações básicas
            if (!name || !gpsCoordinates || !city || !country) {
                return res.status(400).json({ error: 'Nome, coordenadas GPS, cidade e país são obrigatórios' });
            }

            if (currentValue <= 0 || totalTokens <= 0) {
                return res.status(400).json({ error: 'Valor do RWA e total de tokens devem ser maiores que zero' });
            }

            const rwaData = {
                userId: req.user.id,
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
            };

            const rwa = await RWA.create(rwaData);
            res.status(201).json(rwa);
        } catch (error) {
            console.error('Erro ao criar RWA:', error);
            res.status(500).json({ error: 'Erro ao criar RWA' });
        }
    }

    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id)) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            const rwa = await RWA.findById(id);
            if (!rwa) {
                return res.status(404).json({ error: 'RWA não encontrado' });
            }
            res.json(rwa);
        } catch (error) {
            console.error('Erro ao buscar RWA:', error);
            res.status(500).json({ error: 'Erro ao buscar RWA' });
        }
    }

    static async getUserRWAs(req, res) {
        try {
            const rwas = await RWA.findByUserId(req.user.id);
            res.json(rwas);
        } catch (error) {
            console.error('Erro ao buscar RWAs do usuário:', error);
            res.status(500).json({ error: 'Erro ao buscar RWAs do usuário' });
        }
    }

    static async update(req, res) {
        try {
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
            } = req.body;

            const rwa = await RWA.findById(req.params.id);
            if (!rwa) {
                return res.status(404).json({ error: 'RWA não encontrado' });
            }

            // Verificar se o usuário é o dono do RWA
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Você não tem permissão para atualizar este RWA' });
            }

            const rwaData = {
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
            };

            const updatedRWA = await RWA.update(req.params.id, rwaData);
            res.json(updatedRWA);
        } catch (error) {
            console.error('Erro ao atualizar RWA:', error);
            res.status(500).json({ error: 'Erro ao atualizar RWA' });
        }
    }

    static async delete(req, res) {
        try {
            const rwa = await RWA.findById(req.params.id);
            if (!rwa) {
                return res.status(404).json({ error: 'RWA não encontrado' });
            }

            // Verificar se o usuário é o dono do RWA
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Você não tem permissão para deletar este RWA' });
            }

            await RWA.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar RWA:', error);
            res.status(500).json({ error: 'Erro ao deletar RWA' });
        }
    }

    static async listAll(req, res) {
        try {
            const { page = 1, limit = 10, city, country, status } = req.query;
            const filters = { city, country, status };
            const rwas = await RWA.listAll(filters, parseInt(page), parseInt(limit));
            res.json(rwas);
        } catch (error) {
            console.error('Erro ao listar RWAs:', error);
            res.status(500).json({ error: 'Erro ao listar RWAs' });
        }
    }

    static async findByProximity(req, res) {
        try {
            const { latitude, longitude, radius = 1000 } = req.query;
            
            if (!latitude || !longitude) {
                return res.status(400).json({ error: 'Latitude e longitude são obrigatórios' });
            }

            const rwas = await RWA.findByProximity(
                parseFloat(latitude),
                parseFloat(longitude),
                parseInt(radius)
            );
            
            res.json(rwas);
        } catch (error) {
            console.error('Erro ao buscar RWAs por proximidade:', error);
            res.status(500).json({ error: 'Erro ao buscar RWAs por proximidade' });
        }
    }
}

module.exports = RWAController; 