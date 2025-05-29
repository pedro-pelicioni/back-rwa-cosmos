const express = require('express');
const router = express.Router();
const tokenListingController = require('../controllers/TokenListingController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas
router.get('/listings', tokenListingController.listActiveListings);
router.get('/listings/search', tokenListingController.searchListings);
router.get('/listings/:listing_id', tokenListingController.getListingDetails);
router.get('/listings/:listing_id/price-history', tokenListingController.getPriceHistory);
router.get('/tokens/:nft_token_id/availability', tokenListingController.checkTokenAvailability);

// Rotas que requerem autenticação
router.use(authMiddleware);
router.get('/my-listings', tokenListingController.getUserListings);
router.post('/listings', tokenListingController.createListing);
router.patch('/listings/:listing_id/price', tokenListingController.updatePrice);
router.patch('/listings/:listing_id/cancel', tokenListingController.cancelListing);
router.patch('/listings/:listing_id/status', tokenListingController.updateListingStatus);

module.exports = router; 