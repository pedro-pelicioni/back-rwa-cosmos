const RWATokenSale = require('../models/RWATokenSale');
const RWANFTToken = require('../models/RWANFTToken');
const RWA = require('../models/RWA');

class RWATokenSaleController {
  // Iniciar venda de token
  async initiate(req, res) {
    const { token_id, quantity, price_per_token } = req.body;
    const seller_id = req.user.id;

    try {
      // Verificar se o token existe e pertence ao vendedor
      const token = await RWANFTToken.query()
        .where('id', token_id)
        .where('owner_user_id', seller_id)
        .first();

      if (!token) {
        return res.status(403).json({ error: 'Token não encontrado ou não pertence ao usuário' });
      }

      // Calcular preço total
      const total_price = quantity * price_per_token;

      // Criar a venda
      const sale = await RWATokenSale.query().insert({
        token_id,
        seller_id,
        quantity,
        price_per_token,
        total_price,
        status: 'pending',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
      });

      return res.status(201).json(sale);
    } catch (error) {
      console.error('Erro ao iniciar venda:', error);
      return res.status(500).json({ error: 'Erro ao iniciar venda' });
    }
  }

  // Confirmar venda
  async confirm(req, res) {
    const { sale_id, tx_hash, signature } = req.body;
    const buyer_id = req.user.id;

    try {
      const sale = await RWATokenSale.query()
        .where('id', sale_id)
        .where('status', 'pending')
        .first();

      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada ou não está pendente' });
      }

      // Atualizar a venda
      await sale.$query().patch({
        buyer_id,
        transaction_hash: tx_hash,
        signature,
        status: 'completed'
      });

      // Atualizar o dono do token
      await RWANFTToken.query()
        .where('id', sale.token_id)
        .patch({
          owner_user_id: buyer_id
        });

      return res.json({ message: 'Venda confirmada com sucesso' });
    } catch (error) {
      console.error('Erro ao confirmar venda:', error);
      return res.status(500).json({ error: 'Erro ao confirmar venda' });
    }
  }

  // Cancelar venda
  async cancel(req, res) {
    const { sale_id } = req.params;
    const user_id = req.user.id;

    try {
      const sale = await RWATokenSale.query()
        .where('id', sale_id)
        .where('status', 'pending')
        .first();

      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada ou não está pendente' });
      }

      if (sale.seller_id !== user_id) {
        return res.status(403).json({ error: 'Apenas o vendedor pode cancelar a venda' });
      }

      await sale.$query().patch({
        status: 'cancelled'
      });

      return res.json({ message: 'Venda cancelada com sucesso' });
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      return res.status(500).json({ error: 'Erro ao cancelar venda' });
    }
  }

  // Obter venda por ID
  async getSaleDetails(req, res) {
    const { sale_id } = req.params;

    try {
      const sale = await RWATokenSale.query()
        .where('id', sale_id)
        .withGraphFetched('[token, seller, buyer]')
        .first();

      if (!sale) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      return res.json(sale);
    } catch (error) {
      console.error('Erro ao obter detalhes da venda:', error);
      return res.status(500).json({ error: 'Erro ao obter detalhes da venda' });
    }
  }

  // Obter vendas por token
  async getByTokenId(req, res) {
    try {
      const userId = req.user.id;
      const sales = await RWATokenSale.query()
        .where('token_id', req.params.token_id)
        .withGraphFetched('[token, seller, buyer]')
        .orderBy('created_at', 'desc');
      
      // Filtrar apenas vendas de tokens que não pertencem ao usuário atual
      const filteredSales = sales.filter(sale => sale.seller_id !== userId);
      
      return res.json(filteredSales);
    } catch (error) {
      console.error('Erro ao buscar vendas do token:', error);
      return res.status(500).json({ error: 'Erro ao buscar vendas do token' });
    }
  }

  // Obter vendas por vendedor
  async getBySellerId(req, res) {
    try {
      const userId = req.user.id;
      const sales = await RWATokenSale.query()
        .where('seller_id', req.params.seller_id)
        .withGraphFetched('[token, seller, buyer]')
        .orderBy('created_at', 'desc');
      
      // Filtrar apenas vendas de tokens que não pertencem ao usuário atual
      const filteredSales = sales.filter(sale => sale.seller_id !== userId);
      
      return res.json(filteredSales);
    } catch (error) {
      console.error('Erro ao buscar vendas do vendedor:', error);
      return res.status(500).json({ error: 'Erro ao buscar vendas do vendedor' });
    }
  }

  // Obter vendas por comprador
  async getByBuyerId(req, res) {
    try {
      const userId = req.user.id;
      const sales = await RWATokenSale.query()
        .where('buyer_id', req.params.buyer_id)
        .withGraphFetched('[token, seller, buyer]')
        .orderBy('created_at', 'desc');
      
      // Filtrar apenas vendas de tokens que não pertencem ao usuário atual
      const filteredSales = sales.filter(sale => sale.seller_id !== userId);
      
      return res.json(filteredSales);
    } catch (error) {
      console.error('Erro ao buscar compras do comprador:', error);
      return res.status(500).json({ error: 'Erro ao buscar compras do comprador' });
    }
  }

  // Obter vendas disponíveis
  async getAvailableSales(req, res) {
    try {
      const sales = await RWATokenSale.query()
        .where('status', 'pending')
        .withGraphFetched('[token, seller]')
        .orderBy('created_at', 'desc');
      
      return res.json(sales);
    } catch (error) {
      console.error('Erro ao buscar vendas disponíveis:', error);
      return res.status(500).json({ error: 'Erro ao buscar vendas disponíveis' });
    }
  }
}

module.exports = new RWATokenSaleController(); 