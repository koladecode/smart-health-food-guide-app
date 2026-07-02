import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth';

const router = Router();

// Endpoint paths matching base "/api/auth" mount
router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);

export default router;
