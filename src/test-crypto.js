/**
 * Arquivo de teste para entender a API de verificação de assinaturas do @cosmjs/crypto
 */
const { Secp256k1, sha256 } = require('@cosmjs/crypto');
const { fromBase64 } = require('@cosmjs/encoding');

async function testVerifySignature() {
    try {
        console.log('Testando APIs de verificação de assinaturas do @cosmjs/crypto...');
        
        // Vamos imprimir os métodos disponíveis na classe Secp256k1
        const secp256k1 = new Secp256k1();
        console.log('Métodos disponíveis no objeto Secp256k1:');
        console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(secp256k1)));
        
        // Sample data para testar
        const pubkeyBase64 = 'A7OHCqeb/9whHe+ltpVt1/cilp1oeq5exAG1eB7kVXTF';
        const signatureBase64 = 'ALER7unj9jveu6G8TuwKanjuPVDgTR7sULxeDqR9GsQIf8aXn6oXPIbiww0CRw8422ksp4MrCP7y/nKc8lt4nw==';
        const messageStr = 'test message';
        
        // Preparar dados
        const pubkey = fromBase64(pubkeyBase64);
        const signature = fromBase64(signatureBase64);
        const message = new TextEncoder().encode(messageStr);
        const messageHash = sha256(message);
        
        console.log('Teste 1: Verificando usando verifySignature (se disponível)');
        if (typeof secp256k1.verifySignature === 'function') {
            const result = await secp256k1.verifySignature(signature, messageHash, pubkey);
            console.log('Resultado verifySignature:', result);
        } else {
            console.log('Método verifySignature não disponível!');
        }
        
        console.log('Teste 2: Verificando usando apenas verify (se disponível)');
        if (typeof secp256k1.verify === 'function') {
            const result = await secp256k1.verify(signature, messageHash, pubkey);
            console.log('Resultado verify:', result);
        } else {
            console.log('Método verify não disponível!');
        }
        
        // Explorar a estrutura da classe Secp256k1 para encontrar o método correto
        console.log('Propriedades do objeto Secp256k1:', Object.keys(secp256k1));
        
    } catch (error) {
        console.error('Erro durante teste:', error);
    }
}

testVerifySignature().then(() => {
    console.log('Teste concluído');
}).catch(error => {
    console.error('Erro no teste:', error);
}); 