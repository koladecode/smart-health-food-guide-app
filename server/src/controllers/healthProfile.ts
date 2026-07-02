import { Request, Response, NextFunction } from 'express';

/**
 * Controller for Health Profile handlers
 */
export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Placeholder: Fetch active profile from database linked to user ID
    res.status(200).json({
      status: 'success',
      data: {
        profile: {
          id: 'profile_placeholder_abc',
          userId: 'user_placeholder_123',
          fullName: 'Jane Doe',
          age: 28,
          weight: 68,
          height: 172,
          activityLevel: 'Moderately Active',
          healthGoal: 'Blood Glucose Regulation',
          healthConditions: ['none'],
          foodAllergies: ['none'],
          dietaryPreference: 'None',
          smokingStatus: 'Never',
          alcoholConsumption: 'Light',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createOrUpdateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profileData = req.body;

    // Placeholder: Validate, then write/update in database
    res.status(200).json({
      status: 'success',
      message: 'Health Profile synchronized successfully (Placeholder)',
      data: {
        profile: {
          id: 'profile_placeholder_abc',
          userId: 'user_placeholder_123',
          ...profileData,
          updatedAt: new Date()
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
