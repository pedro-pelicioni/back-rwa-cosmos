const { Model } = require('objection');

class TokenListing extends Model {
    static get tableName() {
        return 'rwa_token_listings';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['nft_token_id', 'seller_id', 'current_price', 'original_purchase_price', 'original_purchase_date'],

            properties: {
                id: { type: 'integer' },
                nft_token_id: { type: 'integer' },
                seller_id: { type: 'integer' },
                current_price: { type: 'number' },
                original_purchase_price: { type: 'number' },
                original_purchase_date: { type: 'string', format: 'date-time' },
                chain_transaction_metadata: { type: 'object' },
                listing_status: { type: 'string', enum: ['active', 'sold', 'cancelled', 'expired'] },
                available_until: { type: ['string', 'null'], format: 'date-time' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' }
            }
        };
    }

    static get relationMappings() {
        const NftToken = require('./NftToken');
        const User = require('./User');
        const TokenPriceHistory = require('./TokenPriceHistory');

        return {
            nftToken: {
                relation: Model.BelongsToOneRelation,
                modelClass: NftToken,
                join: {
                    from: 'rwa_token_listings.nft_token_id',
                    to: 'rwa_nft_tokens.id'
                }
            },
            seller: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'rwa_token_listings.seller_id',
                    to: 'users.id'
                }
            },
            priceHistory: {
                relation: Model.HasManyRelation,
                modelClass: TokenPriceHistory,
                join: {
                    from: 'rwa_token_listings.id',
                    to: 'rwa_token_price_history.token_listing_id'
                }
            }
        };
    }
}

module.exports = TokenListing; 