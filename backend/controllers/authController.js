import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../database.js';

export async function registrarUsuario(req, res) {
  const { nombre, email, password, rol_id } = req.body;
  // Validar que no esté registrado
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error del servidor' });
    if (results.length > 0) return res.status(400).json({ message: 'El usuario ya existe' });

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol_id],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al registrar el usuario' });
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
      }
    );
  });
}



export async function loginUsuario(req, res) {
  const { email, password } = req.body;

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error del servidor' });
    if (results.length === 0) return res.status(401).json({ message: 'Usuario no encontrado' });

    const usuario = results[0];
    const validPassword = await bcrypt.compare(password, usuario.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const accessToken = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET, {
      expiresIn: '15m'
    });

    const refreshToken = jwt.sign({ id: usuario.id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: '7d'
    });

    // Guardar el refreshToken en BD
    db.query('UPDATE usuarios SET refresh_token = ? WHERE id = ?', [refreshToken, usuario.id]);

    res.json({ accessToken, refreshToken });
  });
}



export function refreshToken(req, res) {
  const { token } = req.body;

  if (!token) return res.status(401).json({ message: 'Refresh token requerido' });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Refresh token inválido' });

    db.query('SELECT * FROM usuarios WHERE id = ? AND refresh_token = ?', [decoded.id, token], (err, results) => {
      if (err || results.length === 0) {
        return res.status(403).json({ message: 'Refresh token no encontrado' });
      }

      const nuevoAccessToken = jwt.sign(
        { id: results[0].id, rol: results[0].rol },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.json({ accessToken: nuevoAccessToken });
    });
  });
}
