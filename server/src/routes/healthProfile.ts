import { Router } from 'express';
import { getProfile, createOrUpdateProfile } from '../controllers/healthProfile';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Endpoint paths matching base "/api/profile" mount
router.get('/', requireAuth, getProfile);
router.post('/', requireAuth, createOrUpdateProfile);

export default router;
