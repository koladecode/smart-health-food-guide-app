import { Router } from 'express';
import { getProfile, createOrUpdateProfile } from '../controllers/healthProfile';

const router = Router();

// Endpoint paths matching base "/api/profile" mount
router.get('/', getProfile);
router.post('/', createOrUpdateProfile);

export default router;
