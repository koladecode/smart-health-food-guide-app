import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

/**
 * Middleware that requires a valid Supabase Auth JWT token
 */
export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'fail',
        message: 'No authorization token provided. Please sign in.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const supabase = getSupabaseClient();

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired session. Please sign in again.',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      status: 'fail',
      message: `Authentication failed: ${error.message}`,
    });
  }
};
