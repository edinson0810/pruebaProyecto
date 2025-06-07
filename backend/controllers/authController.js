// backend/controllers/authController.js
import bcrypt from 'bcryptjs';
import db from '../database.js';

export async function registroUsuario(req, res) {
  const { nombre, email, password, rol_id } = req.body;

  if (!nombre || !email || !password || !rol_id) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  // Verificar si el email ya está registrado
  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en la base de datos' });

    if (results.length > 0) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar nuevo usuario
    db.query(
      'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
      [nombre, email, hashedPassword, rol_id],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al registrar el usuario' });
        res.status(201).json({ message: 'Usuario registrado correctamente' });
      }
    );
  });
}
