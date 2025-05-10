const RWANFTToken = require('../models/RWANFTToken');
const RWA = require('../models/RWA');

class RWANFTController {
  static async create(req, res) {
    try {
      const { rwa_id, token_identifier, owner_user_id, metadata_uri } = req.body;

      // Verifica se o RWA existe
      const rwa = await RWA.getById(rwa_id);
      if (!rwa) {
        return res.status(404).json({ message: 'RWA não encontrado' });
      }

      // Verifica se o usuário tem permissão para criar tokens para este RWA
      if (req.user.id !== rwa.owner_id && !req.user.is_admin) {
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
      const token = await RWANFTToken.getById(req.params.id);
      if (!token) {
        return res.status(404).json({ message: 'Token NFT não encontrado' });
      }

      // Verifica se o usuário tem permissão para deletar o token
      const rwa = await RWA.getById(token.rwa_id);
      if (req.user.id !== rwa.owner_id && !req.user.is_admin) {
        return res.status(403).json({ message: 'Sem permissão para deletar este token' });
      }

      await RWANFTToken.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar token NFT:', error);
      res.status(500).json({ message: 'Erro ao deletar token NFT' });
    }
  }
}

module.exports = RWANFTController; 