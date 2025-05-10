CREATE TABLE IF NOT EXISTS rwa (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    description TEXT,
    property_value DECIMAL(20, 2) NOT NULL,
    total_tokens INTEGER NOT NULL,
    year_built INTEGER,
    size_m2 DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_property_value CHECK (property_value > 0),
    CONSTRAINT positive_total_tokens CHECK (total_tokens > 0),
    CONSTRAINT valid_year_built CHECK (year_built > 1800 AND year_built <= EXTRACT(YEAR FROM CURRENT_TIMESTAMP))
); 