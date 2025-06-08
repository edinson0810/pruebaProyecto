import express from 'express';
import verificarToken from '../middlewares/authMiddlewares.js';

const router = express.Router();

router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    mensaje: 'Ruta protegida accedida exitosamente',
    usuario: req.usuario
  });
});

export default router;