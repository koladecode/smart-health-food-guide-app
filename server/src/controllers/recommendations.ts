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
        status: 'fail',
        message: 'Unauthorized. Please sign in.'
      });
      return;
    }

    const userId = req.user.id;

    // 1. Check for cached recommendations
    let recs = await RecommendationService.getRecommendations(userId);

    if (!recs) {
      // 2. Fetch active health profile to generate suggestions
      const profile = await HealthProfileService.getProfile(userId);
      
      if (!profile) {
        res.status(404).json({
          status: 'fail',
          message: 'Health Profile not found. Please create a profile before generating recommendations.',
        });
        return;
      }

      // 3. Generate and cache recommendations
      recs = await RecommendationService.generateAndSave(userId, profile);
    }

    res.status(200).json({
      status: 'success',
      data: recs,
    });
  } catch (error) {
    next(error);
  }
};
