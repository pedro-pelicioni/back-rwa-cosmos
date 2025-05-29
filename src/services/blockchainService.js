const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { DirectSecp256k1HdWallet } = require('@cosmjs/proto-signing');
const { GasPrice } = require('@cosmjs/stargate');

// Configuração do cliente CosmWasm
const rpcEndpoint = process.env.CHAIN_RPC_ENDPOINT || 'https://rpc.neutron-1.neutron.org';
const contractAddress = process.env.NFT_CONTRACT_ADDRESS;
const adminMnemonic = process.env.ADMIN_MNEMONIC;

let client = null;
let adminWallet = null;

/**
 * Inicializa o cliente CosmWasm
 */
async function initClient() {
  if (!client) {
    // Cria wallet do admin
    adminWallet = await DirectSecp256k1HdWallet.fromMnemonic(adminMnemonic, {
      prefix: 'neutron'
    });

    // Inicializa cliente
    client = await SigningCosmWasmClient.connectWithSigner(
      rpcEndpoint,
      adminWallet,
      {
        gasPrice: GasPrice.fromString('0.025uatom')
      }
    );
  }
  return client;
}

/**
 * Executa mint de um NFT
 */
async function executeMint({ rwaId, ownerAddress, metadataUri }) {
  try {
    const client = await initClient();
    const [adminAddress] = await adminWallet.getAccounts();

    // Prepara mensagem de mint
    const msg = {
      mint: {
        token_id: `rwa-${rwaId}`,
        owner: ownerAddress,
        token_uri: metadataUri
      }
    };

    // Executa mint
    const result = await client.execute(
      adminAddress.address,
      contractAddress,
      msg,
      'auto'
    );

    return {
      tokenId: `rwa-${rwaId}`,
      txHash: result.transactionHash
    };
  } catch (error) {
    console.error('Erro ao executar mint:', error);
    throw new Error('Erro ao executar mint na blockchain');
  }
}

/**
 * Executa burn de um NFT
 */
async function executeBurn({ tokenId }) {
  try {
    const client = await initClient();
    const [adminAddress] = await adminWallet.getAccounts();

    // Prepara mensagem de burn
    const msg = {
      burn: {
        token_id: tokenId
      }
    };

    // Executa burn
    const result = await client.execute(
      adminAddress.address,
      contractAddress,
      msg,
      'auto'
    );

    return {
      txHash: result.transactionHash
    };
  } catch (error) {
    console.error('Erro ao executar burn:', error);
    throw new Error('Erro ao executar burn na blockchain');
  }
}

/**
 * Executa transferência de um NFT
 */
async function executeTransfer({ tokenId, toAddress, txHash }) {
  try {
    const client = await initClient();
    const [adminAddress] = await adminWallet.getAccounts();

    // Prepara mensagem de transferência
    const msg = {
      transfer_nft: {
        token_id: tokenId,
        recipient: toAddress
      }
    };

    // Executa transferência
    const result = await client.execute(
      adminAddress.address,
      contractAddress,
      msg,
      'auto'
    );

    return {
      txHash: result.transactionHash
    };
  } catch (error) {
    console.error('Erro ao executar transferência:', error);
    throw new Error('Erro ao executar transferência na blockchain');
  }
}

module.exports = {
  executeMint,
  executeBurn,
  executeTransfer
}; 