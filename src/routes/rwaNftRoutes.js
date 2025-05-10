const express = require('express');
const router = express.Router();
const RWANFTController = require('../controllers/rwaNftController');
const jwtAuth = require('../middleware/jwtAuth');

/**
 * @swagger
 * /api/rwa/nfts:
 *   post:
 *     summary: Cria um novo token NFT para um RWA
 *     tags: [RWA NFTs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RWANFTToken'
 *     responses:
 *       201:
 *         description: Token NFT criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWANFTToken'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', jwtAuth, RWANFTController.create);

/**
 * @swagger
 * /api/rwa/nfts/{id}:
 *   get:
 *     summary: Obtém um token NFT pelo ID
 *     tags: [RWA NFTs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do token NFT
 *     responses:
 *       200:
 *         description: Token NFT encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWANFTToken'
 *       404:
 *         description: Token NFT não encontrado
 */
router.get('/:id', RWANFTController.getById);

/**
 * @swagger
 * /api/rwa/nfts/rwa/{rwa_id}:
 *   get:
 *     summary: Obtém todos os tokens NFT de um RWA
 *     tags: [RWA NFTs]
 *     parameters:
 *       - in: path
 *         name: rwa_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do RWA
 *     responses:
 *       200:
 *         description: Lista de tokens NFT
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWANFTToken'
 */
router.get('/rwa/:rwa_id', RWANFTController.getByRWAId);

/**
 * @swagger
 * /api/rwa/nfts/owner/{user_id}:
 *   get:
 *     summary: Obtém todos os tokens NFT de um usuário
 *     tags: [RWA NFTs]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *     responses:
 *       200:
 *         description: Lista de tokens NFT do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWANFTToken'
 */
router.get('/owner/:user_id', RWANFTController.getByOwnerId);

/**
 * @swagger
 * /api/rwa/nfts/{id}:
 *   put:
 *     summary: Atualiza um token NFT
 *     tags: [RWA NFTs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do token NFT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RWANFTToken'
 *     responses:
 *       200:
 *         description: Token NFT atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWANFTToken'
 *       404:
 *         description: Token NFT não encontrado
 */
router.put('/:id', jwtAuth, RWANFTController.update);

/**
 * @swagger
 * /api/rwa/nfts/{id}:
 *   delete:
 *     summary: Remove um token NFT
 *     tags: [RWA NFTs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do token NFT
 *     responses:
 *       204:
 *         description: Token NFT removido com sucesso
 *       404:
 *         description: Token NFT não encontrado
 */
router.delete('/:id', jwtAuth, RWANFTController.delete);

module.exports = router; 