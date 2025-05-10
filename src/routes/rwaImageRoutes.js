const express = require('express');
const router = express.Router();
const RWAImageController = require('../controllers/rwaImageController');
const jwtAuth = require('../middleware/jwtAuth');

/**
 * @swagger
 * /api/rwa/images:
 *   post:
 *     summary: Cria uma nova imagem para um RWA
 *     tags: [RWA Images]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RWAImage'
 *     responses:
 *       201:
 *         description: Imagem criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWAImage'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', jwtAuth, RWAImageController.create);

/**
 * @swagger
 * /api/rwa/images/{id}:
 *   get:
 *     summary: Obtém uma imagem pelo ID
 *     tags: [RWA Images]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da imagem
 *     responses:
 *       200:
 *         description: Imagem encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWAImage'
 *       404:
 *         description: Imagem não encontrada
 */
router.get('/:id', RWAImageController.getById);

/**
 * @swagger
 * /api/rwa/images/rwa/{rwa_id}:
 *   get:
 *     summary: Obtém todas as imagens de um RWA
 *     tags: [RWA Images]
 *     parameters:
 *       - in: path
 *         name: rwa_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do RWA
 *     responses:
 *       200:
 *         description: Lista de imagens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWAImage'
 */
router.get('/rwa/:rwa_id', RWAImageController.getByRWAId);

/**
 * @swagger
 * /api/rwa/images/{id}:
 *   put:
 *     summary: Atualiza uma imagem
 *     tags: [RWA Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da imagem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RWAImage'
 *     responses:
 *       200:
 *         description: Imagem atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWAImage'
 *       404:
 *         description: Imagem não encontrada
 */
router.put('/:id', jwtAuth, RWAImageController.update);

/**
 * @swagger
 * /api/rwa/images/{id}:
 *   delete:
 *     summary: Remove uma imagem
 *     tags: [RWA Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da imagem
 *     responses:
 *       204:
 *         description: Imagem removida com sucesso
 *       404:
 *         description: Imagem não encontrada
 */
router.delete('/:id', jwtAuth, RWAImageController.delete);

/**
 * @swagger
 * /api/rwa/images/rwa/{rwa_id}/reorder:
 *   post:
 *     summary: Reordena as imagens de um RWA
 *     tags: [RWA Images]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rwa_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do RWA
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     display_order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Imagens reordenadas com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/rwa/:rwa_id/reorder', jwtAuth, RWAImageController.reorder);

module.exports = router; 