const express = require('express');
const router = express.Router();
const RWATokenSaleController = require('../controllers/rwaTokenSaleController');
const jwtAuth = require('../middleware/jwtAuth');

// Rota pública
router.get('/available', RWATokenSaleController.getAvailableSales);

// Rotas protegidas por autenticação
router.use(jwtAuth);

// Iniciar uma venda
router.post('/initiate', RWATokenSaleController.initiate);

// Confirmar uma venda
router.post('/confirm', RWATokenSaleController.confirm);

// Cancelar uma venda
router.post('/cancel/:sale_id', RWATokenSaleController.cancel);

// Obter vendas de um token específico
router.get('/token/:token_id', RWATokenSaleController.getByTokenId);

// Obter vendas de um vendedor específico
router.get('/seller/:seller_id', RWATokenSaleController.getBySellerId);

// Obter compras de um comprador específico
router.get('/buyer/:buyer_id', RWATokenSaleController.getByBuyerId);

// Obter uma venda específica (deve vir por último pois é a mais genérica)
router.get('/:sale_id', RWATokenSaleController.getSaleDetails);

module.exports = router; 