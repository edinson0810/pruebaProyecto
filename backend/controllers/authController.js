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
