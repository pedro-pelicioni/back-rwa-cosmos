CREATE TABLE wallet_nonces (
  address VARCHAR(100) PRIMARY KEY,
  nonce VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 