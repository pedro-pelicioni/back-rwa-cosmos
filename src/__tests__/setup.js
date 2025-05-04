const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Configuração das variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/health', require('../routes/health'));
app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/users'));
app.use('/api/products', require('../routes/products'));

module.exports = app; 