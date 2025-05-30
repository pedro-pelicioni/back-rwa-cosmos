const express = require('express');
const router = express.Router();
const kycController = require('../controllers/kycController');
const { authenticateToken } = require('../middleware/auth');

// Rota para enviar KYC
router.post('/', authenticateToken, kycController.submitKyc);

// Rota para obter KYC do usuário autenticado
router.get('/', authenticateToken, kycController.getKyc);

// Rota para obter KYC por ID do usuário
router.get('/:userId', authenticateToken, kycController.getKycByUserId);

module.exports = router; 