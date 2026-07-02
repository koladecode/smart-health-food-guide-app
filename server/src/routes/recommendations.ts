import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendations';

const router = Router();

// Endpoint paths matching base "/api/recommendations" mount
router.get('/', getRecommendations);

export default router;
