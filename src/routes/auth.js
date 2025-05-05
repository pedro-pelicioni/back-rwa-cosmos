const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/nonce:
 *   get:
 *     summary: Obter nonce para autenticação
 *     description: Gera um nonce único para ser assinado pela wallet
 *     tags: [Autenticação]
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Endereço da wallet Neutron
 *     responses:
 *       200:
 *         description: Nonce gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nonce:
 *                   type: string
 *                   description: Nonce para ser assinado
 *       400:
 *         description: Endereço inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/nonce', authController.generateNonce);

/**
 * @swagger
 * /api/auth/wallet-login:
 *   post:
 *     summary: Login com wallet
 *     description: Realiza login ou cria um novo usuário usando assinatura da wallet
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - signature
 *               - nonce
 *             properties:
 *               address:
 *                 type: string
 *                 description: Endereço da wallet Neutron
 *                 example: "neutron1xyz..."
 *               signature:
 *                 type: string
 *                 description: Assinatura do nonce gerada pela wallet
 *                 example: "base64_encoded_signature"
 *               nonce:
 *                 type: string
 *                 description: Nonce que foi assinado
 *                 example: "random_nonce_string"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     address:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Dados inválidos ou nonce incorreto
 *       401:
 *         description: Assinatura inválida
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/wallet-login', authController.walletLogin);

// Gerar nonce para autenticação
// router.get('/nonce', authController.generateNonce);

// Desativadas para MVP atual
// router.post('/login', ...);
// router.post('/register', ...);
// router.patch('/:id/password', ...);
// router.post('/logout', ...);
// router.post('/refresh-token', ...);

module.exports = router; 