const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const walletAuth = require('../middleware/walletAuth');
const adminOnly = require('../middleware/adminOnly');

/**
 * @swagger
 * /api/admin/kyc-list:
 *   get:
 *     summary: Listar KYCs
 *     description: Retorna lista de verificações KYC (apenas admin)
 *     tags: [Administração]
 *     security:
 *       - walletAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendente, aprovado, rejeitado]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de KYCs retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   user_address:
 *                     type: string
 *                   status:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado (não é admin)
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/kyc-list', walletAuth, adminOnly, adminController.listKyc);

/**
 * @swagger
 * /api/admin/kyc-status/{id}:
 *   patch:
 *     summary: Atualizar status KYC
 *     description: Atualiza o status de uma verificação KYC (apenas admin)
 *     tags: [Administração]
 *     security:
 *       - walletAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da verificação KYC
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [aprovado, rejeitado]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso negado (não é admin)
 *       404:
 *         description: KYC não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.patch('/kyc-status/:id', walletAuth, adminOnly, adminController.updateKycStatus);

module.exports = router; 