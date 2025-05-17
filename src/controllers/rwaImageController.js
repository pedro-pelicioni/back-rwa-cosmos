const RWAImage = require('../models/RWAImage');
const RWA = require('../models/RWA');

class RWAImageController {
    static async create(req, res) {
        try {
            const { rwa_id, title, description, cid_link, file_path, image_data, display_order = 0 } = req.body;

            // Verificar se o RWA existe
            const rwa = await RWA.findById(rwa_id);
            if (!rwa) {
                return res.status(404).json({ error: 'RWA não encontrado' });
            }

            // Verificar se o usuário tem permissão para adicionar imagens
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Sem permissão para adicionar imagens a este RWA' });
            }

            // Validar tamanho da imagem em base64 (limite de 10MB)
            if (image_data) {
                // Remover prefixo data:image/jpeg;base64, se existir
                const base64Data = image_data.replace(/^data:image\/\w+;base64,/, '');
                
                // Calcular tamanho em bytes: tamanho_string * 0.75 (aproximadamente)
                const sizeInBytes = base64Data.length * 0.75;
                const MAX_SIZE = 10 * 1024 * 1024; // 10MB em bytes
                
                if (sizeInBytes > MAX_SIZE) {
                    return res.status(400).json({ 
                        error: 'Imagem excede o tamanho máximo permitido de 10MB' 
                    });
                }
            }

            // Buscar o maior display_order existente para este RWA, se não foi fornecido
            let nextDisplayOrder = display_order;
            if (nextDisplayOrder === 0) {
                try {
                    const images = await RWAImage.getByRWAId(rwa_id);
                    if (images && images.length > 0) {
                        // Encontra o maior display_order existente e adiciona 1
                        const maxOrder = Math.max(...images.map(img => img.display_order));
                        nextDisplayOrder = maxOrder + 1;
                    }
                } catch (error) {
                    console.error('Erro ao buscar ordem de exibição:', error);
                    // Se falhar, mantém o padrão 0
                }
            }

            const image = await RWAImage.create({
                rwa_id,
                title,
                description,
                cid_link,
                file_path,
                image_data,
                display_order: nextDisplayOrder
            });

            res.status(201).json(image);
        } catch (error) {
            console.error('Erro ao criar imagem:', error);
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
            let images = await RWAImage.getByRWAId(rwa_id);
            // Validação do campo image_data
            images = images.map(img => {
                if (!img.image_data) {
                    return { ...img, image_data: null };
                }
                // Aceita base64 que começa com o prefixo padrão de imagem
                if (img.image_data.startsWith('data:image/')) {
                    return img;
                }
                // Se não for, retorna null
                return { ...img, image_data: null };
            });
            res.json(images);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { title, description, cid_link, file_path, display_order = 0, image_data } = req.body;

            // Verificar se a imagem existe
            const image = await RWAImage.getById(id);
            if (!image) {
                return res.status(404).json({ error: 'Imagem não encontrada' });
            }

            // Verificar se o usuário tem permissão para atualizar
            const rwa = await RWA.findById(image.rwa_id);
            if (rwa.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Sem permissão para atualizar esta imagem' });
            }

            // Validar tamanho da imagem em base64 (limite de 10MB)
            if (image_data) {
                // Remover prefixo data:image/jpeg;base64, se existir
                const base64Data = image_data.replace(/^data:image\/\w+;base64,/, '');
                
                // Calcular tamanho em bytes: tamanho_string * 0.75 (aproximadamente)
                const sizeInBytes = base64Data.length * 0.75;
                const MAX_SIZE = 10 * 1024 * 1024; // 10MB em bytes
                
                if (sizeInBytes > MAX_SIZE) {
                    return res.status(400).json({ 
                        error: 'Imagem excede o tamanho máximo permitido de 10MB' 
                    });
                }
            }

            const updatedImage = await RWAImage.update(id, {
                title,
                description,
                cid_link,
                file_path,
                image_data,
                display_order
            });

            res.json(updatedImage);
        } catch (error) {
            console.error('Erro ao atualizar imagem:', error);
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
            const rwa = await RWA.findById(image.rwa_id);
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
            const rwa = await RWA.findById(rwa_id);
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