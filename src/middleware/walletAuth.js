/**
 * Middleware para autenticação via wallet
 * Verifica o cabeçalho x-wallet-address e injeta usuário na requisição
 */
const { pool } = require('../database/connection');

const walletAuth = async (req, res, next) => {
  try {
    const walletAddress = req.headers['x-wallet-address'];
    
    if (!walletAddress) {
      return res.status(401).json({ 
        message: 'Autenticação necessária. Forneça o cabeçalho x-wallet-address' 
      });
    }
    
    // Validar formato do endereço (básico)
    if (!walletAddress.startsWith('neutron1')) {
      return res.status(401).json({ 
        message: 'Endereço de carteira inválido' 
      });
    }
    
    // Verificar se o usuário existe no banco
    const result = await pool.query(
      'SELECT * FROM users WHERE wallet_address = $1',
      [walletAddress]
    );
    
    if (result.rows.length === 0) {
      // Se não existir, cria um novo usuário (auto-registro)
      // Gerar um email padrão baseado no endereço da carteira
      const email = `${walletAddress.substring(0, 8)}@rwa.com`;
      
      const newUserResult = await pool.query(
        'INSERT INTO users (wallet_address, email) VALUES ($1, $2) RETURNING *',
        [walletAddress, email]
      );
      
      req.user = newUserResult.rows[0];
    } else {
      req.user = result.rows[0];
    }
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ message: 'Erro na autenticação' });
  }
};

module.exports = walletAuth; 