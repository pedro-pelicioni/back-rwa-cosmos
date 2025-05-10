const express = require('express');
const router = express.Router();
const RWAFacilityController = require('../controllers/rwaFacilityController');
const jwtAuth = require('../middleware/jwtAuth');

/**
 * @swagger
 * /api/rwa/facilities:
 *   post:
 *     summary: Cria uma nova instalação para um RWA
 *     tags: [RWA Facilities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RWAFacility'
 *     responses:
 *       201:
 *         description: Instalação criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWAFacility'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', jwtAuth, RWAFacilityController.create);

/**
 * @swagger
 * /api/rwa/facilities/{id}:
 *   get:
 *     summary: Obtém uma instalação pelo ID
 *     tags: [RWA Facilities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da instalação
 *     responses:
 *       200:
 *         description: Instalação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWAFacility'
 *       404:
 *         description: Instalação não encontrada
 */
router.get('/:id', RWAFacilityController.getById);

/**
 * @swagger
 * /api/rwa/facilities/rwa/{rwa_id}:
 *   get:
 *     summary: Obtém todas as instalações de um RWA
 *     tags: [RWA Facilities]
 *     parameters:
 *       - in: path
 *         name: rwa_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do RWA
 *     responses:
 *       200:
 *         description: Lista de instalações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWAFacility'
 */
router.get('/rwa/:rwa_id', RWAFacilityController.getByRWAId);

/**
 * @swagger
 * /api/rwa/facilities/rwa/{rwa_id}/type/{type}:
 *   get:
 *     summary: Obtém instalações de um RWA por tipo
 *     tags: [RWA Facilities]
 *     parameters:
 *       - in: path
 *         name: rwa_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do RWA
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo da instalação
 *     responses:
 *       200:
 *         description: Lista de instalações do tipo especificado
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWAFacility'
 */
router.get('/rwa/:rwa_id/type/:type', RWAFacilityController.getByType);

/**
 * @swagger
 * /api/rwa/facilities/{id}:
 *   put:
 *     summary: Atualiza uma instalação
 *     tags: [RWA Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da instalação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RWAFacility'
 *     responses:
 *       200:
 *         description: Instalação atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RWAFacility'
 *       404:
 *         description: Instalação não encontrada
 */
router.put('/:id', jwtAuth, RWAFacilityController.update);

/**
 * @swagger
 * /api/rwa/facilities/{id}:
 *   delete:
 *     summary: Remove uma instalação
 *     tags: [RWA Facilities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da instalação
 *     responses:
 *       204:
 *         description: Instalação removida com sucesso
 *       404:
 *         description: Instalação não encontrada
 */
router.delete('/:id', jwtAuth, RWAFacilityController.delete);

/**
 * @swagger
 * /api/rwa/facilities/types:
 *   get:
 *     summary: Obtém todos os tipos de instalações disponíveis
 *     tags: [RWA Facilities]
 *     responses:
 *       200:
 *         description: Lista de tipos de instalações
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/types', RWAFacilityController.getTypes);

/**
 * @swagger
 * /api/rwa/facilities/filter:
 *   get:
 *     summary: Filtra instalações por critérios
 *     tags: [RWA Facilities]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Tipo da instalação
 *       - in: query
 *         name: min_size
 *         schema:
 *           type: number
 *         description: Tamanho mínimo em m²
 *       - in: query
 *         name: max_size
 *         schema:
 *           type: number
 *         description: Tamanho máximo em m²
 *       - in: query
 *         name: floor_number
 *         schema:
 *           type: integer
 *         description: Número do andar
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, under_renovation]
 *         description: Status da instalação
 *     responses:
 *       200:
 *         description: Lista de instalações filtradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RWAFacility'
 */
router.get('/filter', RWAFacilityController.getFacilitiesByFilter);

module.exports = router; 