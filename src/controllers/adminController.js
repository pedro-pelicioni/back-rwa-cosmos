/**
 * Controlador para funções administrativas
 */
const { pool } = require('../database/connection');

// Listar todos os KYCs
exports.listKyc = async (req, res) => {
  try {
    // Opcionalmente, filtrar por status
    const { status } = req.query;
    
    let query = 'SELECT k.*, u.address FROM kyc k JOIN users u ON k.user_address = u.address';
    let params = [];
    
    if (status) {
      query += ' WHERE k.status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY k.created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar KYCs:', error);
    res.status(500).json({ message: 'Erro ao buscar lista de KYCs' });
  }
};

// Atualizar status de um KYC
exports.updateKycStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validar status
    if (!['pendente', 'aprovado', 'rejeitado'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status inválido. Use: pendente, aprovado ou rejeitado' 
      });
    }
    
    // Verificar se o KYC existe
    const kycCheck = await pool.query(
      'SELECT * FROM kyc WHERE id = $1',
      [id]
    );
    
    if (kycCheck.rows.length === 0) {
      return res.status(404).json({ message: 'KYC não encontrado' });
    }
    
    // Atualizar status
    const result = await pool.query(
      'UPDATE kyc SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    
    res.json({
      message: `Status do KYC atualizado para ${status}`,
      kyc: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar status de KYC:', error);
    res.status(500).json({ message: 'Erro ao atualizar status de KYC' });
  }
}; 