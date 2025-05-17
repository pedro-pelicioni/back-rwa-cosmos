require('dotenv').config();

/**
 * Controlador de autenticação via wallet
 */
const { pool } = require('../database/connection');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { serializeSignDoc, StdSignDoc } = require('@cosmjs/amino');
const { fromBase64, fromBech32, toBase64 } = require('@cosmjs/encoding');
const { sha256, ripemd160, Secp256k1, Secp256k1Signature, Secp256k1Pubkey } = require('@cosmjs/crypto');

/**
 * Converte um pubkey secp256k1 para um endereço Cosmos
 * Implementação manual do algoritmo RIPEMD160(SHA256(pubkey))
 */
function pubkeyToAddress(pubkey) {
  // Hash SHA256 seguido de RIPEMD160 (padrão Cosmos)
  const hash = ripemd160(sha256(pubkey));
  return hash;
}

// Função para verificar assinaturas no formato ADR-36
async function verifyADR36Signature(signerAddress, data, signature) {
  try {
    console.log('--- [Verificação de Assinatura] ---');
    console.log('Signer address:', signerAddress);
    console.log('Nonce recebido:', data);
    
    // Decodificar assinatura e pubkey
    let decodedSignature = Buffer.from(signature.signature, 'base64');
    const decodedPubkey = Buffer.from(signature.pub_key.value, 'base64');
    console.log('Assinatura recebida (base64):', signature.signature);
    console.log('Assinatura decodificada (tamanho):', decodedSignature.length);
    console.log('Assinatura decodificada (hex):', decodedSignature.toString('hex'));
    console.log('Chave pública recebida (base64):', signature.pub_key.value);
    console.log('Chave pública decodificada (tamanho):', decodedPubkey.length);
    console.log('Chave pública decodificada (hex):', decodedPubkey.toString('hex'));

    // Se a assinatura não tiver 64 bytes, provavelmente está em DER, converter para raw
    if (decodedSignature.length !== 64) {
      try {
        const secp256k1 = require('secp256k1');
        decodedSignature = secp256k1.signatureImport(decodedSignature); // agora 64 bytes
        console.log('Assinatura convertida de DER para raw (tamanho):', decodedSignature.length);
        console.log('Assinatura convertida (hex):', decodedSignature.toString('hex'));
      } catch (err) {
        console.error('Erro ao importar assinatura DER para raw:', err);
        return false;
      }
    }

    // Extrair componentes r e s da assinatura
    const r = decodedSignature.slice(0, 32);
    const s = decodedSignature.slice(32, 64);
    console.log('Componente r (hex):', r.toString('hex'));
    console.log('Componente s (hex):', s.toString('hex'));

    // Criar o documento de assinatura exatamente como o Keplr
    const signDoc = {
      chain_id: "",
      account_number: "0",
      sequence: "0",
      fee: {
        amount: [],
        gas: "0"
      },
      msgs: [
        {
          type: "sign/MsgSignData",
          value: {
            signer: signerAddress,
            data: Buffer.from(data).toString('base64')
          }
        }
      ],
      memo: ""
    };

    // Serializar o documento de assinatura
    const serializedSignDoc = serializeSignDoc(signDoc);
    console.log('Documento de assinatura serializado:', serializedSignDoc);

    // Gerar hash do documento serializado
    const hash = sha256(Buffer.from(serializedSignDoc));
    console.log('Hash do documento (hex):', Buffer.from(hash).toString('hex'));

    // Criar objeto de assinatura
    const secp256k1Signature = new Secp256k1Signature(r, s);

    // Validar assinatura usando Secp256k1.verifySignature
    let isValid = false;
    try {
      isValid = await Secp256k1.verifySignature(
        secp256k1Signature,
        Buffer.from(hash),
        decodedPubkey
      );
      console.log('Resultado da validação:', isValid);
    } catch (err) {
      console.error('Erro ao validar assinatura:', err);
      return false;
    }

    if (!isValid) {
      console.log('--- [Falha na validação da assinatura] ---');
      console.log('- Nonce original:', data);
      console.log('- Documento de assinatura:', JSON.stringify(signDoc, null, 2));
      console.log('- Hash:', Buffer.from(hash).toString('hex'));
      console.log('- Assinatura:', signature.signature);
      console.log('- Pubkey:', signature.pub_key.value);
    }
    console.log('--- [Fim da verificação de assinatura] ---');
    return isValid;
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    return false;
  }
}

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
      // Usar o nonce em hex diretamente (sem converter para base64)
      console.log('Nonce em hex:', nonce);
      
      // Verificar se a assinatura é uma string JSON
      let signatureObj;
      try {
        signatureObj = typeof signature === 'string' ? JSON.parse(signature) : signature;
        console.log('Assinatura parseada:', JSON.stringify(signatureObj, null, 2));
      } catch (e) {
        console.error('Erro ao parsear assinatura:', e);
        return res.status(401).json({ message: 'Formato de assinatura inválido' });
      }

      // Validar a assinatura usando nossa implementação
      const isValid = await verifyADR36Signature(
        address,
        nonce,
        signatureObj
      );
      
      if (!isValid) {
        console.error('Assinatura inválida. Detalhes:');
        console.error('- Nonce original:', nonce);
        console.error('- Endereço:', address);
        console.error('- Assinatura:', JSON.stringify(signatureObj, null, 2));
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
      'SELECT * FROM users WHERE wallet_address = $1',
      [address]
    );
    
    // Se não existir, criar um novo usuário
    if (result.rows.length === 0) {
      const email = `${address.substring(0, 8)}@rwa.com`;
      
      result = await pool.query(
        'INSERT INTO users (wallet_address, email) VALUES ($1, $2) RETURNING *',
        [address, email]
      );
    }
    
    const user = result.rows[0];
    
    // Debug para verificar o JWT_SECRET
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    
    // Gerar token JWT com todos os campos obrigatórios
    const payload = {
      id: user.id,
      address: user.wallet_address,
      role: user.role || 'user', // Define role como 'user' se não existir
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24h de validade
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);
    
    res.json({
      token,
      user: {
        id: user.id,
        address: user.wallet_address,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    console.error('Erro no login via wallet:', error);
    res.status(500).json({ message: 'Erro no processamento do login' });
  }
}; 