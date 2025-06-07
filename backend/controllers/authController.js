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

    // Puedes incluir el nombre o rol aquí si lo necesitas
    const accesstoken = jwt.sign({ id: usuario.id, rol: usuario.rol_id }, process.env.JWT_SECRET, {
      expiresIn: '1m'
    });

    const refreshToken = jwt.sign({ id: usuario.id, rol: usuario.rol_id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });


    res.json({ accesstoken, refreshToken });
  });
}

export const refreshToken = async (req, res) => {
  // Asiganmos el token a una variable
  const authHeader = req.headers.authorization;
  try {
    const refreshToken = authHeader.split(" ")[1];
    // Verificamos el token de accesso
    const response = await AuthService.verifyAccessToken(refreshToken);
    // Llamamos el provider para centralizar los mensajes de respuesta
    ResponseProvider.success(
      res,
      response.data,
      response.message,
      response.code
    );
  } catch (error) {
    // Llamamos el provider para centralizar los mensajes de respuesta
    ResponseProvider.error(res, "Error en el servidor", 500);
  }
};

