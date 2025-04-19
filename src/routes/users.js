const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const kycController = require('../controllers/kycController');
const walletAuth = require('../middleware/walletAuth');

// Obter dados do usuário autenticado
router.get('/me', walletAuth, usersController.getMe);

// Rotas de KYC
router.post('/kyc', walletAuth, kycController.submitKyc);
router.get('/kyc', walletAuth, kycController.getKyc);

// Desativadas para o MVP atual
// router.get('/', ...);
// router.get('/:id', ...);
// router.post('/', ...);
// router.put('/:id', ...);
// router.patch('/:id/password', ...);
// router.get('/:id/orders', ...);
// router.delete('/:id', ...);

module.exports = router; 