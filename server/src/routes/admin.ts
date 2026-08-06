import { Router } from 'express';
import { getSystemStats, clearCache } from '../controllers/admin';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Endpoint paths matching base "/api/admin" mount - protected by Admin middleware
router.use(requireAuth, requireAdmin);

router.get('/stats', getSystemStats);
router.post('/cache/clear', clearCache);

export default router;

