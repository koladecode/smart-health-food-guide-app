import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendations';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Endpoint paths matching base "/api/recommendations" mount
router.get('/', requireAuth, getRecommendations);

export default router;
