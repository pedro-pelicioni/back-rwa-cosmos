const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const walletAuth = require('../middleware/walletAuth');

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Obter dados do usuário
 *     description: Retorna os dados do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - walletAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 address:
 *                   type: string
 *                 role:
 *                   type: string
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/me', walletAuth, usersController.getMe);

/**
 * @swagger
 * /api/users/kyc:
 *   post:
 *     summary: Enviar documentos KYC
 *     description: Envia documentos para verificação KYC
 *     tags: [Usuários]
 *     security:
 *       - walletAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               cpf:
 *                 type: string
 *               documento_frente:
 *                 type: string
 *                 format: binary
 *               documento_verso:
 *                 type: string
 *                 format: binary
 *               selfie_1:
 *                 type: string
 *                 format: binary
 *               selfie_2:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Documentos enviados com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/kyc', walletAuth, usersController.submitKyc);

/**
 * @swagger
 * /api/users/kyc:
 *   get:
 *     summary: Obter status KYC
 *     description: Retorna o status da verificação KYC do usuário
 *     tags: [Usuários]
 *     security:
 *       - walletAuth: []
 *     responses:
 *       200:
 *         description: Status KYC retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pendente, aprovado, rejeitado]
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/kyc', walletAuth, usersController.getKyc);

// Desativadas para o MVP atual
// router.get('/', ...);
// router.get('/:id', ...);
// router.post('/', ...);
// router.put('/:id', ...);
// router.patch('/:id/password', ...);
// router.get('/:id/orders', ...);
// router.delete('/:id', ...);

module.exports = router; 