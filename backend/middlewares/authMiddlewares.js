import jwt from 'jsonwebtoken';

export function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token requerido' });

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado' });
      }
      return res.status(403).json({ message: 'Token inválido' });
    }

    req.usuario = usuario;
    next();
  });
}
