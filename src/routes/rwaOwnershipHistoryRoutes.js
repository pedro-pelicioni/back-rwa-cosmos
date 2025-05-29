const express = require('express');
const router = express.Router();
const RWAOwnershipHistoryController = require('../controllers/rwaOwnershipHistoryController');
const jwtAuth = require('../middleware/jwtAuth');

/**
 * @swagger
 * /api/rwa/ownership-history:
 *   post:
 *     summary: Registra uma nova transferência de propriedade
 *     tags: [RWA Ownership History]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RWAOwnershipHistory'
 *     responses:
 *       201:
 *         description: Transferência registrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWAOwnershipHistory'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', jwtAuth, RWAOwnershipHistoryController.create);

/**
 * @swagger
 * /api/rwa/ownership-history/{id}:
 *   get:
 *     summary: Obtém um registro de transferência pelo ID
 *     tags: [RWA Ownership History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de transferência
 *     responses:
 *       200:
 *         description: Registro de transferência encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWAOwnershipHistory'
 *       404:
 *         description: Registro de transferência não encontrado
 */
router.get('/:id', RWAOwnershipHistoryController.getById);

/**
 * @swagger
 * /api/rwa/ownership-history/rwa/{rwa_id}:
 *   get:
 *     summary: Obtém o histórico de transferências de um RWA
 *     tags: [RWA Ownership History]
 *     parameters:
 *       - in: path
 *         name: rwa_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do RWA
 *     responses:
 *       200:
 *         description: Lista de transferências do RWA
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWAOwnershipHistory'
 */
router.get('/rwa/:rwa_id', RWAOwnershipHistoryController.getByRWAId);

/**
 * @swagger
 * /api/rwa/ownership-history/token/{token_id}:
 *   get:
 *     summary: Obtém o histórico de transferências de um token NFT
 *     tags: [RWA Ownership History]
 *     parameters:
 *       - in: path
 *         name: token_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do token NFT
 *     responses:
 *       200:
 *         description: Lista de transferências do token
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWAOwnershipHistory'
 */
router.get('/token/:token_id', RWAOwnershipHistoryController.getByTokenId);

/**
 * @swagger
 * /api/rwa/ownership-history/user/{user_id}:
 *   get:
 *     summary: Obtém o histórico de transferências de um usuário
 *     tags: [RWA Ownership History]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [sent, received]
 *         description: Tipo de transferência (enviadas ou recebidas)
 *     responses:
 *       200:
 *         description: Lista de transferências do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWAOwnershipHistory'
 */
router.get('/user/:user_id', jwtAuth, RWAOwnershipHistoryController.getByUserId);

/**
 * @swagger
 * /api/rwa/ownership-history/{id}:
 *   put:
 *     summary: Atualiza um registro de transferência
 *     tags: [RWA Ownership History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de transferência
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RWAOwnershipHistory'
 *     responses:
 *       200:
 *         description: Registro de transferência atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWAOwnershipHistory'
 *       404:
 *         description: Registro de transferência não encontrado
 */
router.put('/:id', jwtAuth, RWAOwnershipHistoryController.update);

/**
 * @swagger
 * /api/rwa/ownership-history/{id}:
 *   delete:
 *     summary: Remove um registro de transferência
 *     tags: [RWA Ownership History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do registro de transferência
 *     responses:
 *       204:
 *         description: Registro de transferência removido com sucesso
 *       404:
 *         description: Registro de transferência não encontrado
 */
router.delete('/:id', jwtAuth, RWAOwnershipHistoryController.delete);

module.exports = router; 