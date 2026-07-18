import { Response, NextFunction } from 'express';
import { RecommendationService } from '../services/recommendationService';
import { HealthProfileService } from '../services/healthProfileService';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Controller for retrieving or generating personalized health and diet recommendations
 */
export const getRecommendations = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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
    console.log('[DEBUG_LOG] [GET_RECOMMENDATIONS] Checking cached recommendations for user:', userId);

    const checkOnly = req.query.check === 'true';

    // 1. Check for cached recommendations
    let recs = await RecommendationService.getRecommendations(userId);

    if (checkOnly) {
      console.log('[DEBUG_LOG] [GET_RECOMMENDATIONS] Check-only request. Recommendations exist:', !!recs);
      res.status(200).json({
        success: true,
        status: 'success',
        exists: !!recs,
        data: recs,
      });
      return;
    }

    if (!recs) {
      console.log('[DEBUG_LOG] [GET_RECOMMENDATIONS] No cached recommendations found. Retrieving health profile for user:', userId);
      // 2. Fetch active health profile to generate suggestions
      const profile = await HealthProfileService.getProfile(userId);
      
      if (!profile) {
        console.warn('[DEBUG_LOG] [GET_RECOMMENDATIONS] Health Profile not found for user:', userId);
        res.status(404).json({
          success: false,
          status: 'fail',
          message: 'Health Profile not found. Please create a profile before generating recommendations.',
        });
        return;
      }

      console.log('[DEBUG_LOG] [GET_RECOMMENDATIONS] Profile found. Generating and saving new recommendations...');
      // 3. Generate and cache recommendations
      recs = await RecommendationService.generateAndSave(userId, profile);
      console.log('[DEBUG_LOG] [GET_RECOMMENDATIONS] Successfully generated and saved recommendations for user:', userId);
    } else {
      console.log('[DEBUG_LOG] [GET_RECOMMENDATIONS] Cached recommendations found in database.');
    }

    console.log('[DEBUG_LOG] [GET_RECOMMENDATIONS] Successfully retrieved recommendations:', !!recs);
    res.status(200).json({
      success: true,
      status: 'success',
      data: recs,
    });
  } catch (error: any) {
    console.error('[DEBUG_LOG] [GET_RECOMMENDATIONS] Error in controller:', error);
    
    // Extract the most detailed Supabase error description possible
    let errMessage = 'Failed to retrieve or generate recommendations';
    if (error) {
      if (typeof error === 'string') {
        errMessage = error;
      } else if (error.message) {
        errMessage = error.message;
        if (error.details) {
          errMessage += ` (Details: ${error.details})`;
        }
        if (error.hint) {
          errMessage += ` (Hint: ${error.hint})`;
        }
        if (error.code) {
          errMessage += ` (Code: ${error.code})`;
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
