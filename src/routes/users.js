const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const walletAuth = require('../middleware/walletAuth');
const jwtAuth = require('../middleware/jwtAuth');

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
 * /api/users/kyc/basic:
 *   post:
 *     summary: Enviar dados básicos para KYC (etapa 1)
 *     description: Envia nome e CPF para iniciar o processo de KYC
 *     tags: [Usuários]
 *     security:
 *       - walletAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - cpf
 *             properties:
 *               nome:
 *                 type: string
 *               cpf:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dados básicos enviados com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/kyc/basic', jwtAuth, usersController.submitKycBasic);

/**
 * @swagger
 * /api/users/kyc/documents:
 *   post:
 *     summary: Enviar documentos para KYC (etapa 2)
 *     description: Envia documentos e selfies para completar o KYC
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
 *         description: Dados inválidos ou etapa 1 não concluída
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/kyc/documents', walletAuth, usersController.submitKycDocuments);

/**
 * @swagger
 * /api/users/kyc:
 *   get:
 *     summary: Obter status KYC
 *     description: Retorna o status e etapa atual da verificação KYC do usuário
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
 *                 id:
 *                   type: integer
 *                 nome:
 *                   type: string
 *                 cpf:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pendente, aprovado, rejeitado]
 *                 etapa:
 *                   type: string
 *                   enum: [dados_basicos, documentos]
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Não autorizado
 *       404:
 *         description: KYC não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/kyc', jwtAuth, usersController.getKyc);

// Desativadas para o MVP atual
// router.get('/', ...);
// router.get('/:id', ...);
// router.post('/', ...);
// router.put('/:id', ...);
// router.patch('/:id/password', ...);
// router.get('/:id/orders', ...);
// router.delete('/:id', ...);

module.exports = router; 