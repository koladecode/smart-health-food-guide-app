import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../config/supabase';
import { AuthenticatedRequest } from '../middleware/auth';

/**
 * Register a brand-new user with Supabase Auth
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
      return;
    }

    const supabase = getSupabaseClient();

    // Sign up user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      res.status(400).json({
        status: 'fail',
        message: error.message
      });
      return;
    }

    const supabaseUser = data.user;
    if (!supabaseUser) {
      res.status(400).json({
        status: 'fail',
        message: 'Could not complete registration. Please try again.'
      });
      return;
    }

    // Insert user into our public.users table to satisfy DB foreign keys
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: supabaseUser.id,
        email: supabaseUser.email,
      });

    if (dbError) {
      console.error('Error inserting user to public.users table:', dbError);
    }

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          createdAt: supabaseUser.created_at
        },
        session: data.session
      }
    });
  } catch (error) {
    next(error);
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
        status: 'fail',
        message: 'Please provide email and password'
      });
      return;
    }

    const supabase = getSupabaseClient();

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      res.status(401).json({
        status: 'fail',
        message: error.message
      });
      return;
    }

    const supabaseUser = data.user;
    if (!supabaseUser) {
      res.status(401).json({
        status: 'fail',
        message: 'Could not log in. User session is invalid.'
      });
      return;
    }

    // Ensure the user exists in our public.users table (auto-repair missing records)
    const { error: dbError } = await supabase
      .from('users')
      .upsert({
        id: supabaseUser.id,
        email: supabaseUser.email,
      });

    if (dbError) {
      console.error('Error auto-syncing user to public.users on login:', dbError);
    }

    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: {
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          createdAt: supabaseUser.created_at
        },
        session: data.session
      }
    });
  } catch (error) {
    next(error);
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
