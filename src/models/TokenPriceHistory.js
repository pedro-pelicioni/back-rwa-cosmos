const { Model } = require('objection');

class TokenPriceHistory extends Model {
    static get tableName() {
        return 'rwa_token_price_history';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['token_listing_id', 'price', 'changed_by'],

            properties: {
                id: { type: 'integer' },
                token_listing_id: { type: 'integer' },
                price: { type: 'number' },
                changed_by: { type: 'integer' },
                change_reason: { type: ['string', 'null'] },
                created_at: { type: 'string', format: 'date-time' }
            }
        };
    }

    static get relationMappings() {
        const TokenListing = require('./TokenListing');
        const User = require('./User');

        return {
            tokenListing: {
                relation: Model.BelongsToOneRelation,
                modelClass: TokenListing,
                join: {
                    from: 'rwa_token_price_history.token_listing_id',
                    to: 'rwa_token_listings.id'
                }
            },
            changedByUser: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'rwa_token_price_history.changed_by',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = TokenPriceHistory; 