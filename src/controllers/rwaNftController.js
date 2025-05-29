const RWANFTToken = require('../models/RWANFTToken');
const RWA = require('../models/RWA');
const { generateMetadata, uploadToJackal } = require('../services/metadataService');
const { executeMint, executeBurn, executeTransfer } = require('../services/blockchainService');

class RWANFTController {
  static async create(req, res) {
    try {
      const { rwa_id, token_identifier, owner_user_id, metadata_uri } = req.body;

      // Verifica se o RWA existe
      const rwa = await RWA.findById(rwa_id);
      if (!rwa) {
        return res.status(404).json({ message: 'RWA não encontrado' });
      }

      // Verifica se o usuário tem permissão para criar tokens para este RWA
      if (req.user.id !== rwa.user_id && !req.user.is_admin) {
        return res.status(403).json({ message: 'Sem permissão para criar tokens para este RWA' });
      }

      const token = await RWANFTToken.create({
        rwa_id,
        token_identifier,
        owner_user_id,
        metadata_uri
      });

      res.status(201).json(token);
    } catch (error) {
      console.error('Erro ao criar token NFT:', error);
      res.status(400).json({ message: 'Erro ao criar token NFT' });
    }
  }

  static async getById(req, res) {
    try {
      const token = await RWANFTToken.getById(req.params.id);
      if (!token) {
        return res.status(404).json({ message: 'Token NFT não encontrado' });
      }
      res.json(token);
    } catch (error) {
      console.error('Erro ao buscar token NFT:', error);
      res.status(500).json({ message: 'Erro ao buscar token NFT' });
    }
  }

  static async getByRWAId(req, res) {
    try {
      const tokens = await RWANFTToken.getByRWAId(req.params.rwa_id);
      res.json(tokens);
    } catch (error) {
      console.error('Erro ao buscar tokens NFT do RWA:', error);
      res.status(500).json({ message: 'Erro ao buscar tokens NFT do RWA' });
    }
  }

  static async getByOwnerId(req, res) {
    try {
      const tokens = await RWANFTToken.getByOwnerId(req.params.user_id);
      res.json(tokens);
    } catch (error) {
      console.error('Erro ao buscar tokens NFT do usuário:', error);
      res.status(500).json({ message: 'Erro ao buscar tokens NFT do usuário' });
    }
  }

