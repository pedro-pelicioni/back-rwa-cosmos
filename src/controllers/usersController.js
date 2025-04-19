/**
 * Controlador para operações com usuários
 */
const { pool } = require('../database/connection');

// Obter dados do usuário atualmente logado
exports.getMe = async (req, res) => {
  try {
    const address = req.user.address;
    
    // Buscar informações do usuário
    const userResult = await pool.query(
      'SELECT id, address, role, created_at FROM users WHERE address = $1',
      [address]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const user = userResult.rows[0];
    
    // Verificar se possui KYC
    const kycResult = await pool.query(
      'SELECT id, nome, status, created_at FROM kyc WHERE user_address = $1',
      [address]
    );
    
    // Adicionar informações de KYC se existir
    if (kycResult.rows.length > 0) {
      user.kyc = kycResult.rows[0];
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do usuário' });
  }
}; 