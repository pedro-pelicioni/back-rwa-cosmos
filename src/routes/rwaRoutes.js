const express = require('express');
const router = express.Router();
const RWAController = require('../controllers/RWAController');
const jwtAuth = require('../middleware/jwtAuth');

/**
 * @swagger
 * tags:
 *   name: RWA
 *   description: Gerenciamento de Real World Assets (imóveis tokenizados)
 *
 * components:
 *   schemas:
 *     RWA:
 *       type: object
 *       required:
 *         - name
 *         - location
 *         - city
 *         - country
 *         - propertyValue
 *         - totalTokens
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         name:
 *           type: string
 *         location:
 *           type: string
 *         city:
 *           type: string
 *         country:
 *           type: string
 *         description:
 *           type: string
 *         propertyValue:
 *           type: number
 *         totalTokens:
 *           type: integer
 *         yearBuilt:
 *           type: integer
 *         sizeM2:
 *           type: number
 *         status:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/rwa:
 *   post:
 *     summary: Criar um novo RWA
 *     tags: [RWA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - gpsCoordinates
 *               - city
 *               - country
 *               - currentValue
 *               - totalTokens
 *             properties:
 *               name:
 *                 type: string
 *               gpsCoordinates:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               description:
 *                 type: string
 *               currentValue:
 *                 type: number
 *               totalTokens:
 *                 type: integer
 *               yearBuilt:
 *                 type: integer
 *               sizeM2:
 *                 type: number
 *               geometry:
 *                 type: object
 *     responses:
 *       201:
 *         description: RWA criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWA'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', jwtAuth, RWAController.create);

/**
 * @swagger
 * /api/rwa:
 *   get:
 *     summary: Listar todos os RWAs
 *     tags: [RWA]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limite de itens por página
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por cidade
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filtrar por país
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, sold]
 *         description: Filtrar por status
 *     responses:
 *       200:
 *         description: Lista de RWAs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWA'
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', RWAController.listAll);

/**
 * @swagger
 * /api/rwa/my-rwas:
 *   get:
 *     summary: Buscar RWAs do usuário logado
 *     tags: [RWA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de RWAs do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWA'
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/my-rwas', jwtAuth, RWAController.getUserRWAs);

/**
 * @swagger
 * /api/rwa/{id}:
 *   get:
 *     summary: Buscar RWA por ID
 *     tags: [RWA]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do RWA
 *     responses:
 *       200:
 *         description: RWA encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWA'
 *       404:
 *         description: RWA não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', RWAController.getById);

/**
 * @swagger
 * /api/rwa/nearby:
 *   get:
 *     summary: Buscar RWAs por proximidade
 *     tags: [RWA]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude do ponto de referência
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude do ponto de referência
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           default: 1000
 *         description: Raio de busca em metros
 *     responses:
 *       200:
 *         description: Lista de RWAs próximos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWA'
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/nearby', RWAController.findByProximity);

/**
 * @swagger
 * /api/rwa/{id}:
 *   put:
 *     summary: Atualizar RWA
 *     tags: [RWA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               gpsCoordinates:
 *                 type: string
 *               city:
 *                 type: string
 *               country:
 *                 type: string
 *               description:
 *                 type: string
 *               currentValue:
 *                 type: number
 *               totalTokens:
 *                 type: integer
 *               yearBuilt:
 *                 type: integer
 *               sizeM2:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive, sold]
 *               geometry:
 *                 type: object
 *     responses:
 *       200:
 *         description: RWA atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWA'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: RWA não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', jwtAuth, RWAController.update);

/**
 * @swagger
 * /api/rwa/{id}:
 *   delete:
 *     summary: Deletar RWA
 *     tags: [RWA]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do RWA
 *     responses:
 *       204:
 *         description: RWA deletado com sucesso
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Sem permissão
 *       404:
 *         description: RWA não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', jwtAuth, RWAController.delete);

module.exports = router; 