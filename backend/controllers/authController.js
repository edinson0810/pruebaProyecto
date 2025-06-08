// authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../database.js';
import dotenv from 'dotenv';
dotenv.config();

export const registrarUsuario = async (req, res) => {
   const { nombre, email, password, rol_id } = req.body;

  if (!nombre || !email || !password || !rol_id) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO usuarios (nombre, email, password, rol_id) VALUES (?, ?, ?, ?)',
    [nombre, email, hashedPassword, rol_id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Error al registrar usuario', error: err });

      res.status(201).json({ message: 'Usuario registrado correctamente' });
    }
  );
};

export const loginUsuario = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email y contraseña son obligatorios' });

  db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Error en la base de datos', error: err });

    if (results.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const user = results[0]; // 🔥 Aquí se define user correctamente

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // 🔐 Generar los tokens
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login exitoso',
      accessToken,
      refreshToken,
    });
  });
};
