const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RWA Cosmos API',
      version: '1.0.0',
      description: 'API para o projeto RWA Cosmos com autenticação via wallet e KYC',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        walletAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-wallet-address',
          description: 'Endereço da wallet para autenticação',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // arquivos que contêm as anotações
};

const specs = swaggerJsdoc(options);

module.exports = specs; 