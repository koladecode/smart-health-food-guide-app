import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { getSupabaseAdminClient } from '../services/supabase';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Register a brand-new user with Supabase Auth
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Please provide email and password'
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();
    const adminSupabase = getSupabaseAdminClient();

    // 1. Pre-check if user already exists in public.users DB table
    const { data: existingDbUser, error: checkError } = await adminSupabase
      .from('users')
      .select('id, email')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing user record:', checkError);
    }

    if (existingDbUser) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'User already exists with this email'
      });
      return;
    }

    // 2. Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password
    });

    if (error) {
      const errorMsg = error.message.toLowerCase();
      const isAlreadyExists = errorMsg.includes('already registered') ||
                              errorMsg.includes('already exists') ||
                              errorMsg.includes('already in use') ||
                              errorMsg.includes('unique constraint');
      res.status(400).json({
        success: false,
        status: 'fail',
        message: isAlreadyExists ? 'User already exists with this email' : error.message
      });
      return;
    }

    const supabaseUser = data.user;
    if (!supabaseUser) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Could not complete registration. Please try again.'
      });
      return;
    }

    // Check if Supabase returned an existing user (Supabase returns identities = [] for pre-existing emails)
    if (supabaseUser.identities && supabaseUser.identities.length === 0) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'User already exists with this email'
      });
      return;
    }

    // Insert new user into our public.users table to satisfy DB foreign keys
    const { error: dbError } = await adminSupabase
      .from('users')
      .upsert({
        id: supabaseUser.id,
        email: supabaseUser.email || normalizedEmail,
      });

    if (dbError) {
      console.error('Error inserting user to public.users table:', dbError);
    }

    // Return success response WITHOUT session or tokens (requiring email verification)
    res.status(201).json({
      success: true,
      status: 'success',
      message: "We've sent a verification email to your inbox. Please verify your email before signing in.",
      data: {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email || normalizedEmail,
          createdAt: supabaseUser.created_at
        }
      }
    });
  } catch (error: any) {
    console.error('Registration exception:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Unexpected server error during registration. Please try again later.'
    });
  }
};

/**
 * Log in an existing user with Supabase Auth
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Please provide email and password'
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = getSupabaseClient();
    const adminSupabase = getSupabaseAdminClient();

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error) {
      const errorMsg = error.message.toLowerCase();
      // Block sign in if email is unconfirmed / unverified
      if (
        errorMsg.includes('email not confirmed') ||
        errorMsg.includes('email_not_confirmed') ||
        errorMsg.includes('not verified')
      ) {
        res.status(403).json({
          success: false,
          status: 'fail',
          message: 'Please verify your email before signing in.'
        });
        return;
      }

      if (errorMsg.includes('invalid login credentials')) {
        res.status(401).json({
          success: false,
          status: 'fail',
          message: 'Invalid email or password.'
        });
        return;
      }

      res.status(401).json({
        success: false,
        status: 'fail',
        message: error.message
      });
      return;
    }

    const supabaseUser = data.user;
    if (!supabaseUser) {
      res.status(401).json({
        success: false,
        status: 'fail',
        message: 'Could not log in. User session is invalid.'
      });
      return;
    }

    // Check email_confirmed_at on user object
    if (!supabaseUser.email_confirmed_at) {
      res.status(403).json({
        success: false,
        status: 'fail',
        message: 'Please verify your email before signing in.'
      });
      return;
    }

    // Ensure the user exists in our public.users table (auto-repair missing records)
    const { error: dbError } = await adminSupabase
      .from('users')
      .upsert({
        id: supabaseUser.id,
        email: supabaseUser.email || normalizedEmail,
      });

    if (dbError) {
      console.error('Error auto-syncing user to public.users on login:', dbError);
    }

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'User logged in successfully',
      data: {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email || normalizedEmail,
          createdAt: supabaseUser.created_at
        },
        session: data.session
      }
    });
  } catch (error: any) {
    console.error('Login exception:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Unexpected server error during login. Please try again later.'
    });
  }
};

/**
 * Retrieve the currently authenticated user's session data
 */
export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'fail',
        message: 'Not logged in'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user (clear active session in Supabase client)
 */
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};
