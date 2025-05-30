const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Tokenization API',
      version: '1.0.0',
      description: 'API for managing real estate tokenization',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID'
            },
            wallet_address: {
              type: 'string',
              description: 'User wallet address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            tax_id: {
              type: 'string',
              description: 'User tax ID (CPF)'
            },
            email: {
              type: 'string',
              description: 'User email'
            },
            phone: {
              type: 'string',
              description: 'User phone number'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'blocked'],
              description: 'User status'
            },
            kyc_status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: 'User KYC status'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        RWA: {
          type: 'object',
          required: ['name', 'location', 'city', 'country', 'currentValue', 'totalTokens'],
          properties: {
            id: {
              type: 'integer',
              description: 'RWA ID',
            },
            userId: {
              type: 'integer',
              description: 'Owner user ID',
            },
            name: {
              type: 'string',
              description: 'Property name',
            },
            location: {
              type: 'string',
              description: 'Full property address',
            },
            city: {
              type: 'string',
              description: 'Property city',
            },
            country: {
              type: 'string',
              description: 'Property country',
            },
            description: {
              type: 'string',
              description: 'Detailed property description',
            },
            currentValue: {
              type: 'number',
              description: 'Current property value',
              minimum: 0
            },
            totalTokens: {
              type: 'integer',
              description: 'Total available tokens',
              minimum: 1
            },
            yearBuilt: {
              type: 'integer',
              description: 'Property construction year',
            },
            sizeM2: {
              type: 'number',
              description: 'Size in square meters',
              minimum: 0
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'sold'],
              description: 'Property status',
              default: 'active'
            },
            geometry: {
              type: 'object',
              description: 'Property geographic coordinates',
              properties: {
                type: {
                  type: 'string',
                  enum: ['Point'],
                  default: 'Point'
                },
                coordinates: {
                  type: 'array',
                  items: {
                    type: 'number'
                  },
                  minItems: 2,
                  maxItems: 2,
                  description: '[longitude, latitude]'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date',
            },
          },
        },
        RWAImage: {
          type: 'object',
          required: ['rwa_id', 'title'],
          properties: {
            id: { 
              type: 'integer',
              description: 'Image ID'
            },
            rwa_id: { 
              type: 'integer',
              description: 'RWA ID'
            },
            title: { 
              type: 'string',
              description: 'Image title'
            },
            description: { 
              type: 'string',
              description: 'Image description'
            },
            cid_link: { 
              type: 'string',
              description: 'IPFS image link'
            },
            file_path: { 
              type: 'string',
              description: 'File path'
            },
            image_data: { 
              type: 'string',
              description: 'Base64 encoded image (max 10MB)'
            },
            display_order: { 
              type: 'integer',
              description: 'Display order'
            },
            created_at: { 
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updated_at: { 
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        RWAFacility: {
          type: 'object',
          required: ['rwa_id', 'name', 'type'],
          properties: {
            id: { 
              type: 'integer',
              description: 'Facility ID'
            },
            rwa_id: { 
              type: 'integer',
              description: 'RWA ID'
            },
            name: { 
              type: 'string',
              description: 'Facility name'
            },
            description: { 
              type: 'string',
              description: 'Facility description'
            },
            size_m2: { 
              type: 'number',
              description: 'Size in square meters'
            },
            floor_number: { 
              type: 'integer',
              description: 'Floor number'
            },
            type: { 
              type: 'string',
              description: 'Facility type (room, hall, kitchen, etc)'
            },
            status: { 
              type: 'string',
              enum: ['active', 'inactive', 'under_renovation'],
              description: 'Facility status'
            },
            created_at: { 
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updated_at: { 
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        RWANFTToken: {
          type: 'object',
          required: ['rwa_id', 'token_identifier', 'owner_user_id'],
          properties: {
            id: { 
              type: 'integer',
              description: 'Token ID'
            },
            rwa_id: { 
              type: 'integer',
              description: 'RWA ID'
            },
            token_identifier: { 
              type: 'string',
              description: 'Unique token identifier on blockchain'
            },
            owner_user_id: { 
              type: 'integer',
              description: 'Owner user ID'
            },
            metadata_uri: { 
              type: 'string',
              description: 'Token metadata URI'
            },
            created_at: { 
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updated_at: { 
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
        RWAOwnershipHistory: {
          type: 'object',
          required: ['rwa_id', 'to_user_id', 'quantity'],
          properties: {
            id: { 
              type: 'integer',
              description: 'Record ID'
            },
            rwa_id: { 
              type: 'integer',
              description: 'RWA ID'
            },
            token_id: { 
              type: 'integer',
              description: 'NFT token ID'
            },
            from_user_id: { 
              type: 'integer',
              description: 'Source user ID'
            },
            to_user_id: { 
              type: 'integer',
              description: 'Destination user ID'
            },
            quantity: { 
              type: 'integer',
              description: 'Number of tokens transferred'
            },
            transfer_date: { 
              type: 'string',
              format: 'date-time',
              description: 'Transfer date'
            },
            tx_hash: { 
              type: 'string',
              description: 'Blockchain transaction hash'
            }
          }
        },
        TokenListing: {
          type: 'object',
          required: ['nft_token_id', 'seller_id', 'current_price', 'original_purchase_price', 'original_purchase_date'],
          properties: {
            id: { 
              type: 'integer',
              description: 'Listing ID'
            },
            nft_token_id: { 
              type: 'integer',
              description: 'NFT token ID'
            },
            seller_id: { 
              type: 'integer',
              description: 'Seller ID'
            },
            current_price: { 
              type: 'number',
              description: 'Current token price'
            },
            original_purchase_price: { 
              type: 'number',
              description: 'Original purchase price'
            },
            original_purchase_date: { 
              type: 'string',
              format: 'date-time',
              description: 'Original purchase date'
            },
            chain_transaction_metadata: { 
              type: 'object',
              description: 'Blockchain transaction metadata'
            },
            listing_status: { 
              type: 'string',
              enum: ['active', 'sold', 'cancelled', 'expired'],
              description: 'Listing status'
            },
            available_until: { 
              type: 'string',
              format: 'date-time',
              description: 'Availability deadline'
            },
            created_at: { 
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updated_at: { 
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            },
            nftToken: {
              $ref: '#/components/schemas/RWANFTToken'
            },
            seller: {
              $ref: '#/components/schemas/User'
            },
            priceHistory: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/TokenPriceHistory'
              }
            }
          }
        },
        TokenPriceHistory: {
          type: 'object',
          required: ['token_listing_id', 'price', 'changed_by'],
          properties: {
            id: { 
              type: 'integer',
              description: 'Record ID'
            },
            token_listing_id: { 
              type: 'integer',
              description: 'Listing ID'
            },
            price: { 
              type: 'number',
              description: 'Recorded price'
            },
            changed_by: { 
              type: 'integer',
              description: 'User ID who changed the price'
            },
            change_reason: { 
              type: 'string',
              description: 'Change reason'
            },
            created_at: { 
              type: 'string',
              format: 'date-time',
              description: 'Change date'
            },
            changedByUser: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        KYC: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'KYC record ID'
            },
            wallet_address: {
              type: 'string',
              description: 'User wallet address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            tax_id: {
              type: 'string',
              description: 'User tax ID (CPF)'
            },
            document_front_cid: {
              type: 'string',
              description: 'ID document front CID on IPFS'
            },
            document_back_cid: {
              type: 'string',
              description: 'ID document back CID on IPFS'
            },
            selfie_1_cid: {
              type: 'string',
              description: 'First selfie with document CID on IPFS'
            },
            selfie_2_cid: {
              type: 'string',
              description: 'Second selfie with document CID on IPFS'
            },
            status: {
              type: 'string',
              enum: ['pending', 'approved', 'rejected'],
              description: 'KYC status'
            },
            step: {
              type: 'string',
              enum: ['basic_data', 'documents'],
              description: 'Current KYC step'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation date'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Last update date'
            }
          }
        },
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        walletAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'JWT token obtained after wallet authentication'
        }
      },
    },
    paths: {
      '/api/rwa/tokens/sale/initiate': {
        post: {
          summary: 'Initiate a token sale',
          tags: ['Token Sales'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['token_id', 'quantity', 'price_per_token'],
                  properties: {
                    token_id: { type: 'integer' },
                    quantity: { type: 'integer' },
                    price_per_token: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Sale initiated successfully' },
            403: { description: 'No permission to sell this token' },
            404: { description: 'Token not found' },
            500: { description: 'Error initiating sale' }
          }
        }
      },
      '/api/rwa/tokens/sale/confirm': {
        post: {
          summary: 'Confirm a token sale',
          tags: ['Token Sales'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['sale_id', 'tx_hash', 'signature'],
                  properties: {
                    sale_id: { type: 'integer' },
                    tx_hash: { type: 'string' },
                    signature: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Sale confirmed successfully' },
            400: { description: 'Sale is not pending' },
            404: { description: 'Sale not found' },
            500: { description: 'Error confirming sale' }
          }
        }
      },
      '/api/rwa/tokens/sale/cancel/{sale_id}': {
        post: {
          summary: 'Cancel a token sale',
          tags: ['Token Sales'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'sale_id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: { description: 'Sale cancelled successfully' },
            400: { description: 'Sale cannot be cancelled' },
            403: { description: 'No permission to cancel this sale' },
            404: { description: 'Sale not found' },
            500: { description: 'Error cancelling sale' }
          }
        }
      },
      '/api/rwa/tokens/sale/{sale_id}': {
        get: {
          summary: 'Get a token sale by ID',
          tags: ['Token Sales'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'sale_id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: { description: 'Sale found successfully' },
            404: { description: 'Sale not found' },
            500: { description: 'Error getting sale' }
          }
        }
      },
      '/marketplace/listings': {
        get: {
          summary: 'List all tokens available for sale',
          tags: ['Marketplace'],
          responses: {
            200: {
              description: 'List of available tokens',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/TokenListing'
                    }
                  }
                }
              }
            },
            500: { description: 'Error listing tokens' }
          }
        },
        post: {
          summary: 'Create a new token listing for sale',
          tags: ['Marketplace'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nft_token_id', 'current_price', 'original_purchase_price', 'original_purchase_date'],
                  properties: {
                    nft_token_id: { type: 'integer' },
                    current_price: { type: 'number' },
                    original_purchase_price: { type: 'number' },
                    original_purchase_date: { type: 'string', format: 'date-time' },
                    chain_transaction_metadata: { type: 'object' },
                    available_until: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Listing created successfully' },
            400: { description: 'Token is already listed' },
            403: { description: 'Token does not belong to user' },
            500: { description: 'Error creating listing' }
          }
        }
      },
      '/marketplace/listings/search': {
        get: {
          summary: 'Search listings with filters',
          tags: ['Marketplace'],
          parameters: [
            {
              in: 'query',
              name: 'min_price',
              schema: { type: 'number' }
            },
            {
              in: 'query',
              name: 'max_price',
              schema: { type: 'number' }
            },
            {
              in: 'query',
              name: 'status',
              schema: { 
                type: 'string',
                enum: ['active', 'sold', 'cancelled', 'expired']
              }
            },
            {
              in: 'query',
              name: 'sort_by',
              schema: { 
                type: 'string',
                enum: ['created_at', 'current_price']
              }
            },
            {
              in: 'query',
              name: 'sort_order',
              schema: { 
                type: 'string',
                enum: ['asc', 'desc']
              }
            }
          ],
          responses: {
            200: {
              description: 'List of filtered listings',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/TokenListing'
                    }
                  }
                }
              }
            },
            500: { description: 'Error searching listings' }
          }
        }
      },
      '/marketplace/my-listings': {
        get: {
          summary: 'List logged user tokens',
          tags: ['Marketplace'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'List of user tokens',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/TokenListing'
                    }
                  }
                }
              }
            },
            500: { description: 'Error listing tokens' }
          }
        }
      },
      '/marketplace/listings/{listing_id}': {
        get: {
          summary: 'Get details of a specific listing',
          tags: ['Marketplace'],
          parameters: [
            {
              in: 'path',
              name: 'listing_id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: {
              description: 'Listing details',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TokenListing'
                  }
                }
              }
            },
            404: { description: 'Listing not found' },
            500: { description: 'Error getting details' }
          }
        }
      },
      '/marketplace/listings/{listing_id}/price': {
        patch: {
          summary: 'Update a listing price',
          tags: ['Marketplace'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'listing_id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['new_price'],
                  properties: {
                    new_price: { type: 'number' },
                    change_reason: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Price updated successfully' },
            403: { description: 'Only seller can update price' },
            404: { description: 'Listing not found' },
            500: { description: 'Error updating price' }
          }
        }
      },
      '/marketplace/listings/{listing_id}/cancel': {
        patch: {
          summary: 'Cancel a listing',
          tags: ['Marketplace'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'listing_id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: { description: 'Listing cancelled successfully' },
            403: { description: 'Only seller can cancel listing' },
            404: { description: 'Listing not found' },
            500: { description: 'Error cancelling listing' }
          }
        }
      },
      '/marketplace/listings/{listing_id}/status': {
        patch: {
          summary: 'Update a listing status',
          tags: ['Marketplace'],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: 'path',
              name: 'listing_id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['status'],
                  properties: {
                    status: { 
                      type: 'string',
                      enum: ['active', 'sold', 'cancelled', 'expired']
                    },
                    transaction_metadata: { type: 'object' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Status updated successfully' },
            403: { description: 'No permission to update' },
            404: { description: 'Listing not found' },
            500: { description: 'Error updating status' }
          }
        }
      },
      '/marketplace/listings/{listing_id}/price-history': {
        get: {
          summary: 'Get token price history',
          tags: ['Marketplace'],
          parameters: [
            {
              in: 'path',
              name: 'listing_id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: {
              description: 'Price history',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/TokenPriceHistory'
                    }
                  }
                }
              }
            },
            500: { description: 'Error getting history' }
          }
        }
      },
      '/marketplace/tokens/{nft_token_id}/availability': {
        get: {
          summary: 'Check if a token is available for sale',
          tags: ['Marketplace'],
          parameters: [
            {
              in: 'path',
              name: 'nft_token_id',
              required: true,
              schema: { type: 'integer' }
            }
          ],
          responses: {
            200: {
              description: 'Token availability status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      available: { type: 'boolean' },
                      listing: { 
                        $ref: '#/components/schemas/TokenListing'
                      }
                    }
                  }
                }
              }
            },
            500: { description: 'Error checking availability' }
          }
        }
      },
      '/api/users/kyc/basic': {
        post: {
          summary: 'Submit basic KYC data (step 1)',
          description: 'Submit name and tax ID to start KYC process',
          tags: ['Users'],
          security: [{ walletAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'tax_id'],
                  properties: {
                    name: {
                      type: 'string',
                      description: 'User full name'
                    },
                    tax_id: {
                      type: 'string',
                      description: 'User tax ID (CPF)'
                    }
                  }
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Basic data submitted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Basic data submitted successfully'
                      },
                      kyc_id: {
                        type: 'integer',
                        description: 'KYC record ID'
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid data or KYC already started',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized'
            },
            500: {
              description: 'Internal server error'
            }
          }
        }
      },
      '/api/users/kyc/documents': {
        post: {
          summary: 'Submit KYC documents (step 2)',
          description: 'Submit documents and selfies to complete KYC',
          tags: ['Users'],
          security: [{ walletAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    document_front: {
                      type: 'string',
                      format: 'binary',
                      description: 'ID document front'
                    },
                    document_back: {
                      type: 'string',
                      format: 'binary',
                      description: 'ID document back'
                    },
                    selfie_1: {
                      type: 'string',
                      format: 'binary',
                      description: 'First selfie with document'
                    },
                    selfie_2: {
                      type: 'string',
                      format: 'binary',
                      description: 'Second selfie with document'
                    }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Documents submitted successfully',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Documents submitted successfully'
                      },
                      kyc_id: {
                        type: 'integer',
                        description: 'KYC record ID'
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: 'Invalid data or step 1 not completed',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized'
            },
            500: {
              description: 'Internal server error'
            }
          }
        }
      },
      '/api/users/kyc': {
        get: {
          summary: 'Get KYC status',
          description: 'Returns current KYC verification status and step',
          tags: ['Users'],
          security: [{ walletAuth: [] }],
          responses: {
            200: {
              description: 'KYC status returned successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/KYC'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized'
            },
            404: {
              description: 'KYC not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error'
                  }
                }
              }
            },
            500: {
              description: 'Internal server error'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js'], // files containing annotations
};

const specs = swaggerJsdoc(options);

module.exports = specs; 