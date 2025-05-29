CREATE TABLE rwa_token_listings (
    id SERIAL PRIMARY KEY,
    nft_token_id INTEGER NOT NULL REFERENCES rwa_nft_tokens(id),
    seller_id INTEGER NOT NULL REFERENCES users(id),
    current_price DECIMAL(20, 8) NOT NULL,
    original_purchase_price DECIMAL(20, 8) NOT NULL,
    original_purchase_date TIMESTAMP NOT NULL,
    chain_transaction_metadata JSONB,
    listing_status VARCHAR(20) NOT NULL DEFAULT 'active',
    available_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_listing_status CHECK (listing_status IN ('active', 'sold', 'cancelled', 'expired'))
);

CREATE INDEX idx_rwa_token_listings_nft_token_id ON rwa_token_listings(nft_token_id);
CREATE INDEX idx_rwa_token_listings_seller_id ON rwa_token_listings(seller_id);
CREATE INDEX idx_rwa_token_listings_status ON rwa_token_listings(listing_status); 