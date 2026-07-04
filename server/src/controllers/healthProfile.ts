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
        success: false,
        status: 'fail',
        message: 'Unauthorized. Please sign in.'
      });
      return;
    }

    const userId = req.user.id;
    const profile = await HealthProfileService.getProfile(userId);
    
    if (!profile) {
      res.status(404).json({
        success: false,
        status: 'fail',
        message: 'Health Profile not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: 'success',
      data: {
        profile
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: 'fail',
      message: error.message || 'Failed to retrieve health profile'
    });
  }
};

/**
 * Controller for creating or updating the active user's Health Profile
 */
export const createOrUpdateProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        status: 'fail',
        message: 'Unauthorized. Please sign in.'
      });
      return;
    }

    const userId = req.user.id;
    const profileData = req.body;

    // Validate Input
    const { fullName, age, height, weight, activityLevel, healthGoal, healthGoals } = profileData;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length === 0) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'A valid Full Name is required.'
      });
      return;
    }

    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge >= 150 || !Number.isInteger(parsedAge)) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Age must be a valid integer between 1 and 149.'
      });
      return;
    }

    const parsedHeight = Number(height);
    if (isNaN(parsedHeight) || parsedHeight <= 30 || parsedHeight >= 300) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Height must be a realistic number between 30 cm and 300 cm.'
      });
      return;
    }

    const parsedWeight = Number(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 5 || parsedWeight >= 500) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Weight must be a realistic number between 5 kg and 500 kg.'
      });
      return;
    }

    const resolvedActivityLevel = activityLevel;
    if (!resolvedActivityLevel || typeof resolvedActivityLevel !== 'string' || resolvedActivityLevel.trim().length === 0) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Activity level is required.'
      });
      return;
    }

    const resolvedHealthGoal = healthGoal || healthGoals;
    if (!resolvedHealthGoal || typeof resolvedHealthGoal !== 'string' || resolvedHealthGoal.trim().length === 0) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Health goal is required.'
      });
      return;
    }

    // Process creation or updates in Supabase
    const existingProfile = await HealthProfileService.getProfile(userId);
    let profile;

    if (existingProfile) {
      profile = await HealthProfileService.updateProfile(userId, profileData);
    } else {
      profile = await HealthProfileService.createProfile(userId, profileData);
    }

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Health Profile synchronized successfully',
      data: {
        profile
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: 'fail',
      message: error.message || 'Failed to synchronize health profile'
    });
  }
};
