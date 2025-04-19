/**
 * Controlador de autenticação via wallet
 */
const { pool } = require('../database/connection');

// Login via wallet
exports.walletLogin = async (req, res) => {
  try {
    const { address } = req.body;
    
    if (!address) {
      return res.status(400).json({ message: 'Endereço da carteira é obrigatório' });
    }
    
    // Validar formato do endereço (básico)
    if (!address.startsWith('neutron1')) {
      return res.status(400).json({ message: 'Endereço de carteira inválido' });
    }
    
    // Verificar se o usuário existe
    let result = await pool.query(
      'SELECT * FROM users WHERE address = $1',
      [address]
    );
    
    // Se não existir, criar um novo usuário
    if (result.rows.length === 0) {
      // Gerar um nome padrão baseado no endereço da carteira
      const name = `User ${address.substring(0, 8)}`;
      
      result = await pool.query(
        'INSERT INTO users (address, name, role) VALUES ($1, $2, $3) RETURNING *',
        [address, name, 'user']
      );
    }
    
    const user = result.rows[0];
    
    res.json({
      user: {
        id: user.id,
        name: user.name,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login via wallet:', error);
    res.status(500).json({ message: 'Erro no processamento do login' });
  }
}; 