import { Router } from 'express';
import { getProfile, createOrUpdateProfile, deleteProfile } from '../controllers/healthProfile';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Endpoint paths matching base "/api/profile" mount
router.get('/', requireAuth, getProfile);
router.post('/', requireAuth, createOrUpdateProfile);
router.put('/', requireAuth, createOrUpdateProfile);
router.delete('/', requireAuth, deleteProfile);

export default router;
