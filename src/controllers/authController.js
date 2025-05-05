/**
 * Controlador de autenticação via wallet
 */
const { pool } = require('../database/connection');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { verifyADR36Amino } = require('@cosmjs/amino');

// Gerar nonce para um endereço
exports.generateNonce = async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ message: 'Endereço da carteira é obrigatório' });
    }
    
    // Validar formato do endereço (básico)
    const bech32Regex = /^[a-z0-9]{2,}1[0-9a-z]{10,}$/;
    if (!bech32Regex.test(address)) {
      return res.status(400).json({ message: 'Endereço de carteira inválido' });
    }
    
    // Gerar nonce aleatório
    const nonce = crypto.randomBytes(32).toString('hex');
    
    // Salvar nonce no banco
    await pool.query(
      'INSERT INTO wallet_nonces (address, nonce) VALUES ($1, $2) ON CONFLICT (address) DO UPDATE SET nonce = $2, created_at = CURRENT_TIMESTAMP',
      [address, nonce]
    );
    
    res.json({ nonce });
  } catch (error) {
    console.error('Erro ao gerar nonce:', error);
    res.status(500).json({ message: 'Erro ao gerar nonce' });
  }
};

// Login via wallet com assinatura
exports.walletLogin = async (req, res) => {
  try {
    const { address, signature, nonce } = req.body;
    
    if (!address || !signature || !nonce) {
      return res.status(400).json({ message: 'Endereço, assinatura e nonce são obrigatórios' });
    }
    
    // Buscar nonce no banco
    const nonceResult = await pool.query(
      'SELECT nonce FROM wallet_nonces WHERE address = $1',
      [address]
    );
    
    if (nonceResult.rows.length === 0) {
      return res.status(400).json({ message: 'Nonce não encontrado ou expirado' });
    }
    
    const storedNonce = nonceResult.rows[0].nonce;
    
    if (nonce !== storedNonce) {
      return res.status(400).json({ message: 'Nonce inválido' });
    }
    
    // Validar assinatura
    try {
      const isValid = verifyADR36Amino(
        address,
        nonce,
        signature
      );
      
      if (!isValid) {
        return res.status(401).json({ message: 'Assinatura inválida' });
      }
    } catch (error) {
      console.error('Erro ao validar assinatura:', error);
      return res.status(401).json({ message: 'Erro ao validar assinatura' });
    }
    
    // Remover nonce usado
    await pool.query(
      'DELETE FROM wallet_nonces WHERE address = $1',
      [address]
    );
    
    // Verificar se o usuário existe
    let result = await pool.query(
      'SELECT * FROM users WHERE address = $1',
      [address]
    );
    
    // Se não existir, criar um novo usuário
    if (result.rows.length === 0) {
      const name = `User ${address.substring(0, 8)}`;
      
      result = await pool.query(
        'INSERT INTO users (address, name, role) VALUES ($1, $2, $3) RETURNING *',
        [address, name, 'user']
      );
    }
    
    const user = result.rows[0];
    
    // Gerar token JWT
    const token = jwt.sign(
      { 
        address: user.address,
        role: user.role,
        id: user.id
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    
    res.json({
      token,
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