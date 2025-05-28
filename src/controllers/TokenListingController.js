const TokenListing = require('../models/TokenListing');
const TokenPriceHistory = require('../models/TokenPriceHistory');
const NftToken = require('../models/NftToken');

class TokenListingController {
    // Listar todos os tokens disponíveis para venda
    async listActiveListings(req, res) {
        try {
            const listings = await TokenListing.query()
                .where('listing_status', 'active')
                .withGraphFetched('[nftToken, seller, priceHistory]')
                .orderBy('created_at', 'desc');

            // Retorna lista vazia se não encontrar resultados
            return res.json(listings || []);
        } catch (error) {
            console.error('Error listing active tokens:', error);
            return res.status(500).json({ error: 'Erro ao listar tokens ativos' });
        }
    }

    // Criar um novo listing
    async createListing(req, res) {
        const { nft_token_id, current_price, original_purchase_price, original_purchase_date, chain_transaction_metadata, available_until } = req.body;
        const seller_id = req.user.id;

        try {
            // Verificar se o token pertence ao usuário
            const token = await NftToken.query()
                .where('id', nft_token_id)
                .where('owner_user_id', seller_id)
                .first();

            if (!token) {
                return res.status(403).json({ error: 'Token não pertence ao usuário' });
            }

            // Verificar se já existe um listing ativo para este token
            const existingListing = await TokenListing.query()
                .where('nft_token_id', nft_token_id)
                .where('listing_status', 'active')
                .first();

            if (existingListing) {
                return res.status(400).json({ error: 'Token já está listado para venda' });
            }

            const listing = await TokenListing.query().insert({
                nft_token_id,
                seller_id,
                current_price,
                original_purchase_price,
                original_purchase_date,
                chain_transaction_metadata,
                available_until,
                listing_status: 'active'
            });

            // Registrar o preço inicial no histórico
            await TokenPriceHistory.query().insert({
                token_listing_id: listing.id,
                price: current_price,
                changed_by: seller_id,
                change_reason: 'Preço inicial de listagem'
            });

            return res.status(201).json(listing);
        } catch (error) {
            console.error('Error creating listing:', error);
            return res.status(500).json({ error: 'Erro ao criar listing' });
        }
    }

    // Atualizar o preço de um listing
    async updatePrice(req, res) {
        const { listing_id } = req.params;
        const { new_price, change_reason } = req.body;
        const user_id = req.user.id;

        try {
            const listing = await TokenListing.query()
                .where('id', listing_id)
                .where('listing_status', 'active')
                .first();

            if (!listing) {
                return res.status(404).json({ error: 'Listing não encontrado ou não está ativo' });
            }

            if (listing.seller_id !== user_id) {
                return res.status(403).json({ error: 'Apenas o vendedor pode atualizar o preço' });
            }

            // Atualizar o preço atual
            await listing.$query().patch({
                current_price: new_price
            });

            // Registrar no histórico
            await TokenPriceHistory.query().insert({
                token_listing_id: listing_id,
                price: new_price,
                changed_by: user_id,
                change_reason
            });

            return res.json({ message: 'Preço atualizado com sucesso' });
        } catch (error) {
            console.error('Error updating price:', error);
            return res.status(500).json({ error: 'Erro ao atualizar preço' });
        }
    }

    // Cancelar um listing
    async cancelListing(req, res) {
        const { listing_id } = req.params;
        const user_id = req.user.id;

        try {
            const listing = await TokenListing.query()
                .where('id', listing_id)
                .where('listing_status', 'active')
                .first();

            if (!listing) {
                return res.status(404).json({ error: 'Listing não encontrado ou não está ativo' });
            }

            if (listing.seller_id !== user_id) {
                return res.status(403).json({ error: 'Apenas o vendedor pode cancelar o listing' });
            }

            await listing.$query().patch({
                listing_status: 'cancelled'
            });

            return res.json({ message: 'Listing cancelado com sucesso' });
        } catch (error) {
            console.error('Error cancelling listing:', error);
            return res.status(500).json({ error: 'Erro ao cancelar listing' });
        }
    }

