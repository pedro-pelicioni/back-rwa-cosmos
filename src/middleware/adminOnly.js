/**
 * Middleware para restrição de acesso apenas para administradores
 * Requer que o middleware walletAuth seja executado antes
 */

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Autenticação necessária' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Acesso proibido. Apenas administradores podem acessar este recurso' 
    });
  }
  
  next();
};

module.exports = adminOnly; 