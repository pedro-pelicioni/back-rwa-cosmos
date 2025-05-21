const express = require('express');
const router = express.Router();
const rwaRoutes = require('./rwaRoutes');
const rwaNftRoutes = require('./rwaNftRoutes');
const rwaTokenSaleRoutes = require('./rwaTokenSaleRoutes');
const authRoutes = require('./authRoutes');

router.use('/rwa', rwaRoutes);
router.use('/rwa/nfts', rwaNftRoutes);
router.use('/rwa/tokens/sale', rwaTokenSaleRoutes);
router.use('/auth', authRoutes);

module.exports = router; 