const RWAFacility = require('../models/RWAFacility');
const RWA = require('../models/RWA');

class RWAFacilityController {
    static async create(req, res) {
        try {
            const { rwa_id, name, description, size_m2, floor_number, type, status } = req.body;

            // Verificar se o RWA existe
            const rwa = await RWA.getById(rwa_id);
            if (!rwa) {
                return res.status(404).json({ error: 'RWA não encontrado' });
            }

            // Verificar se o usuário tem permissão para adicionar instalações
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Sem permissão para adicionar instalações a este RWA' });
            }

            const facility = await RWAFacility.create({
                rwa_id,
                name,
                description,
                size_m2,
                floor_number,
                type,
                status
            });

            res.status(201).json(facility);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const facility = await RWAFacility.getById(id);

            if (!facility) {
                return res.status(404).json({ error: 'Instalação não encontrada' });
            }

            res.json(facility);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByRWAId(req, res) {
        try {
            const { rwa_id } = req.params;
            const facilities = await RWAFacility.getByRWAId(rwa_id);
            res.json(facilities);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByType(req, res) {
        try {
            const { rwa_id, type } = req.params;
            const facilities = await RWAFacility.getByType(rwa_id, type);
            res.json(facilities);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, description, size_m2, floor_number, type, status } = req.body;

            // Verificar se a instalação existe
            const facility = await RWAFacility.getById(id);
            if (!facility) {
                return res.status(404).json({ error: 'Instalação não encontrada' });
            }

            // Verificar se o usuário tem permissão para atualizar
            const rwa = await RWA.getById(facility.rwa_id);
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Sem permissão para atualizar esta instalação' });
            }

            const updatedFacility = await RWAFacility.update(id, {
                name,
                description,
                size_m2,
                floor_number,
                type,
                status
            });

            res.json(updatedFacility);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Verificar se a instalação existe
            const facility = await RWAFacility.getById(id);
            if (!facility) {
                return res.status(404).json({ error: 'Instalação não encontrada' });
            }

            // Verificar se o usuário tem permissão para deletar
            const rwa = await RWA.getById(facility.rwa_id);
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Sem permissão para deletar esta instalação' });
            }

            await RWAFacility.delete(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTypes(req, res) {
        try {
            const types = await RWAFacility.getTypes();
            res.json(types);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getFacilitiesByFilter(req, res) {
        try {
            const filters = req.query;
            const facilities = await RWAFacility.getFacilitiesByFilter(filters);
            res.json(facilities);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = RWAFacilityController; 