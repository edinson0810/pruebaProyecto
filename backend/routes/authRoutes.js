// backend/routes/authRoutes.js
import express from 'express';
import { loginUsuario, registrarUsuario, refreshToken } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registrarUsuario);

router.post('/login', loginUsuario)

router.post('/resfresh-token', refreshToken)





export default router;



