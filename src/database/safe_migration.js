const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const config = {
    user: "avnadmin",
    password: "AVNS_zw8vtVrsCTR_oC7ZVJR",
    host: "imolatan-rwa-imolatam.g.aivencloud.com",
    port: 13273,
    database: "defaultdb",
    ssl: {
        rejectUnauthorized: true,
        ca: `-----BEGIN CERTIFICATE-----
MIIETTCCArWgAwIBAgIUH4k8oVj78TLzIXxMWDYJbw64wGswDQYJKoZIhvcNAQEM
BQAwQDE+MDwGA1UEAww1ZjgwYzA2Y2MtOTlkNS00YjllLTgzZmYtZjYyNDk4MTU3
ZjFhIEdFTiAxIFByb2plY3QgQ0EwHhcNMjUwNTE3MTQ1MDIzWhcNMzUwNTE1MTQ1
MDIzWjBAMT4wPAYDVQQDDDVmODBjMDZjYy05OWQ1LTRiOWUtODNmZi1mNjI0OTgx
NTdmMWEgR0VOIDEgUHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCC
AYoCggGBAJ9Vu/YP1vM+AxQ60DopuUOb4Zop0Gq6yRzDoBQOl3cejHO8wlfmmJ1w
Lq/5mXJPkoz2yVDAmiFgNLJnLLfoHPwz9yWNybWxCaCfzWHKj8097ew98kg4SC2c
nbHpA6DqLwTcZLU3oj+GRydHKoD5PW0eIiEtkn2UoM/2xfgxLmz3AitKO1qRoiNY
ipPm+1gyr2G3Sg4pLDL3/5nJDxS/F9ZijdhdF4FUxE6ZUcTJa1WowWaj7nOTeaEV
elwosMipa8Tr9CND+mZbRvLo16x+IbdOcYNEHzDOeVFBPLzmjZoVRJYy2cNXxT7V
dLlKce6UKANTcqP4o7piSov74RZOeDh9H4jRcbyctWQDb1TVQKEvWUgaFTy1ypMU
hz3ZY+aximKzWKfRsxqXeY09rNlDYTQ4xgXbxpS8OngFvXlZLN5uNf9/l+71f+0r
bSkrmIkxGMFHdTWAUSTExFPy98vJcE+G3dhV2JnWoKnKa9/Lsq1IgAXvCbqVb+qt
wBN8n4p1bwIDAQABoz8wPTAdBgNVHQ4EFgQUQaqMq2esWdgKODj9YQjGHMVsFb4w
DwYDVR0TBAgwBgEB/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGB
AC3+tPFLMDdN7t4EiPX9vQTrMPqNyZJnak/J6rwrDRBjf+Kh3UDVoOwMXjNNnZyS
GXKB/aVOFLI78nNZ/0ZFM4oBFnWhIDothYbzguU7NPXpCCHG1S64y9O2fTMwgd9o
mgHZ5/Z4Ylgf8Q3EyVSqev5tVsk0BMC5+t23kbM14j6NvPGO0LPWEa/SA//Vh16N
FB8LdYtk4v2c5VZMGNBuyZH7ZFSFYHD0yk1QbqR7AqRRwC/oJBvovxzvNaffv6BM
02dr+0m0iwA0m1R0lObbJce3wpZzJa0zbDWo2/4xWr4lQ7N6vNoxKEIAjhFJv9dh
8SPF8coMlLYl4RQZ75JT2AKHValAVW2E3R6DiXli6LWzsUJAgu3kaj6EYwPHcdPC
8QF7pi0V8RTW5nMLtZbYSaDnzmVomj9ObyWm3E79xdtVzV5s5cVKN1vQYE0peQnu
EjM3isdxUUlkN16Z4YMzumE3VYqA7L20KinpdBkAG1ZHjTkaHH7H4rbAbmJKbzKC
ZQ==
-----END CERTIFICATE-----`
    }
};

