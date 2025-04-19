const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const walletAuth = require('../middleware/walletAuth');
const adminOnly = require('../middleware/adminOnly');

// Adicionar ambos middlewares: autenticação por wallet e verificação de admin
const adminMiddleware = [walletAuth, adminOnly];

// Rotas de administração de KYC
router.get('/kyc-list', adminMiddleware, adminController.listKyc);
router.patch('/kyc-status/:id', adminMiddleware, adminController.updateKycStatus);

module.exports = router; 