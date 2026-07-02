import { Router } from 'express';
import { getSystemStats, clearCache } from '../controllers/admin';

const router = Router();

// Endpoint paths matching base "/api/admin" mount
router.get('/stats', getSystemStats);
router.post('/cache/clear', clearCache);

export default router;
