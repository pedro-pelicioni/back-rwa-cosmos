const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const jwtAuth = require('./middleware/jwtAuth');

// Configuração das variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload()); // Para upload de arquivos KYC

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/users', jwtAuth, userRoutes);
app.use('/api/admin', jwtAuth, adminRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Remover para o MVP atual
// app.use('/api/products', require('./routes/products'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Documentação Swagger disponível em: http://localhost:${PORT}/api-docs`);
}); 