const pool = new Pool(config);

async function safeMigration() {
  try {
    console.log('Iniciando migration segura...');

    // 1. users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        wallet_address VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela users verificada/criada.');

    // 2. wallet_nonces
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wallet_nonces (
        address VARCHAR(100) PRIMARY KEY,
        nonce VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela wallet_nonces verificada/criada.');

    // 3. kyc
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kyc (
        id SERIAL PRIMARY KEY,
        user_address VARCHAR(100) REFERENCES users(wallet_address),
        nome VARCHAR(100),
        cpf VARCHAR(20),
        documento_frente_cid VARCHAR(255),
        documento_verso_cid VARCHAR(255),
        selfie_1_cid VARCHAR(255),
        selfie_2_cid VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pendente',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela kyc verificada/criada.');

    // 4. rwa
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rwa (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        gps_coordinates VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        description TEXT,
        current_value DECIMAL(18, 2) NOT NULL,
        total_tokens INTEGER NOT NULL,
        year_built INTEGER,
        size_m2 DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'active',
        geometry JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela rwa verificada/criada.');

    // 5. rwa_images
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rwa_images (
        id SERIAL PRIMARY KEY,
        rwa_id INTEGER REFERENCES rwa(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cid_link VARCHAR(255),
        file_path VARCHAR(255),
        image_data TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela rwa_images verificada/criada.');

    // 6. rwa_facilities
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rwa_facilities (
        id SERIAL PRIMARY KEY,
        rwa_id INTEGER REFERENCES rwa(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        size_m2 DECIMAL(10, 2),
        floor_number INTEGER,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela rwa_facilities verificada/criada.');

    // 7. rwa_nft_tokens
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rwa_nft_tokens (
        id SERIAL PRIMARY KEY,
        rwa_id INTEGER REFERENCES rwa(id) ON DELETE CASCADE,
        token_identifier VARCHAR(255) NOT NULL,
        owner_user_id INTEGER REFERENCES users(id),
        metadata_uri VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabela rwa_nft_tokens verificada/criada.');

    // 8. rwa_ownership_history
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rwa_ownership_history (
        id SERIAL PRIMARY KEY,
        rwa_id INTEGER REFERENCES rwa(id) ON DELETE CASCADE,
        token_id INTEGER REFERENCES rwa_nft_tokens(id),
        from_user_id INTEGER REFERENCES users(id),
        to_user_id INTEGER REFERENCES users(id) NOT NULL,
        quantity INTEGER NOT NULL,
        transfer_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        tx_hash VARCHAR(255)
      );
    `);
    console.log('Tabela rwa_ownership_history verificada/criada.');

    // 9. rwa_token_sales
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rwa_token_sales (
        id SERIAL PRIMARY KEY,
        token_id INTEGER NOT NULL REFERENCES rwa_nft_tokens(id),
        seller_id INTEGER NOT NULL REFERENCES users(id),
        buyer_id INTEGER REFERENCES users(id),
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price_per_token DECIMAL(20,2) NOT NULL CHECK (price_per_token > 0),
        transaction_hash VARCHAR(255),
        signature TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE,
        cancelled_at TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX IF NOT EXISTS idx_rwa_token_sales_token_id ON rwa_token_sales(token_id);
      CREATE INDEX IF NOT EXISTS idx_rwa_token_sales_seller_id ON rwa_token_sales(seller_id);
      CREATE INDEX IF NOT EXISTS idx_rwa_token_sales_buyer_id ON rwa_token_sales(buyer_id);
      CREATE INDEX IF NOT EXISTS idx_rwa_token_sales_status ON rwa_token_sales(status);
    `);
    console.log('Tabela rwa_token_sales verificada/criada.');

    console.log('Migration segura concluída!');
  } catch (err) {
    console.error('Erro na migration segura:', err);
  } finally {
    await pool.end();
  }
}

safeMigration(); 