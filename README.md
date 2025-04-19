# Backend RWA Cosmos

Backend para o projeto RWA Cosmos, desenvolvido com Node.js e Express.

## Estrutura do Projeto

```
src/
├── index.js           # Ponto de entrada da aplicação
├── routes/            # Rotas da API
│   ├── auth.js        # Rotas de autenticação
│   ├── users.js       # Rotas de usuários
│   └── products.js    # Rotas de produtos
└── mocks/             # Dados mockados
    └── data.js        # Dados de exemplo
```

## Rotas Disponíveis

### Autenticação (`/api/auth`)
- `POST /login` - Login de usuário
- `POST /register` - Registro de novo usuário
- `GET /me` - Obter dados do usuário logado
- `POST /logout` - Logout
- `POST /refresh-token` - Renovar token

### Usuários (`/api/users`)
- `GET /` - Listar todos os usuários
- `GET /:id` - Obter um usuário específico
- `POST /` - Criar novo usuário
- `PUT /:id` - Atualizar usuário
- `PATCH /:id/password` - Atualizar senha
- `GET /:id/orders` - Listar pedidos do usuário
- `DELETE /:id` - Deletar usuário

### Produtos (`/api/products`)
- `GET /` - Listar todos os produtos
- `GET /category/:categoryId` - Buscar produtos por categoria
- `GET /search` - Buscar produtos por nome/descrição
- `GET /:id` - Obter um produto específico
- `POST /` - Criar novo produto
- `PUT /:id` - Atualizar produto
- `PATCH /:id/stock` - Atualizar estoque
- `DELETE /:id` - Deletar produto

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

## Executando o Projeto

Para desenvolvimento:
```bash
npm run dev
```

Para produção:
```bash
npm start
```

## Dados Mockados

O projeto inclui dados mockados para teste:

- Usuários (admin e usuário comum)
- Categorias (Eletrônicos, Computadores, Acessórios)
- Produtos (Smartphone, Notebook, Fone de Ouvido)
- Pedidos (exemplos de compras)

## Tecnologias Utilizadas

- Node.js
- Express
- Nodemon (desenvolvimento)
- CORS
- dotenv

## Requisitos

- Node.js (versão 14 ou superior)
- MongoDB

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
- Ajuste as variáveis conforme necessário

4. Inicie o servidor
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

## Rotas da API

### Autenticação
- POST /api/auth/login - Login de usuário
- POST /api/auth/register - Registro de novo usuário

### Usuários
- GET /api/users - Lista todos os usuários
- GET /api/users/:id - Obtém um usuário específico
- PUT /api/users/:id - Atualiza um usuário
- DELETE /api/users/:id - Remove um usuário

### Produtos
- GET /api/products - Lista todos os produtos
- GET /api/products/:id - Obtém um produto específico
- POST /api/products - Cria um novo produto
- PUT /api/products/:id - Atualiza um produto
- DELETE /api/products/:id - Remove um produto

## Licença

ISC