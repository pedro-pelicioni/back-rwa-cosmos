const RWATokenSale = require('../models/RWATokenSale');
const RWANFTToken = require('../models/RWANFTToken');
const RWA = require('../models/RWA');
const db = require('../database/knex');

class RWATokenSaleController {
  // Iniciar venda de token
  async initiate(req, res) {
    const { rwa_id, quantity, price_per_token } = req.body;
    const buyer_id = req.user.id;

    try {
      // Validar campos obrigatórios
      if (!rwa_id) {
        return res.status(400).json({ error: 'rwa_id é obrigatório' });
      }

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'quantity deve ser maior que zero' });
      }

      if (!price_per_token || price_per_token <= 0) {
        return res.status(400).json({ error: 'price_per_token deve ser maior que zero' });
      }

      console.log('=== INÍCIO DA VENDA DE TOKENS ===');
      console.log('RWA ID:', rwa_id);
      console.log('Quantidade:', quantity);
      console.log('Preço por token:', price_per_token);
      console.log('Comprador:', buyer_id);

      // Buscar os tokens disponíveis do RWA
      const tokens = await RWANFTToken.query()
        .where('rwa_id', rwa_id)
        .where('owner_user_id', '!=', buyer_id)
        .limit(quantity);

      if (tokens.length < quantity) {
        return res.status(400).json({ 
          error: 'Quantidade de tokens disponível insuficiente' 
        });
      }

      // Iniciar transação
      const trx = await db.transaction();

      try {
        // Transferir cada token para o comprador
        for (const token of tokens) {
          // Atualizar o dono do token
          await RWANFTToken.query(trx)
            .patchAndFetchById(token.id, {
              owner_user_id: buyer_id
            });

          // Registrar a transação
          await trx('rwa_token_transactions').insert({
            token_id: token.id,
            from_user_id: token.owner_user_id,
            to_user_id: buyer_id,
            transaction_type: 'sale',
            price_per_token: price_per_token,
            created_at: new Date()
          });
        }

        // Criar registro da venda
        const sale = await RWATokenSale.query(trx).insert({
          rwa_id,
          seller_id: tokens[0].owner_user_id, // Vendedor é o dono original dos tokens
          buyer_id,
          quantity,
          price_per_token,
          total_price: quantity * price_per_token,
          status: 'completed',
          transaction_hash: null,
          signature: null,
          created_at: new Date()
        });

        await trx.commit();

        console.log('=== VENDA CONCLUÍDA COM SUCESSO ===');
        console.log('Venda:', sale);
        console.log('Tokens transferidos:', tokens.length);

        return res.status(201).json({
          sale,
          tokens: tokens.map(t => t.id)
        });

      } catch (error) {
        await trx.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Erro ao processar venda:', error);
      return res.status(500).json({ error: 'Erro ao processar venda' });
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