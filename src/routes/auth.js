const express = require('express');
const router = express.Router();
const { walletLogin } = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/wallet-login:
 *   post:
 *     summary: Login com wallet
 *     description: Realiza login ou cria um novo usuário usando endereço da wallet
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *                 description: Endereço da wallet Neutron
 *                 example: "neutron1xyz..."
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
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
 *         description: Endereço da wallet inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/wallet-login', walletLogin);

// Desativadas para MVP atual
// router.post('/login', ...);
// router.post('/register', ...);
// router.patch('/:id/password', ...);
// router.post('/logout', ...);
// router.post('/refresh-token', ...);

module.exports = router; 