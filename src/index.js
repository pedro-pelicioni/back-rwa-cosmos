const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const rwaRoutes = require('./routes/rwaRoutes');
const rwaImageRoutes = require('./routes/rwaImageRoutes');
const rwaFacilityRoutes = require('./routes/rwaFacilityRoutes');
const rwaNftRoutes = require('./routes/rwaNftRoutes');
const rwaOwnershipHistoryRoutes = require('./routes/rwaOwnershipHistoryRoutes');
const jwtAuth = require('./middleware/jwtAuth');
const http = require('http');
const { pool } = require('./database/connection');

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
app.use('/api/rwa', jwtAuth, rwaRoutes);
app.use('/api/rwa/images', rwaImageRoutes);
app.use('/api/rwa/facilities', rwaFacilityRoutes);
app.use('/api/rwa/nfts', rwaNftRoutes);
app.use('/api/rwa/ownership-history', rwaOwnershipHistoryRoutes);

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Remover para o MVP atual
// app.use('/api/products', require('./routes/products'));

// Faz o servidor buscar uma porta disponível
function startServer() {
  // Tenta usar primeiro a porta configurada, depois tenta portas alternativas
  const basePORT = process.env.PORT || 3000;
  const MAX_PORT_ATTEMPTS = 10;
  
  // Testa as portas em sequência
  function tryPort(port, attempt) {
    if (attempt > MAX_PORT_ATTEMPTS) {
      console.error(`Não foi possível encontrar uma porta disponível após ${MAX_PORT_ATTEMPTS} tentativas`);
      process.exit(1);
      return;
    }
    
    const server = http.createServer(app);
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Porta ${port} está em uso, tentando porta ${port + 1}...`);
        // Tenta a próxima porta
        tryPort(port + 1, attempt + 1);
      } else {
        console.error('Erro ao iniciar o servidor:', err);
        process.exit(1);
      }
    });
    
    server.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
      console.log(`Documentação Swagger disponível em: http://localhost:${port}/api-docs`);
      
      // Verifica a conexão com o banco de dados
      pool.query('SELECT NOW()', (err, res) => {
        if (err) {
          console.error('Erro ao conectar ao banco de dados PostgreSQL:', err);
        } else {
          console.log('Conexão com banco de dados PostgreSQL estabelecida com sucesso');
        }
      });
    });
  }
  
  tryPort(basePORT, 1);
}

// Inicia o servidor
startServer(); 