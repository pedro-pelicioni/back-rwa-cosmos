const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Verificar diferentes formatos de header de autorização
    const authHeader = req.headers['authorization'] || req.headers['x-access-token'];
    
    console.log('[JWT] Headers recebidos:', req.headers);
    console.log('[JWT] Header de autorização:', authHeader);
    
    if (!authHeader) {
      console.log('[JWT] Header de autorização não encontrado');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Extrair o token do header
    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = authHeader;
    }

    if (!token) {
      console.log('[JWT] Token não encontrado no header');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Verificar se o JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      console.error('[JWT] JWT_SECRET não está definido nas variáveis de ambiente');
      return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }

    console.log('[JWT] Token recebido:', token.substring(0, 20) + '...');
    console.log('[JWT] JWT_SECRET:', process.env.JWT_SECRET ? 'Definido' : 'Não definido');

    // Decodificar o token sem verificar para debug
    const decodedWithoutVerify = jwt.decode(token);
    console.log('[JWT] Payload do token:', decodedWithoutVerify);

    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[JWT] Token verificado com sucesso');
    
    // Adicionar informações do usuário ao request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('[JWT] Erro na validação do token:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido',
        error: error.message 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado',
        error: error.message 
      });
    }
    
    return res.status(401).json({ 
      message: 'Erro na autenticação',
      error: error.message 
    });
  }
}; 