# 🌟 IMOLATAM: Tokenizing Real Estate in Latin America 🌟

## 📋 Overview
IMOLATAM is an innovative platform revolutionizing real estate investment in Latin America through blockchain-based property tokenization. Our mission is to democratize access to the real estate market, allowing investors of all sizes to participate in this traditionally exclusive market.

## 🔐 Authentication Flow

The system uses secure message signature-based authentication:

1. Frontend requests a nonce for the wallet address
2. Backend generates and stores a unique nonce
3. User signs the nonce with their wallet (Keplr)
4. Frontend sends the address, nonce, and signature
5. Backend validates the signature and generates a JWT token
6. All subsequent requests require the `Authorization: Bearer <token>` header

## 🏠 Main Features

### 1. Real Estate Tokenization
- Creation of NFT tokens representing real properties
- Division of properties into tradable tokens
- Complete metadata and documentation registration
- Blockchain integration for authenticity guarantee

### 2. Token Marketplace
- Listing of tokens available for purchase
- Advanced search system with filters
- Price and transaction history
- Intuitive interface for buying and selling

### 3. KYC (Know Your Customer)
- ID document upload
- Selfie verification
- Administrator approval process
- Real-time verification status

## 🛠️ Available APIs

### Authentication (`/api/auth`)
- `GET /nonce` - Get nonce for authentication
- `POST /wallet-login` - Login via wallet with signature

### Users (`/api/users`)
- `GET /me` - Get authenticated user data
- `POST /kyc` - Submit KYC documents
- `GET /kyc` - Get user KYC information

### Marketplace (`/api/marketplace`)
- `GET /listings` - List available tokens
- `POST /listings` - Create new listing
- `GET /listings/search` - Advanced search
- `GET /listings/:id` - Listing details

### Admin (`/api/admin`)
- `GET /kyc-list` - List all KYCs
- `PATCH /kyc-status/:id` - Approve/reject KYC

## 💻 Technology Stack

### Backend
- Node.js with Express
- PostgreSQL database
- Objection.js for ORM
- JWT for authentication
- Swagger for API documentation

### Blockchain
- Cosmos Network integration
- NFT support
- Smart Contracts for tokenization
- Secure and transparent transactions

## 🚀 Installation

1. Clone the repository
   ```bash
   git clone [repository-url]
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure environment variables
   - Copy `.env.example` to `.env`
   - Adjust PostgreSQL variables
   - Add `JWT_SECRET` for token signing

4. Create PostgreSQL database
   ```bash
   createdb rwa_cosmos
   ```

5. Run migrations
   ```bash
   node src/database/migrate.js
   ```

6. Start the server
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📋 Requirements

- Node.js (version 14 or higher)
- PostgreSQL
- express-fileupload (for document upload)
- jsonwebtoken (for JWT authentication)
- @cosmjs/amino (for signature validation)

## 📝 License

ISC
