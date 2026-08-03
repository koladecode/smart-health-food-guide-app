import { Router } from 'express';
import { getSystemStats, clearCache } from '../controllers/admin';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Endpoint paths matching base "/api/admin" mount
router.get('/stats', requireAuth, getSystemStats);
router.post('/cache/clear', requireAuth, clearCache);

export default router;
