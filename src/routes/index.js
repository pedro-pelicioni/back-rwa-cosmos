const express = require('express');
const router = express.Router();
const rwaRoutes = require('./rwaRoutes');
const rwaNftRoutes = require('./rwaNftRoutes');
const rwaTokenSaleRoutes = require('./rwaTokenSaleRoutes');
const authRoutes = require('./authRoutes');
const tokenListingRoutes = require('./tokenListingRoutes');
const kycRoutes = require('./kycRoutes');

router.use('/rwa', rwaRoutes);
router.use('/rwa/nfts', rwaNftRoutes);
router.use('/rwa/tokens/sale', rwaTokenSaleRoutes);
router.use('/auth', authRoutes);
router.use('/marketplace', tokenListingRoutes);
router.use('/users/kyc', kycRoutes);

module.exports = router; 