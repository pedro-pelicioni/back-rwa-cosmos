const RWAImage = require('../models/RWAImage');
const RWA = require('../models/RWA');

class RWAImageController {
    static async create(req, res) {
        try {
            const { rwa_id, title, description, cid_link, file_path, display_order } = req.body;

            // Verificar se o RWA existe
            const rwa = await RWA.getById(rwa_id);
            if (!rwa) {
                return res.status(404).json({ error: 'RWA não encontrado' });
            }

            // Verificar se o usuário tem permissão para adicionar imagens
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Sem permissão para adicionar imagens a este RWA' });
            }

            const image = await RWAImage.create({
                rwa_id,
                title,
                description,
                cid_link,
                file_path,
                display_order
            });

            res.status(201).json(image);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const { id } = req.params;
            const image = await RWAImage.getById(id);

            if (!image) {
                return res.status(404).json({ error: 'Imagem não encontrada' });
            }

            res.json(image);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getByRWAId(req, res) {
        try {
            const { rwa_id } = req.params;
            const images = await RWAImage.getByRWAId(rwa_id);
            res.json(images);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { title, description, cid_link, file_path, display_order } = req.body;

            // Verificar se a imagem existe
            const image = await RWAImage.getById(id);
            if (!image) {
                return res.status(404).json({ error: 'Imagem não encontrada' });
            }

            // Verificar se o usuário tem permissão para atualizar
            const rwa = await RWA.getById(image.rwa_id);
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Sem permissão para atualizar esta imagem' });
            }

            const updatedImage = await RWAImage.update(id, {
                title,
                description,
                cid_link,
                file_path,
                display_order
            });

            res.json(updatedImage);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            // Verificar se a imagem existe
            const image = await RWAImage.getById(id);
            if (!image) {
                return res.status(404).json({ error: 'Imagem não encontrada' });
            }

            // Verificar se o usuário tem permissão para deletar
            const rwa = await RWA.getById(image.rwa_id);
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Sem permissão para deletar esta imagem' });
            }

            await RWAImage.delete(id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async reorder(req, res) {
        try {
            const { rwa_id } = req.params;
            const { imageOrders } = req.body;

            // Verificar se o RWA existe
            const rwa = await RWA.getById(rwa_id);
            if (!rwa) {
                return res.status(404).json({ error: 'RWA não encontrado' });
            }

            // Verificar se o usuário tem permissão para reordenar
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Sem permissão para reordenar imagens deste RWA' });
            }

            await RWAImage.reorder(rwa_id, imageOrders);
            res.status(200).json({ message: 'Imagens reordenadas com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = RWAImageController; 