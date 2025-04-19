const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota de login via wallet
router.post('/wallet-login', authController.walletLogin);

// Desativadas para MVP atual
// router.post('/login', ...);
// router.post('/register', ...);
// router.patch('/:id/password', ...);
// router.post('/logout', ...);
// router.post('/refresh-token', ...);

module.exports = router; 