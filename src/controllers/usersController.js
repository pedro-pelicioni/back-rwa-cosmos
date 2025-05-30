/**
 * Controlador para operações com usuários
 */
const { pool } = require('../database/connection');

// Obter dados do usuário atualmente logado
exports.getMe = async (req, res) => {
  try {
    const walletAddress = req.user.address;
    
    // Buscar informações do usuário
    const userResult = await pool.query(
      'SELECT id, email, wallet_address, created_at FROM users WHERE wallet_address = $1',
      [walletAddress]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const user = userResult.rows[0];
    
    // Verificar se possui KYC
    const kycResult = await pool.query(
      'SELECT id, nome, status, created_at FROM kyc WHERE wallet_address = $1',
      [walletAddress]
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

// Enviar dados básicos para KYC (etapa 1)
exports.submitKycBasic = async (req, res) => {
  try {
    const { nome, cpf } = req.body;
    const walletAddress = req.user.address;

    // Validar campos obrigatórios
    if (!nome || !cpf) {
      return res.status(400).json({ message: 'Nome e CPF são obrigatórios' });
    }

    // Verificar se já existe KYC para este usuário
    const existingKyc = await pool.query(
      'SELECT id, status FROM kyc WHERE wallet_address = $1',
      [walletAddress]
    );

    if (existingKyc.rows.length > 0) {
      const kyc = existingKyc.rows[0];
      
      // Se já tem documentos enviados, retorna erro
      if (kyc.documento_frente_cid) {
        return res.status(400).json({ 
          message: 'KYC já iniciado. Por favor, envie os documentos.',
          kyc_id: kyc.id
        });
      }
      
      // Se só tem dados básicos, atualiza
      const result = await pool.query(
        `UPDATE kyc 
         SET nome = $1, cpf = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3
         RETURNING id`,
        [nome, cpf, kyc.id]
      );
      
      return res.json({
        message: 'Dados básicos atualizados com sucesso',
        kyc_id: result.rows[0].id
      });
    }

    // Criar novo registro de KYC com dados básicos
    const result = await pool.query(
      `INSERT INTO kyc (
        wallet_address, nome, cpf, status
      ) VALUES ($1, $2, $3, $4) RETURNING id`,
      [walletAddress, nome, cpf, 'pendente']
    );

    res.status(201).json({
      message: 'Dados básicos enviados com sucesso',
      kyc_id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao enviar dados básicos do KYC:', error);
    res.status(500).json({ message: 'Erro ao enviar dados básicos do KYC' });
  }
};

// Enviar documentos para KYC (etapa 2)
exports.submitKycDocuments = async (req, res) => {
  try {
    const walletAddress = req.user.address;

    // Verificar se arquivos foram enviados
    if (!req.files || 
        !req.files.documento_frente || 
        !req.files.documento_verso || 
        !req.files.selfie_1 || 
        !req.files.selfie_2) {
      return res.status(400).json({ 
        message: 'Todos os documentos são obrigatórios: frente e verso do documento e duas selfies' 
      });
    }

    // Verificar se já existe KYC para este usuário
    const existingKyc = await pool.query(
      'SELECT id FROM kyc WHERE wallet_address = $1',
      [walletAddress]
    );

    if (existingKyc.rows.length === 0) {
      return res.status(400).json({ 
        message: 'Por favor, envie primeiro os dados básicos (nome e CPF)' 
      });
    }

    const kycId = existingKyc.rows[0].id;

    // Simular upload para IPFS (em produção, implementar upload real)
    const documento_frente_cid = `cid_doc_frente_${Date.now()}`;
    const documento_verso_cid = `cid_doc_verso_${Date.now()}`;
    const selfie_1_cid = `cid_selfie1_${Date.now()}`;
    const selfie_2_cid = `cid_selfie2_${Date.now()}`;

    // Atualizar KYC com os documentos
    const result = await pool.query(
      `UPDATE kyc SET
        documento_frente_cid = $1,
        documento_verso_cid = $2,
        selfie_1_cid = $3,
        selfie_2_cid = $4,
        status = 'pendente',
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING id`,
      [
        documento_frente_cid,
        documento_verso_cid,
        selfie_1_cid,
        selfie_2_cid,
        kycId
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
    const walletAddress = req.user.address;

    const result = await pool.query(
      `SELECT id, nome, cpf, status, created_at,
              documento_frente_cid, documento_verso_cid,
              selfie_1_cid, selfie_2_cid
       FROM kyc WHERE wallet_address = $1`,
      [walletAddress]
    );

    if (result.rows.length === 0) {
      return res.json({
        status: 'nao_iniciado',
        etapa: 'dados_basicos'
      });
    }

    const kyc = result.rows[0];
    
    // Determinar a etapa atual do KYC
    if (!kyc.documento_frente_cid) {
      kyc.etapa = 'dados_basicos';
    } else {
      kyc.etapa = 'documentos';
    }

    res.json(kyc);
  } catch (error) {
    console.error('Erro ao buscar status do KYC:', error);
    res.status(500).json({ message: 'Erro ao buscar status do KYC' });
  }
}; 