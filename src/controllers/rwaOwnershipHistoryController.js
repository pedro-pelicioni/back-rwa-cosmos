const RWAOwnershipHistory = require('../models/RWAOwnershipHistory');
const RWA = require('../models/RWA');
const RWANFTToken = require('../models/RWANFTToken');

class RWAOwnershipHistoryController {
  static async create(req, res) {
    try {
      const { rwa_id, token_id, from_user_id, to_user_id, quantity, tx_hash } = req.body;

      // Verifica se o RWA existe
      const rwa = await RWA.getById(rwa_id);
      if (!rwa) {
        return res.status(404).json({ message: 'RWA não encontrado' });
      }

      // Verifica se o token existe (se fornecido)
      if (token_id) {
        const token = await RWANFTToken.getById(token_id);
        if (!token) {
          return res.status(404).json({ message: 'Token NFT não encontrado' });
        }
      }

      // Verifica se o usuário tem permissão para registrar a transferência
      if (req.user.id !== rwa.owner_id && !req.user.is_admin) {
        return res.status(403).json({ message: 'Sem permissão para registrar transferência para este RWA' });
      }

      const history = await RWAOwnershipHistory.create({
        rwa_id,
        token_id,
        from_user_id,
        to_user_id,
        quantity,
        tx_hash
      });

      res.status(201).json(history);
    } catch (error) {
      console.error('Erro ao registrar transferência:', error);
      res.status(400).json({ message: 'Erro ao registrar transferência' });
    }
  }

  static async getById(req, res) {
    try {
      const history = await RWAOwnershipHistory.getById(req.params.id);
      if (!history) {
        return res.status(404).json({ message: 'Registro de transferência não encontrado' });
      }
      res.json(history);
    } catch (error) {
      console.error('Erro ao buscar registro de transferência:', error);
      res.status(500).json({ message: 'Erro ao buscar registro de transferência' });
    }
  }

  static async getByRWAId(req, res) {
    try {
      const history = await RWAOwnershipHistory.getByRWAId(req.params.rwa_id);
      res.json(history);
    } catch (error) {
      console.error('Erro ao buscar histórico do RWA:', error);
      res.status(500).json({ message: 'Erro ao buscar histórico do RWA' });
    }
  }

  static async getByTokenId(req, res) {
    try {
      const history = await RWAOwnershipHistory.getByTokenId(req.params.token_id);
      res.json(history);
    } catch (error) {
      console.error('Erro ao buscar histórico do token:', error);
      res.status(500).json({ message: 'Erro ao buscar histórico do token' });
    }
  }

  static async getByUserId(req, res) {
    try {
      const { type } = req.query;
      const history = await RWAOwnershipHistory.getByUserId(req.params.user_id, type);
      res.json(history);
    } catch (error) {
      console.error('Erro ao buscar histórico do usuário:', error);
      res.status(500).json({ message: 'Erro ao buscar histórico do usuário' });
    }
  }

  static async update(req, res) {
    try {
      const history = await RWAOwnershipHistory.getById(req.params.id);
      if (!history) {
        return res.status(404).json({ message: 'Registro de transferência não encontrado' });
      }

      // Verifica se o usuário tem permissão para atualizar o registro
      const rwa = await RWA.getById(history.rwa_id);
      if (req.user.id !== rwa.owner_id && !req.user.is_admin) {
        return res.status(403).json({ message: 'Sem permissão para atualizar este registro' });
      }

      const updatedHistory = await RWAOwnershipHistory.update(req.params.id, req.body);
      res.json(updatedHistory);
    } catch (error) {
      console.error('Erro ao atualizar registro de transferência:', error);
      res.status(400).json({ message: 'Erro ao atualizar registro de transferência' });
    }
  }

  static async delete(req, res) {
    try {
      const history = await RWAOwnershipHistory.getById(req.params.id);
      if (!history) {
        return res.status(404).json({ message: 'Registro de transferência não encontrado' });
      }

      // Verifica se o usuário tem permissão para deletar o registro
      const rwa = await RWA.getById(history.rwa_id);
      if (req.user.id !== rwa.owner_id && !req.user.is_admin) {
        return res.status(403).json({ message: 'Sem permissão para deletar este registro' });
      }

      await RWAOwnershipHistory.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar registro de transferência:', error);
      res.status(500).json({ message: 'Erro ao deletar registro de transferência' });
    }
  }
}

module.exports = RWAOwnershipHistoryController; 