const { SigningStargateClient } = require('@cosmjs/stargate');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const RWA = require('../models/RWA');
const RWAImage = require('../models/RWAImage');
const RWAFacility = require('../models/RWAFacility');

// Configuração do cliente Jackal
const rpcEndpoint = process.env.JACKAL_RPC_ENDPOINT || 'https://rpc.jackal-1.jackal.network';
const adminMnemonic = process.env.ADMIN_MNEMONIC;

let client = null;
let adminWallet = null;

/**
 * Inicializa o cliente Jackal
 */
async function initClient() {
  if (!client) {
    // Cria wallet do admin
    adminWallet = await DirectSecp256k1HdWallet.fromMnemonic(adminMnemonic, {
      prefix: 'jackal'
    });

    // Inicializa cliente
    client = await SigningStargateClient.connectWithSigner(
      rpcEndpoint,
      adminWallet
    );
  }
  return client;
}

/**
 * Gera metadados para um NFT baseado no RWA
 */
async function generateMetadata(rwa) {
  try {
    // Busca imagens do RWA
    const images = await RWAImage.findByRWAId(rwa.id);
    
    // Busca facilidades do RWA
    const facilities = await RWAFacility.findByRWAId(rwa.id);

    // Monta o objeto de metadados
    const metadata = {
      name: rwa.name,
      description: rwa.description,
      image: images.length > 0 ? images[0].url : null,
      attributes: [
        {
          trait_type: "Cidade",
          value: rwa.city
        },
        {
          trait_type: "País",
          value: rwa.country
        },
        {
          trait_type: "Valor Atual",
          value: rwa.current_value
        },
        {
          trait_type: "Total de Tokens",
          value: rwa.total_tokens
        },
        {
          trait_type: "Ano de Construção",
          value: rwa.year_built
        },
        {
          trait_type: "Tamanho (m²)",
          value: rwa.size_m2
        }
      ],
      properties: {
        facilities: facilities.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size_m2,
          floor: f.floor_number
        })),
        images: images.map(img => ({
          url: img.url,
          type: img.type
        }))
      }
    };

    return metadata;
  } catch (error) {
    console.error('Erro ao gerar metadados:', error);
    throw new Error('Erro ao gerar metadados do NFT');
  }
}

/**
 * Faz upload dos metadados para o Jackal Protocol
 */
async function uploadToJackal(metadata) {
  try {
    const client = await initClient();
    const [adminAddress] = await adminWallet.getAccounts();

    // Converte metadados para JSON
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));

    // Prepara mensagem para upload no Jackal
    const msg = {
      typeUrl: "/jackal.storage.MsgPostFile",
      value: {
        creator: adminAddress.address,
        content: metadataBuffer.toString('base64'),
        encryption: true,
        fileName: `rwa-metadata-${Date.now()}.json`
      }
    };

    // Executa upload
    const result = await client.signAndBroadcast(
      adminAddress.address,
      [msg],
      'auto'
    );

    // Retorna o URI do Jackal
    return `jackal://${result.transactionHash}`;
  } catch (error) {
    console.error('Erro ao fazer upload para Jackal:', error);
    throw new Error('Erro ao fazer upload dos metadados para Jackal');
  }
}

module.exports = {
  generateMetadata,
  uploadToJackal
}; 