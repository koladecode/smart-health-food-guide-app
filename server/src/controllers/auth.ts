import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { getSupabaseClient } from '../config/supabase';
import { getSupabaseAdminClient } from '../services/supabase';
import { AuthenticatedRequest, getUserRole } from '../middleware/auth';

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
    let supabaseUser: any = null;

    if (!config.emailVerificationRequired) {
      // Use Admin API to create pre-confirmed user without triggering SMTP email rate limits
      const { data: createData, error: createError } = await adminSupabase.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { role: 'user' },
        app_metadata: { role: 'user' },
      });

      if (createError) {
        const errorMsg = createError.message.toLowerCase();
        const isAlreadyExists = errorMsg.includes('already registered') ||
                                errorMsg.includes('already exists') ||
                                errorMsg.includes('already in use') ||
                                errorMsg.includes('unique constraint');
        res.status(400).json({
          success: false,
          status: 'fail',
          message: isAlreadyExists ? 'User already exists with this email' : createError.message
        });
        return;
      }
      supabaseUser = createData.user;
    } else {
      // Standard sign up flow triggering verification email
      const origin = req.get('origin') || req.get('referer');
      let emailRedirectTo = 'https://smart-health-food-guide-app.vercel.app/';
      if (origin) {
        try {
          const urlObj = new URL(origin);
          emailRedirectTo = `${urlObj.origin}/`;
        } catch (e) {
          console.warn('[AUTH_REGISTER] Could not parse origin for signup redirect URL:', origin);
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo,
          data: {
            role: 'user'
          }
        }
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
      supabaseUser = data.user;
    }

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

    // Explicitly set user_metadata and app_metadata to role = 'user'
    await adminSupabase.auth.admin.updateUserById(supabaseUser.id, {
      user_metadata: { role: 'user' },
      app_metadata: { role: 'user' },
    }).catch(err => console.error('Error setting auth user role metadata:', err));

    // Insert new user into our public.users table with role = 'user'
    const { error: dbError } = await adminSupabase
      .from('users')
      .upsert({
        id: supabaseUser.id,
        email: supabaseUser.email || normalizedEmail,
        role: 'user',
      });

    if (dbError) {
      console.error('Error inserting user to public.users table:', dbError);
    }

    const responseMsg = config.emailVerificationRequired
      ? "We've sent a verification email to your inbox. Please verify your email before signing in."
      : "Registration successful! Account created. You can now sign in with your credentials.";

    // Return success response
    res.status(201).json({
      success: true,
      status: 'success',
      message: responseMsg,
      data: {
        emailVerificationRequired: config.emailVerificationRequired,
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email || normalizedEmail,
          role: 'user',
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
    let { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (error) {
      const errorMsg = error.message.toLowerCase();
      // If email verification is NOT required, but Supabase returned email_not_confirmed,
      // auto-confirm the user via admin API and retry sign-in
      if (
        !config.emailVerificationRequired &&
        (errorMsg.includes('email not confirmed') ||
         errorMsg.includes('email_not_confirmed') ||
         errorMsg.includes('not verified'))
      ) {
        const { data: usersList } = await adminSupabase.auth.admin.listUsers();
        const existingUser = usersList?.users?.find(
          (u: any) => u.email && u.email.toLowerCase() === normalizedEmail
        );
        if (existingUser) {
          await adminSupabase.auth.admin.updateUserById(existingUser.id, {
            email_confirm: true,
          });
          const retryRes = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password
          });
          data = retryRes.data;
          error = retryRes.error;
        }
      }
    }

    if (error) {
      const errorMsg = error.message.toLowerCase();
      // Block sign in if email is unconfirmed / unverified AND verification is required
      if (
        config.emailVerificationRequired &&
        (errorMsg.includes('email not confirmed') ||
         errorMsg.includes('email_not_confirmed') ||
         errorMsg.includes('not verified'))
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

    // Check if email confirmation was sent and user is unconfirmed
    if (config.emailVerificationRequired && !supabaseUser.email_confirmed_at && !supabaseUser.confirmed_at && supabaseUser.confirmation_sent_at) {
      res.status(403).json({
        success: false,
        status: 'fail',
        message: 'Please verify your email before signing in.'
      });
      return;
    }

    // Resolve user role
    const userRole = await getUserRole(supabaseUser.id, supabaseUser.email || normalizedEmail);

    // Ensure the user exists in our public.users table (auto-repair missing records)
    const { error: dbError } = await adminSupabase
      .from('users')
      .upsert({
        id: supabaseUser.id,
        email: supabaseUser.email || normalizedEmail,
        role: userRole,
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
          role: userRole,
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

/**
 * Request password reset email via Supabase Auth
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Please provide a valid email address.'
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Determine the redirect URL for password reset recovery link
    const origin = req.get('origin') || req.get('referer');
    let redirectTo = 'https://smart-health-food-guide-app.vercel.app/#/reset-password';

    if (origin) {
      try {
        const urlObj = new URL(origin);
        redirectTo = `${urlObj.origin}/#/reset-password`;
      } catch (e) {
        console.warn('[AUTH_RESET] Could not parse origin for password reset redirect URL:', origin);
      }
    }

    const supabase = getSupabaseClient();

    // Request Supabase Auth to send reset email
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    });

    if (error) {
      console.error('[AUTH_RESET] Supabase resetPasswordForEmail error:', error);
      if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
        res.status(429).json({
          success: false,
          status: 'fail',
          message: 'Too many password reset requests. Please wait a few minutes before trying again.'
        });
        return;
      }
    }

    // Always return generic success message to avoid leaking user email existence
    res.status(200).json({
      success: true,
      status: 'success',
      message: 'If an account exists with that email address, a password reset link has been sent to your inbox.'
    });
  } catch (error: any) {
    console.error('[AUTH_RESET] Forgot password exception:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'An unexpected server error occurred while requesting password reset.'
    });
  }
};

/**
 * Reset password using recovery session / token
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, code, refreshToken, password } = req.body;

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Password must be at least 6 characters long.'
      });
      return;
    }

    const supabase = getSupabaseClient();
    const adminSupabase = getSupabaseAdminClient();

    let userId: string | null = null;

    // 1. Try resolving user with access token if present
    if (accessToken) {
      const { data: { user }, error: userErr } = await supabase.auth.getUser(accessToken);
      if (!userErr && user) {
        userId = user.id;
      }
    }

    // 2. Try PKCE code exchange if user not yet identified
    if (!userId && code) {
      const { data: sessionData, error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
      if (!codeErr && sessionData?.user) {
        userId = sessionData.user.id;
      }
    }

    // 3. Try refresh token session if present
    if (!userId && refreshToken) {
      const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
      if (!refreshErr && refreshData?.user) {
        userId = refreshData.user.id;
      }
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Invalid or expired password reset link. Please request a new link.'
      });
      return;
    }

    // Update user password in Supabase Auth via Admin client
    const { data: updateData, error: updateErr } = await adminSupabase.auth.admin.updateUserById(userId, {
      password: password,
    });

    if (updateErr) {
      console.error('[AUTH_RESET] Error updating password in Supabase:', updateErr);
      res.status(400).json({
        success: false,
        status: 'fail',
        message: updateErr.message || 'Failed to update password. Please request a new link.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: 'success',
      message: 'Your password has been reset successfully. You can now log in with your new password.'
    });
  } catch (error: any) {
    console.error('[AUTH_RESET] Reset password exception:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'An unexpected server error occurred while resetting password.'
    });
  }
};

