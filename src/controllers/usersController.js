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

// Enviar documentos para KYC
exports.submitKyc = async (req, res) => {
  try {
    const { nome, cpf } = req.body;
    const address = req.user.address;

    // Validar campos obrigatórios
    if (!nome || !cpf || !req.files) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const { documento_frente, documento_verso, selfie_1, selfie_2 } = req.files;

    // Validar arquivos
    if (!documento_frente || !documento_verso || !selfie_1 || !selfie_2) {
      return res.status(400).json({ message: 'Todos os documentos são obrigatórios' });
    }

    // Verificar se já existe KYC para este usuário
    const existingKyc = await pool.query(
      'SELECT id FROM kyc WHERE user_address = $1',
      [address]
    );

    if (existingKyc.rows.length > 0) {
      return res.status(400).json({ message: 'Usuário já possui KYC enviado' });
    }

    // Salvar documentos e obter CIDs (simulado por enquanto)
    const documento_frente_cid = `cid_doc_frente_${Date.now()}`;
    const documento_verso_cid = `cid_doc_verso_${Date.now()}`;
    const selfie_1_cid = `cid_selfie1_${Date.now()}`;
    const selfie_2_cid = `cid_selfie2_${Date.now()}`;

    // Inserir KYC no banco
    const result = await pool.query(
      `INSERT INTO kyc (
        user_address, nome, cpf,
        documento_frente_cid, documento_verso_cid,
        selfie_1_cid, selfie_2_cid, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [
        address, nome, cpf,
        documento_frente_cid, documento_verso_cid,
        selfie_1_cid, selfie_2_cid, 'pendente'
      ]
    );

    res.json({
      message: 'Documentos enviados com sucesso',
      kyc_id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao enviar documentos KYC:', error);
    res.status(500).json({ message: 'Erro ao enviar documentos KYC' });
  }
};

// Obter status do KYC
exports.getKyc = async (req, res) => {
  try {
    const address = req.user.address;

    const result = await pool.query(
      `SELECT id, nome, cpf, status, created_at
       FROM kyc WHERE user_address = $1`,
      [address]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'KYC não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar status do KYC:', error);
    res.status(500).json({ message: 'Erro ao buscar status do KYC' });
  }
}; 