  static async update(req, res) {
    try {
      const token = await RWANFTToken.getById(req.params.id);
      if (!token) {
        return res.status(404).json({ message: 'Token NFT não encontrado' });
      }

      // Verifica se o usuário tem permissão para atualizar o token
      const rwa = await RWA.getById(token.rwa_id);
      if (req.user.id !== rwa.owner_id && !req.user.is_admin) {
        return res.status(403).json({ message: 'Sem permissão para atualizar este token' });
      }

      const updatedToken = await RWANFTToken.update(req.params.id, req.body);
      res.json(updatedToken);
    } catch (error) {
      console.error('Erro ao atualizar token NFT:', error);
      res.status(400).json({ message: 'Erro ao atualizar token NFT' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const token = await RWANFTToken.getById(id);
      
      if (!token) {
        return res.status(404).json({ error: 'Token não encontrado' });
      }

      // Verificar se o usuário é o dono do token
      if (token.owner_user_id !== req.user.id && !req.user.is_admin) {
        return res.status(403).json({ error: 'Sem permissão para deletar este token' });
      }

      // Verificar se o RWA existe
      const rwa = await RWA.findById(token.rwa_id);
      if (!rwa) {
        return res.status(404).json({ error: 'RWA não encontrado' });
      }

      await RWANFTToken.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar token NFT:', error);
      res.status(500).json({ error: 'Erro ao deletar token NFT' });
    }
  }

  /**
   * Mint de um novo NFT para um RWA
   * @route POST /api/rwa/nfts/mint
   */
  static async mint(req, res) {
    try {
      const { rwa_id, owner_wallet_address } = req.body;

      // Verifica se o RWA existe
      const rwa = await RWA.findById(rwa_id);
      if (!rwa) {
        return res.status(404).json({ message: 'RWA não encontrado' });
      }

      // Verifica se o usuário tem permissão para mintar
      if (req.user.id !== rwa.user_id && !req.user.is_admin) {
        return res.status(403).json({ message: 'Sem permissão para mintar tokens para este RWA' });
      }

      // Gera metadados e faz upload para Jackal
      const metadata = await generateMetadata(rwa);
      const metadataUri = await uploadToJackal(metadata);

      // Executa mint na blockchain
      const mintResult = await executeMint({
        rwaId: rwa_id,
        ownerAddress: owner_wallet_address,
        metadataUri
      });

      // Cria registro do token no banco
      const token = await RWANFTToken.create({
        rwa_id,
        token_identifier: mintResult.tokenId,
        owner_user_id: req.user.id,
        metadata_uri: metadataUri,
        chain_tx_hash: mintResult.txHash
      });

      res.status(201).json(token);
    } catch (error) {
      console.error('Erro ao mintar token NFT:', error);
      res.status(500).json({ message: 'Erro ao mintar token NFT' });
    }
  }

  /**
   * Burn de um NFT
   * @route POST /api/rwa/nfts/burn
   */
  static async burn(req, res) {
    try {
      const { token_identifier } = req.body;

      // Busca o token
      const token = await RWANFTToken.getByTokenIdentifier(token_identifier);
      if (!token) {
        return res.status(404).json({ message: 'Token NFT não encontrado' });
      }

      // Verifica se o usuário tem permissão para queimar
      const rwa = await RWA.getById(token.rwa_id);
      if (req.user.id !== rwa.owner_id && !req.user.is_admin) {
        return res.status(403).json({ message: 'Sem permissão para queimar este token' });
      }

      // Executa burn na blockchain
      const burnResult = await executeBurn({
        tokenId: token_identifier
      });

      // Atualiza status do token no banco
      await RWANFTToken.update(token.id, {
        status: 'burned',
        chain_tx_hash: burnResult.txHash
      });

      res.json({ message: 'Token queimado com sucesso' });
    } catch (error) {
      console.error('Erro ao queimar token NFT:', error);
      res.status(500).json({ message: 'Erro ao queimar token NFT' });
    }
  }

  /**
   * Transferência direta de um NFT
   * @route POST /api/rwa/nfts/transfer
   */
  static async transfer(req, res) {
    try {
      const { token_identifier, to_wallet_address, tx_hash } = req.body;

      // Busca o token
      const token = await RWANFTToken.getByTokenIdentifier(token_identifier);
      if (!token) {
        return res.status(404).json({ message: 'Token NFT não encontrado' });
      }

      // Verifica se o usuário tem permissão para transferir
      const rwa = await RWA.getById(token.rwa_id);
      if (req.user.id !== rwa.owner_id && !req.user.is_admin) {
        return res.status(403).json({ message: 'Sem permissão para transferir este token' });
      }

      // Executa transferência na blockchain
      const transferResult = await executeTransfer({
        tokenId: token_identifier,
        toAddress: to_wallet_address,
        txHash: tx_hash
      });

      // Atualiza owner do token no banco
      await RWANFTToken.update(token.id, {
        owner_user_id: req.user.id,
        chain_tx_hash: transferResult.txHash
      });

      // Registra no histórico de propriedade
      await RWAOwnershipHistory.create({
        rwa_id: token.rwa_id,
        token_id: token.id,
        from_user_id: req.user.id,
        to_user_id: req.user.id,
        quantity: 1,
        tx_hash: transferResult.txHash
      });

      res.json({ message: 'Token transferido com sucesso' });
    } catch (error) {
      console.error('Erro ao transferir token NFT:', error);
      res.status(500).json({ message: 'Erro ao transferir token NFT' });
    }
  }

  /**
   * Obtém um token NFT pelo identificador do token
   * @route GET /api/rwa/nfts/token/:token_id
   */
  static async getByTokenId(req, res) {
    try {
      const token = await RWANFTToken.getByTokenIdentifier(req.params.token_id);
      if (!token) {
        return res.status(404).json({ message: 'Token NFT não encontrado' });
      }
      res.json(token);
    } catch (error) {
      console.error('Erro ao buscar token NFT:', error);
      res.status(500).json({ message: 'Erro ao buscar token NFT' });
    }
  }
}

module.exports = RWANFTController; 