require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Lê o certificado CA
const ca = fs.readFileSync(path.join(__dirname, 'ca.pem'), 'utf8');

module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      connectionString: 'postgres://avnadmin:AVNS_zw8vtVrsCTR_oC7ZVJR@imolatan-rwa-imolatam.g.aivencloud.com:13273/defaultdb',
      ssl: {
        ca,
        rejectUnauthorized: true
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/database/migrations'
    }
  },
  production: {
    client: 'postgresql',
    connection: {
      connectionString: 'postgres://avnadmin:AVNS_zw8vtVrsCTR_oC7ZVJR@imolatan-rwa-imolatam.g.aivencloud.com:13273/defaultdb',
      ssl: {
        ca,
        rejectUnauthorized: true
      }
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/database/migrations'
    }
  }
}; 