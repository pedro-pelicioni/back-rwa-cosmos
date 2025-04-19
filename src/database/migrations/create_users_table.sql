CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir dados iniciais
INSERT INTO users (name, email, password, role, created_at)
VALUES 
    ('João Silva', 'joao@email.com', '123456', 'admin', '2024-01-01'),
    ('Maria Santos', 'maria@email.com', '123456', 'user', '2024-01-02'); 