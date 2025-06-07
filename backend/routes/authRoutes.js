// backend/routes/authRoutes.js
import express from 'express';
import { registroUsuario } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registrarUsuario);


export default router;



