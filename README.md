# Backend RWA Cosmos com Wallet e KYC

Backend para o projeto RWA Cosmos, desenvolvido com Node.js, Express e PostgreSQL, utilizando autenticação via wallet (Neutron) e processo de KYC.

## Estrutura do Projeto

```
src/
├── index.js               # Ponto de entrada da aplicação
├── controllers/           # Controladores 
│   ├── authController.js  # Controlador de autenticação
│   ├── usersController.js # Controlador de usuários
│   ├── kycController.js   # Controlador de KYC
│   └── adminController.js # Controlador de administração
├── middleware/            # Middlewares
│   ├── walletAuth.js      # Autenticação via wallet
│   ├── jwtAuth.js         # Validação de token JWT
│   └── adminOnly.js       # Restrição para admin
├── routes/                # Rotas da API
│   ├── auth.js            # Rotas de autenticação
│   ├── users.js           # Rotas de usuários
│   └── admin.js           # Rotas de administração
├── database/              # Banco de dados
│   ├── connection.js      # Conexão com PostgreSQL
│   ├── migrate.js         # Script de migração
│   └── migrations/        # Arquivos SQL de migração
└── mocks/                 # Dados mockados para testes
```

## Banco de Dados

O projeto utiliza PostgreSQL com as seguintes tabelas:

### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  address VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### KYC
```sql
CREATE TABLE kyc (
  id SERIAL PRIMARY KEY,
  user_address VARCHAR(100) REFERENCES users(address),
  nome VARCHAR(100),
  cpf VARCHAR(20),
  documento_frente_cid VARCHAR(255),
  documento_verso_cid VARCHAR(255),
  selfie_1_cid VARCHAR(255),
  selfie_2_cid VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Wallet Nonces
```sql
CREATE TABLE wallet_nonces (
  address VARCHAR(100) PRIMARY KEY,
  nonce VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Rotas Disponíveis

### Autenticação (`/api/auth`)
- `GET /nonce` - Obter nonce para autenticação
- `POST /wallet-login` - Login via wallet com assinatura

### Usuários (`/api/users`)
- `GET /me` - Obter dados do usuário autenticado
- `POST /kyc` - Enviar documentos para KYC
- `GET /kyc` - Obter informações do KYC do usuário

### Admin (`/api/admin`)
- `GET /kyc-list` - Listar todos os KYCs (apenas admin)
- `PATCH /kyc-status/:id` - Aprovar/rejeitar KYC (apenas admin)

## Fluxo de Autenticação

O sistema utiliza autenticação segura baseada em assinatura de mensagem:

1. O frontend solicita um nonce para o endereço da wallet
2. O backend gera e armazena um nonce único
3. O usuário assina o nonce com sua wallet (Keplr)
4. O frontend envia o endereço, nonce e assinatura
5. O backend valida a assinatura e gera um token JWT
6. Todas as requisições subsequentes exigem o cabeçalho `Authorization: Bearer <token>`

## Fluxo de KYC

1. Usuário envia documentos (frente/verso) e selfies
2. Documentos são armazenados (simulação IPFS)
3. Admin visualiza a lista de KYCs pendentes
4. Admin aprova ou rejeita o KYC

## Exemplo de Requisições

### Obter Nonce
```http
GET /api/auth/nonce?address=neutron1xyz123abc456def789ghi
```

### Login via Wallet
```http
POST /api/auth/wallet-login
Content-Type: application/json

{
  "address": "neutron1xyz123abc456def789ghi",
  "signature": "assinatura_gerada_pela_wallet",
  "nonce": "nonce_obtido_anteriormente"
}
```

### Requisição Autenticada
```http
GET /api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Instalação

1. Clone o repositório
   ```bash
   git clone [url-do-repositorio]
   ```

2. Instale as dependências
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente
   - Copie o arquivo `.env.example` para `.env`
   - Ajuste as variáveis do PostgreSQL
   - Adicione `JWT_SECRET` para assinatura dos tokens

4. Crie o banco de dados PostgreSQL
   ```bash
   createdb rwa_cosmos
   ```

5. Execute as migrações
   ```bash
   node src/database/migrate.js
   ```

6. Inicie o servidor
   ```bash
   # Modo desenvolvimento
   npm run dev

   # Modo produção
   npm start
   ```

## Requisitos

- Node.js (versão 14 ou superior)
- PostgreSQL
- express-fileupload (para upload de documentos)
- jsonwebtoken (para autenticação JWT)
- @cosmjs/amino (para validação de assinaturas)

## Licença

ISC