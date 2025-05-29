CREATE TABLE rwa_token_price_history (
    id SERIAL PRIMARY KEY,
    token_listing_id INTEGER NOT NULL REFERENCES rwa_token_listings(id),
    price DECIMAL(20, 8) NOT NULL,
    changed_by INTEGER NOT NULL REFERENCES users(id),
    change_reason VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rwa_token_price_history_listing_id ON rwa_token_price_history(token_listing_id);
CREATE INDEX idx_rwa_token_price_history_created_at ON rwa_token_price_history(created_at); 