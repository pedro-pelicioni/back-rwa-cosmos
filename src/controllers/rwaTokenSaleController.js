const RWATokenSale = require('../models/RWATokenSale');
const RWANFTToken = require('../models/RWANFTToken');
const RWA = require('../models/RWA');

class RWATokenSaleController {
  // Iniciar venda de token
  static async initiate(req, res) {
    try {
      const { token_id, quantity, price_per_token } = req.body;
      const buyerId = req.user.id;

      // Verificar se o token existe
      const token = await RWANFTToken.getById(token_id);
      if (!token) {
        return res.status(404).json({ error: 'Token não encontrado' });
      }

      // Verificar se o usuário NÃO é o dono do token
      if (token.owner_user_id === buyerId) {
        return res.status(403).json({ error: 'Você não pode iniciar uma venda do seu próprio token' });
      }

      // Verificar se o RWA existe
      const rwa = await RWA.findById(token.rwa_id);
      if (!rwa) {
        return res.status(404).json({ error: 'RWA não encontrado' });
      }

      // Verificar se já existe uma venda pendente para este token
      const existingSales = await RWATokenSale.getByTokenId(token_id);
      const pendingSale = existingSales.find(sale => sale.status === 'pending');
      if (pendingSale) {
        return res.status(400).json({ 
          error: 'Este token já está à venda',
          sale_id: pendingSale.id,
          price: pendingSale.price_per_token
        });
      }

      // Verificar se a quantidade é válida
      if (quantity > token.quantity) {
        return res.status(400).json({ error: 'Quantidade excede o disponível' });
      }

      // Criar a venda
      const sale = await RWATokenSale.initiate({
        token_id,
        seller_id: token.owner_user_id,
        quantity,
        price_per_token
      });

      res.status(201).json(sale);
    } catch (error) {
      console.error('Erro ao iniciar venda:', error);
      res.status(500).json({ error: 'Erro ao iniciar venda' });
    }
  }

  // Confirmar venda
  static async confirm(req, res) {
    try {
      const { sale_id, transaction_hash, signature } = req.body;
      const buyerId = req.user.id;

      // Verificar se a venda existe
      const sale = await RWATokenSale.getById(sale_id);
      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      // Verificar se a venda está pendente
      if (sale.status !== 'pending') {
        return res.status(400).json({ error: 'Esta venda não está mais disponível' });
      }

      // Verificar se o comprador não é o vendedor
      if (sale.seller_id === buyerId) {
        return res.status(400).json({ error: 'Você não pode comprar seu próprio token' });
      }

      // Confirmar a venda
      const confirmedSale = await RWATokenSale.confirm(sale_id, buyerId, transaction_hash, signature);
      
      // Atualizar o dono do token mantendo os valores existentes
      const token = await RWANFTToken.getById(sale.token_id);
      await RWANFTToken.update(sale.token_id, {
        token_identifier: token.token_identifier,
        owner_user_id: buyerId,
        metadata_uri: token.metadata_uri
      });

      res.json(confirmedSale);
    } catch (error) {
      console.error('Erro ao confirmar venda:', error);
      res.status(500).json({ error: 'Erro ao confirmar venda' });
    }
  }

  // Cancelar venda
  static async cancel(req, res) {
    try {
      const { sale_id } = req.params;
      const userId = req.user.id;

      // Verificar se a venda existe
      const sale = await RWATokenSale.getById(sale_id);
      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      // Verificar se o usuário é o vendedor
      if (sale.seller_id !== userId && !req.user.is_admin) {
        return res.status(403).json({ error: 'Você não tem permissão para cancelar esta venda' });
      }

      // Verificar se a venda está pendente
      if (sale.status !== 'pending') {
        return res.status(400).json({ error: 'Esta venda não pode ser cancelada' });
      }

      // Cancelar a venda
      const cancelledSale = await RWATokenSale.cancel(sale_id);
      res.json(cancelledSale);
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      res.status(500).json({ error: 'Erro ao cancelar venda' });
    }
  }

  // Obter venda por ID
  static async getById(req, res) {
    try {
      const sale = await RWATokenSale.getById(req.params.id);
      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }
      res.json(sale);
    } catch (error) {
      console.error('Erro ao buscar venda:', error);
      res.status(500).json({ error: 'Erro ao buscar venda' });
    }
  }

  static async getByTokenId(req, res) {
    try {
      const userId = req.user.id;
      const sales = await RWATokenSale.getByTokenId(req.params.token_id);
      
      // Filtrar apenas vendas de tokens que não pertencem ao usuário atual
      const filteredSales = sales.filter(sale => sale.seller_id !== userId);
      
      res.json(filteredSales);
    } catch (error) {
      console.error('Erro ao buscar vendas do token:', error);
      res.status(500).json({ error: 'Erro ao buscar vendas do token' });
    }
  }

  static async getBySellerId(req, res) {
    try {
      const userId = req.user.id;
      const sales = await RWATokenSale.getBySellerId(req.params.seller_id);
      
      // Filtrar apenas vendas de tokens que não pertencem ao usuário atual
      const filteredSales = sales.filter(sale => sale.seller_id !== userId);
      
      res.json(filteredSales);
    } catch (error) {
      console.error('Erro ao buscar vendas do vendedor:', error);
      res.status(500).json({ error: 'Erro ao buscar vendas do vendedor' });
    }
  }

  static async getByBuyerId(req, res) {
    try {
      const userId = req.user.id;
      const sales = await RWATokenSale.getByBuyerId(req.params.buyer_id);
      
      // Filtrar apenas vendas de tokens que não pertencem ao usuário atual
      const filteredSales = sales.filter(sale => sale.seller_id !== userId);
      
      res.json(filteredSales);
    } catch (error) {
      console.error('Erro ao buscar compras do comprador:', error);
      res.status(500).json({ error: 'Erro ao buscar compras do comprador' });
    }
  }

  static async getAvailableSales(req, res) {
    try {
      const userId = req.user.id;
      const sales = await RWATokenSale.getAvailableSales(userId);
      res.json(sales);
    } catch (error) {
      console.error('Erro ao buscar vendas disponíveis:', error);
      res.status(500).json({ error: 'Erro ao buscar vendas disponíveis' });
    }
  }
}

module.exports = RWATokenSaleController; 