const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: 'avnadmin',
    host: 'imolatan-rwa-imolatam.g.aivencloud.com',
    database: 'defaultdb',
    password: 'AVNS_zw8vtVrsCTR_oC7ZVJR',
    port: 13273,
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
}; 