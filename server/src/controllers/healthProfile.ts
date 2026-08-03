import { Response, NextFunction } from 'express';
import { HealthProfileService } from '../services/healthProfileService';
import { RecommendationService } from '../services/recommendationService';
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

    // Automatically generate and save recommendations to make sure recommendations table is populated
    try {
      await RecommendationService.generateAndSave(userId, profile);
    } catch (recError: any) {
      console.error('Non-blocking error generating/saving recommendations on profile change:', recError);
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
    console.error("ERROR OCCURRED IN PROFILE SAVE (FULL OBJECT):", error);
    console.error('[DEBUG_LOG] Error in createOrUpdateProfile controller:', error);
    
    // Extract the most detailed error description possible
    let errMessage = 'Failed to synchronize health profile';
    if (error) {
      if (typeof error === 'string') {
        errMessage = error;
      } else if (error.message) {
        errMessage = error.message;
        if (error.details) {
          errMessage += ` (${error.details})`;
        }
      } else {
        try {
          errMessage = JSON.stringify(error);
        } catch (e) {
          // ignore
        }
      }
    }

    res.status(500).json({
      success: false,
      status: 'fail',
      message: errMessage
    });
  }
};

/**
 * Deletes the authenticated user's health profile and related clinical data
 */
export const deleteProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        status: 'fail',
        message: 'Unauthorized: User ID missing'
      });
      return;
    }

    await HealthProfileService.deleteProfile(userId);

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Health profile and associated test data deleted successfully.'
    });
  } catch (error: any) {
    console.error('Error in deleteProfile controller:', error);
    res.status(500).json({
      success: false,
      status: 'fail',
      message: error.message || 'Failed to delete health profile'
    });
  }
};
