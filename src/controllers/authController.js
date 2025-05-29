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
    console.log('\n=== [INÍCIO DA VERIFICAÇÃO DE ASSINATURA] ===');
    console.log('1. Dados recebidos:');
    console.log('- Signer address:', signerAddress);
    console.log('- Nonce recebido (hex):', data);
    
    // Decodificar assinatura e pubkey
    let decodedSignature = Buffer.from(signature.signature, 'base64');
    const decodedPubkey = Buffer.from(signature.pub_key.value, 'base64');
    
    console.log('\n2. Detalhes da assinatura:');
    console.log('- Assinatura recebida (base64):', signature.signature);
    console.log('- Assinatura decodificada (tamanho):', decodedSignature.length);
    console.log('- Assinatura decodificada (hex):', decodedSignature.toString('hex'));
    console.log('- Assinatura decodificada (bytes):', Array.from(decodedSignature));
    
    console.log('\n3. Detalhes da chave pública:');
    console.log('- Chave pública recebida (base64):', signature.pub_key.value);
    console.log('- Chave pública decodificada (tamanho):', decodedPubkey.length);
    console.log('- Chave pública decodificada (hex):', decodedPubkey.toString('hex'));
    console.log('- Chave pública decodificada (bytes):', Array.from(decodedPubkey));

    // Se a assinatura não tiver 64 bytes, provavelmente está em DER, converter para raw
    if (decodedSignature.length !== 64) {
      try {
        const secp256k1 = require('secp256k1');
        console.log('\n4. Tentando converter assinatura DER para raw:');
        console.log('- Tamanho original:', decodedSignature.length);
        decodedSignature = secp256k1.signatureImport(decodedSignature);
        console.log('- Tamanho após conversão:', decodedSignature.length);
        console.log('- Nova assinatura (hex):', decodedSignature.toString('hex'));
        console.log('- Nova assinatura (bytes):', Array.from(decodedSignature));
      } catch (err) {
        console.error('Erro ao importar assinatura DER para raw:', err);
        return false;
      }
    }

    // Extrair componentes r e s da assinatura
    const r = decodedSignature.slice(0, 32);
    const s = decodedSignature.slice(32, 64);
    console.log('\n5. Componentes da assinatura:');
    console.log('- Componente r (hex):', r.toString('hex'));
    console.log('- Componente r (bytes):', Array.from(r));
    console.log('- Componente s (hex):', s.toString('hex'));
    console.log('- Componente s (bytes):', Array.from(s));

    // Criar a mensagem formatada como no frontend
    const message = `Autenticação RWA - Nonce: ${data}`;
    const messageBase64 = Buffer.from(message).toString('base64');

    // Criar o documento de assinatura no formato ADR-36
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
            data: messageBase64
          }
        }
      ],
      memo: ""
    };

    console.log('\n6. Documento de assinatura:');
    console.log('- Documento completo:', JSON.stringify(signDoc, null, 2));
    console.log('- Tipo da mensagem:', signDoc.msgs[0].type);
    console.log('- Signer:', signDoc.msgs[0].value.signer);
    console.log('- Mensagem original:', message);
    console.log('- Mensagem em base64:', messageBase64);

    // Serializar o documento de assinatura
    const serializedSignDoc = serializeSignDoc(signDoc);
    console.log('\n7. Documento serializado:');
    console.log('- Serializado (bytes):', Array.from(serializedSignDoc));
    console.log('- Serializado (hex):', Buffer.from(serializedSignDoc).toString('hex'));

    // Gerar hash do documento serializado
    const hash = sha256(Buffer.from(serializedSignDoc));
    console.log('\n8. Hash do documento:');
    console.log('- Hash (bytes):', Array.from(hash));
    console.log('- Hash (hex):', Buffer.from(hash).toString('hex'));

    // Criar objeto de assinatura
    const secp256k1Signature = new Secp256k1Signature(r, s);
    console.log('\n9. Objeto de assinatura:');
    console.log('- R (hex):', r.toString('hex'));
    console.log('- S (hex):', s.toString('hex'));

    // Validar assinatura
    let isValid = false;
    try {
      console.log('\n10. Tentativa de validação:');
      console.log('- Hash a ser verificado:', Buffer.from(hash).toString('hex'));
      console.log('- Chave pública usada:', Buffer.from(decodedPubkey).toString('hex'));
      console.log('- Componente R:', r.toString('hex'));
      console.log('- Componente S:', s.toString('hex'));
      
      // Garantir que a chave pública tenha o prefixo 0x03
      let pubkeyToUse = decodedPubkey;
      if (pubkeyToUse[0] !== 0x03) {
        const newPubkey = Buffer.alloc(33);
        newPubkey[0] = 0x03;
        pubkeyToUse.copy(newPubkey, 1, 1);
        pubkeyToUse = newPubkey;
        console.log('\n11. Chave pública ajustada:');
        console.log('- Nova chave pública (hex):', pubkeyToUse.toString('hex'));
      }

      // Tentar validar com a chave pública original
      try {
        isValid = await Secp256k1.verifySignature(
          secp256k1Signature,
          hash,
          pubkeyToUse
        );
        console.log('- Resultado da validação com chave original:', isValid);
      } catch (err) {
        console.error('- Erro ao validar com chave original:', err);
      }

      // Se falhar, tentar com a chave pública sem o prefixo 0x03
      if (!isValid) {
        try {
          const pubkeyWithoutPrefix = pubkeyToUse.slice(1);
          console.log('\n12. Tentativa alternativa com chave pública sem prefixo:');
          console.log('- Chave pública sem prefixo (hex):', pubkeyWithoutPrefix.toString('hex'));
          
          isValid = await Secp256k1.verifySignature(
            secp256k1Signature,
            hash,
            pubkeyWithoutPrefix
          );
          console.log('- Resultado da validação sem prefixo:', isValid);
        } catch (err) {
          console.error('- Erro ao validar sem prefixo:', err);
        }
      }

      // Se ainda falhar, tentar com a chave pública em formato diferente
      if (!isValid) {
        try {
          const pubkeyCompressed = Buffer.from(pubkeyToUse);
          console.log('\n13. Tentativa alternativa com chave pública comprimida:');
          console.log('- Chave pública comprimida (hex):', pubkeyCompressed.toString('hex'));
          
          isValid = await Secp256k1.verifySignature(
            secp256k1Signature,
            hash,
            pubkeyCompressed
          );
          console.log('- Resultado da validação com chave comprimida:', isValid);
        } catch (err) {
          console.error('- Erro ao validar com chave comprimida:', err);
        }
      }
    } catch (err) {
      console.error('- Erro ao validar assinatura:', err);
      console.error('- Stack trace:', err.stack);
      return false;
    }

    if (!isValid) {
      console.log('\n=== [FALHA NA VALIDAÇÃO] ===');
      console.log('Detalhes da falha:');
      console.log('- Nonce original:', data);
      console.log('- Mensagem formatada:', message);
      console.log('- Documento de assinatura:', JSON.stringify(signDoc, null, 2));
      console.log('- Hash:', Buffer.from(hash).toString('hex'));
      console.log('- Assinatura:', signature.signature);
      console.log('- Pubkey:', signature.pub_key.value);
    }

    console.log('\n=== [FIM DA VERIFICAÇÃO DE ASSINATURA] ===\n');
    return isValid;
  } catch (error) {
    console.error('Erro ao verificar assinatura:', error);
    console.error('Stack trace:', error.stack);
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
    console.log('\n=== [INÍCIO DO LOGIN VIA WALLET] ===');
    console.log('1. Dados recebidos na requisição:');
    console.log('- Body completo:', JSON.stringify(req.body, null, 2));
    
    const { address, signature, nonce, pub_key } = req.body;
    
    if (!address || !signature || !nonce) {
      console.error('Dados obrigatórios faltando:');
      console.error('- Address:', address);
      console.error('- Signature:', signature);
      console.error('- Nonce:', nonce);
      return res.status(400).json({ message: 'Endereço, assinatura e nonce são obrigatórios' });
    }
    
    console.log('\n2. Validando nonce:');
    console.log('- Endereço:', address);
    console.log('- Nonce recebido:', nonce);
    
    // Buscar nonce no banco
    const nonceResult = await pool.query(
      'SELECT nonce FROM wallet_nonces WHERE address = $1',
      [address]
    );
    
    if (nonceResult.rows.length === 0) {
      console.error('Nonce não encontrado para o endereço:', address);
      return res.status(400).json({ message: 'Nonce não encontrado ou expirado' });
    }
    
    const storedNonce = nonceResult.rows[0].nonce;
    console.log('- Nonce armazenado:', storedNonce);
    
    if (nonce !== storedNonce) {
      console.error('Nonce inválido:');
      console.error('- Recebido:', nonce);
      console.error('- Armazenado:', storedNonce);
      return res.status(400).json({ message: 'Nonce inválido' });
    }
    
    console.log('\n3. Processando assinatura:');
    // Validar assinatura
    try {
      // Verificar se a assinatura é uma string JSON
      let signatureObj;
      try {
        if (typeof signature === 'string') {
          console.log('Assinatura recebida como string, tentando parsear como JSON');
          // Tenta primeiro como JSON
          try {
            signatureObj = JSON.parse(signature);
            console.log('Assinatura parseada com sucesso como JSON');
          } catch (e) {
            console.log('Assinatura não é JSON válido, usando como string direta');
            // Se não for JSON, assume que é uma string de assinatura direta
            signatureObj = {
              signature: signature,
              pub_key: {
                type: 'tendermint/PubKeySecp256k1',
                value: '' // Será preenchido pelo frontend
              }
            };
          }
        } else {
          console.log('Assinatura recebida como objeto:', typeof signature);
          signatureObj = signature;
        }

        // Log detalhado do objeto de assinatura
        console.log('\n4. Detalhes do objeto de assinatura:');
        console.log('- Objeto completo:', JSON.stringify(signatureObj, null, 2));
        console.log('- Tipo da assinatura:', typeof signatureObj.signature);
        console.log('- Tipo da chave pública:', typeof signatureObj.pub_key);
        console.log('- Valor da chave pública:', signatureObj.pub_key?.value);

        // Processar a chave pública
        console.log('\n5. Processando chave pública:');
        console.log('- pub_key recebido:', JSON.stringify(pub_key, null, 2));

        if (pub_key && pub_key.value) {
          // Se o valor da chave pública for um objeto com bytes
          if (typeof pub_key.value === 'object' && !Array.isArray(pub_key.value)) {
            console.log('Convertendo objeto de bytes para Uint8Array');
            const bytes = Object.values(pub_key.value);
            console.log('- Bytes extraídos:', bytes);
            
            const uint8Array = new Uint8Array(bytes);
            console.log('- Uint8Array criado:', Array.from(uint8Array));
            
            const buffer = Buffer.from(uint8Array);
            console.log('- Buffer criado:', buffer);
            
            const base64PubKey = buffer.toString('base64');
            console.log('- Chave pública em base64:', base64PubKey);
            
            signatureObj.pub_key = {
              type: 'tendermint/PubKeySecp256k1',
              value: base64PubKey
            };
          } else if (typeof pub_key.value === 'string') {
            console.log('Chave pública já está em formato string');
            signatureObj.pub_key = pub_key;
          } else {
            console.log('Formato de chave pública não reconhecido:', typeof pub_key.value);
            return res.status(401).json({ 
              message: 'Formato de chave pública inválido',
              details: 'A chave pública deve ser um objeto com bytes ou string base64'
            });
          }
        }

        // Validar se a chave pública está presente e não vazia
        if (!signatureObj.pub_key || !signatureObj.pub_key.value || signatureObj.pub_key.value.trim() === '') {
          console.error('\n6. Erro: Chave pública não fornecida ou vazia');
          console.error('- Objeto de assinatura:', JSON.stringify(signatureObj, null, 2));
          return res.status(401).json({ 
            message: 'Chave pública não fornecida na assinatura',
            details: 'A chave pública é necessária para validar a assinatura'
          });
        }

        // Validar se a assinatura está presente e não vazia
        if (!signatureObj.signature || signatureObj.signature.trim() === '') {
          console.error('\n7. Erro: Assinatura não fornecida ou vazia');
          console.error('- Objeto de assinatura:', JSON.stringify(signatureObj, null, 2));
          return res.status(401).json({ 
            message: 'Assinatura não fornecida',
            details: 'A assinatura é necessária para autenticação'
          });
        }

        console.log('\n8. Assinatura processada com sucesso:');
        console.log('- Objeto final:', JSON.stringify(signatureObj, null, 2));
      } catch (e) {
        console.error('Erro ao processar assinatura:', e);
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