const { Pool } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Lê o certificado CA
const ca = fs.readFileSync(path.join(__dirname, '../../ca.pem'), 'utf8');

const pool = new Pool(
  process.env.NODE_ENV === 'production'
    ? {
        user: 'avnadmin',
        host: 'imolatan-rwa-imolatam.g.aivencloud.com',
        database: 'defaultdb',
        password: 'AVNS_zw8vtVrsCTR_oC7ZVJR',
        port: 13273,
        ssl: {
          rejectUnauthorized: false,
          ca: ca
        }
      }
    : {
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'admin',
        port: 5432
      }
);

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
}; 