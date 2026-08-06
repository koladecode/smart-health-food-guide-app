import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { getSupabaseAdminClient } from '../services/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

/**
 * Resolves user role from Supabase Auth metadata or public.users table with admin email fallback
 */
export async function getUserRole(userId: string, email?: string): Promise<string> {
  try {
    const adminSupabase = getSupabaseAdminClient();

    // 1. Check Supabase Auth app_metadata and user_metadata
    const { data: authUserData } = await adminSupabase.auth.admin.getUserById(userId);
    if (authUserData?.user) {
      const u = authUserData.user;
      const roleFromMeta = u.app_metadata?.role || u.user_metadata?.role;
      if (roleFromMeta) {
        return roleFromMeta;
      }
    }

    // 2. Check public.users table if role column exists
    const { data: dbUser } = await adminSupabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (dbUser && dbUser.role) {
      return dbUser.role;
    }

    // 3. Fallback check for known admin email
    if (email && email.toLowerCase() === 'akanjicornelius@gmail.com') {
      return 'admin';
    }

    return 'user';
  } catch {
    if (email && email.toLowerCase() === 'akanjicornelius@gmail.com') {
      return 'admin';
    }
    return 'user';
  }
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
        success: false,
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
        success: false,
        status: 'fail',
        message: 'Invalid or expired session. Please sign in again.',
      });
      return;
    }

    if (!user.email_confirmed_at && !user.confirmed_at && user.confirmation_sent_at) {
      res.status(403).json({
        success: false,
        status: 'fail',
        message: 'Please verify your email before signing in.',
      });
      return;
    }

    const role = await getUserRole(user.id, user.email);

    req.user = {
      id: user.id,
      email: user.email,
      role,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      status: 'fail',
      message: `Authentication failed: ${error.message}`,
    });
  }
};

/**
 * Middleware that requires admin role privileges (HTTP 403 if unauthorized)
 */
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        status: 'fail',
        message: 'No authorization token provided. Please sign in.',
      });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        status: 'fail',
        message: 'Forbidden: Admin privileges required.',
      });
      return;
    }

    next();
  } catch (error: any) {
    res.status(403).json({
      success: false,
      status: 'fail',
      message: `Access denied: ${error.message}`,
    });
  }
};

