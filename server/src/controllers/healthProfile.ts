import { Response, NextFunction } from 'express';
import { HealthProfileService } from '../services/healthProfileService';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Controller for retrieving the active user's Health Profile
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Unauthorized. Please sign in.'
      });
      return;
    }

    const userId = req.user.id;
    const profile = await HealthProfileService.getProfile(userId);
    
    res.status(200).json({
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for creating or updating the active user's Health Profile
 */
export const createOrUpdateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Unauthorized. Please sign in.'
      });
      return;
    }

    const userId = req.user.id;
    const profileData = req.body;

    const existingProfile = await HealthProfileService.getProfile(userId);
    let profile;

    if (existingProfile && existingProfile.id !== 'profile_placeholder_abc') {
      profile = await HealthProfileService.updateProfile(userId, profileData);
    } else {
      profile = await HealthProfileService.createProfile(userId, profileData);
    }

    res.status(200).json({
      status: 'success',
      message: 'Health Profile synchronized successfully',
      data: {
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};