    // Obter detalhes de um listing específico
    async getListingDetails(req, res) {
        const { listing_id } = req.params;

        try {
            const listing = await TokenListing.query()
                .where('id', listing_id)
                .withGraphFetched('[nftToken, seller, priceHistory]')
                .first();

            if (!listing) {
                return res.status(404).json({ error: 'Listing não encontrado' });
            }

            return res.json(listing);
        } catch (error) {
            console.error('Error getting listing details:', error);
            return res.status(500).json({ error: 'Erro ao obter detalhes do listing' });
        }
    }

    // Listar histórico de preços de um token
    async getPriceHistory(req, res) {
        const { listing_id } = req.params;

        try {
            const priceHistory = await TokenPriceHistory.query()
                .where('token_listing_id', listing_id)
                .withGraphFetched('changedByUser')
                .orderBy('created_at', 'desc');

            return res.json(priceHistory);
        } catch (error) {
            console.error('Error getting price history:', error);
            return res.status(500).json({ error: 'Erro ao obter histórico de preços' });
        }
    }

    // Listar listings por usuário
    async getUserListings(req, res) {
        const user_id = req.user.id;

        try {
            const listings = await TokenListing.query()
                .where('seller_id', user_id)
                .withGraphFetched('[nftToken, priceHistory]')
                .orderBy('created_at', 'desc');

            return res.json(listings);
        } catch (error) {
            console.error('Error getting user listings:', error);
            return res.status(500).json({ error: 'Erro ao listar seus tokens' });
        }
    }

    // Buscar listings com filtros
    async searchListings(req, res) {
        const { 
            min_price, 
            max_price, 
            status = 'active',
            sort_by = 'created_at',
            sort_order = 'desc'
        } = req.query;

        try {
            let query = TokenListing.query()
                .withGraphFetched('[nftToken, seller, priceHistory]');

            // Aplicar filtros
            if (min_price) {
                query = query.where('current_price', '>=', min_price);
            }
            if (max_price) {
                query = query.where('current_price', '<=', max_price);
            }
            if (status) {
                query = query.where('listing_status', status);
            }

            // Ordenação
            query = query.orderBy(sort_by, sort_order);

            const listings = await query;
            // Retorna lista vazia se não encontrar resultados
            return res.json(listings || []);
        } catch (error) {
            console.error('Error searching listings:', error);
            return res.status(500).json({ error: 'Erro ao buscar listings' });
        }
    }

    // Atualizar status do listing (marcar como vendido)
    async updateListingStatus(req, res) {
        const { listing_id } = req.params;
        const { status, transaction_metadata } = req.body;
        const user_id = req.user.id;

        try {
            const listing = await TokenListing.query()
                .where('id', listing_id)
                .first();

            if (!listing) {
                return res.status(404).json({ error: 'Listing não encontrado' });
            }

            // Verificar se o usuário tem permissão
            if (listing.seller_id !== user_id) {
                return res.status(403).json({ error: 'Sem permissão para atualizar este listing' });
            }

            // Atualizar status
            await listing.$query().patch({
                listing_status: status,
                chain_transaction_metadata: transaction_metadata
            });

            return res.json({ message: 'Status atualizado com sucesso' });
        } catch (error) {
            console.error('Error updating listing status:', error);
            return res.status(500).json({ error: 'Erro ao atualizar status' });
        }
    }

    // Verificar se um token está disponível para venda
    async checkTokenAvailability(req, res) {
        const { nft_token_id } = req.params;

        try {
            const listing = await TokenListing.query()
                .where('nft_token_id', nft_token_id)
                .where('listing_status', 'active')
                .first();

            return res.json({
                available: !listing,
                listing: listing || null
            });
        } catch (error) {
            console.error('Error checking token availability:', error);
            return res.status(500).json({ error: 'Erro ao verificar disponibilidade' });
        }
    }
}

module.exports = new TokenListingController(); 