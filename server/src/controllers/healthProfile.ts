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
  console.log('[DEBUG_LOG] Received request at POST/PUT /api/profile');
  console.log('[DEBUG_LOG] [REQ_USER_ID_EXISTS] Whether req.user.id exists:', !!(req.user && req.user.id), '- User ID:', req.user?.id);
  console.log('[DEBUG_LOG] [JSON_BODY_RECEIVED] Exact JSON body received by the controller:', JSON.stringify(req.body));
  console.log('[DEBUG_LOG] Incoming request body (formatted):', JSON.stringify(req.body, null, 2));

  try {
    if (!req.user) {
      console.log('[DEBUG_LOG] Unauthorized request: req.user is missing');
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
    console.log('[DEBUG_LOG] Checking if profile exists for userId:', userId);
    const existingProfile = await HealthProfileService.getProfile(userId);
    let profile;

    console.log("PROFILE SAVE REQUEST RECEIVED");
    console.log("User ID:", req.user ? req.user.id : userId);
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    if (existingProfile) {
      console.log('[DEBUG_LOG] Existing profile found. Calling updateProfile() for userId:', userId);
      profile = await HealthProfileService.updateProfile(userId, profileData);
      console.log('[DEBUG_LOG] updateProfile() complete. Returned profile ID:', profile?.id);
    } else {
      console.log('[DEBUG_LOG] No existing profile found. Calling createProfile() for userId:', userId);
      profile = await HealthProfileService.createProfile(userId, profileData);
      console.log('[DEBUG_LOG] createProfile() complete. Returned profile ID:', profile?.id);
    }

    console.log("PROFILE SAVE COMPLETED");
    console.log("Returned Profile:", JSON.stringify(profile, null, 2));

    // Automatically generate and save recommendations to make sure recommendations table is populated
    try {
      console.log('[DEBUG_LOG] Generating and saving updated recommendations for user:', userId);
      await RecommendationService.generateAndSave(userId, profile);
      console.log('[DEBUG_LOG] Recommendations successfully updated and saved in DB.');
    } catch (recError: any) {
      console.error('[DEBUG_LOG] Non-blocking error generating/saving recommendations on profile change:', recError);
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
