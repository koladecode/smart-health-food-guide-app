import { Router } from 'express';
import { register, login, getMe, logout, forgotPassword, resetPassword } from '../controllers/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Endpoint paths matching base "/api/auth" mount
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', requireAuth, getMe);

export default router;
