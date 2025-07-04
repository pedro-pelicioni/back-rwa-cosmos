/**
 * Controlador para gerenciamento de KYC
 */
const { pool } = require('../database/connection');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simulação de upload para IPFS (em produção, usaria um serviço real)
const simulateIpfsUpload = (file) => {
  // Em produção, este método faria upload para IPFS
  // e retornaria o CID real
  return 'ipfs://' + crypto.randomBytes(32).toString('hex');
};

// Enviar KYC
exports.submitKyc = async (req, res) => {
  try {
    const { nome, cpf } = req.body;
    const walletAddress = req.user.address;
    
    // Verificar se já existe KYC para este usuário
    const existingKyc = await pool.query(
      'SELECT * FROM kyc WHERE wallet_address = $1',
      [walletAddress]
    );
    
    if (existingKyc.rows.length > 0) {
      return res.status(400).json({ 
        error: 'KYC already sent. Current status: ' + existingKyc.rows[0].status 
      });
    }
    
    // Validações básicas
    if (!nome || !cpf) {
      return res.status(400).json({ error: 'Nome and CPF are required' });
    }
    
    // Verificar se arquivos foram enviados
    if (!req.files || 
        !req.files.documento_frente || 
        !req.files.documento_verso || 
        !req.files.selfie_1 || 
        !req.files.selfie_2) {
      return res.status(400).json({ 
        error: 'All documents are required: front and back of the document and two selfies' 
      });
    }
    
    // Simular upload para IPFS
    const documento_frente_cid = simulateIpfsUpload(req.files.documento_frente);
    const documento_verso_cid = simulateIpfsUpload(req.files.documento_verso);
    const selfie_1_cid = simulateIpfsUpload(req.files.selfie_1);
    const selfie_2_cid = simulateIpfsUpload(req.files.selfie_2);
    
    // Salvar no banco de dados
    const result = await pool.query(
      `INSERT INTO kyc 
        (wallet_address, nome, cpf, documento_frente_cid, documento_verso_cid, selfie_1_cid, selfie_2_cid, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [walletAddress, nome, cpf, documento_frente_cid, documento_verso_cid, selfie_1_cid, selfie_2_cid, 'pending']
    );
    
    res.status(201).json({
      message: 'KYC sent successfully',
      kyc: result.rows[0]
    });
  } catch (error) {
    console.error('Error sending KYC:', error);
    res.status(500).json({ error: 'Error processing KYC submission' });
  }
};

// Obter KYC do usuário
exports.getKyc = async (req, res) => {
  try {
    const walletAddress = req.user.address;
    
    const result = await pool.query(
      'SELECT * FROM kyc WHERE wallet_address = $1',
      [walletAddress]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'KYC not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error searching KYC:', error);
    res.status(500).json({ error: 'Error searching KYC information' });
  }
};

// Obter KYC por ID do usuário
exports.getKycByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Primeiro, buscar o endereço da wallet do usuário
    const userResult = await pool.query(
      'SELECT wallet_address FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const walletAddress = userResult.rows[0].wallet_address;
    
    // Buscar o KYC usando o endereço da wallet
    const kycResult = await pool.query(
      'SELECT * FROM kyc WHERE wallet_address = $1',
      [walletAddress]
    );
    
    if (kycResult.rows.length === 0) {
      return res.status(404).json({ error: 'KYC not found for this user' });
    }
    
    res.json(kycResult.rows[0]);
  } catch (error) {
    console.error('Error searching KYC by user ID:', error);
    res.status(500).json({ error: 'Error searching KYC information' });
  }
}; 