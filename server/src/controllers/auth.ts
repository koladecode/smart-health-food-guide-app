import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { getSupabaseClient } from '../config/supabase';
import { getSupabaseAdminClient } from '../services/supabase';
import { AuthenticatedRequest, getUserRole } from '../middleware/auth';
import { validateName, validateEmail } from '../utils/validation';

/**
 * Register a brand-new user with Supabase Auth
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    // 1. Authoritative Backend Name Validation
    const nameVal = validateName(name);
    if (!nameVal.valid) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: nameVal.message || 'Please provide a valid name.'
      });
      return;
    }
    const normalizedName = nameVal.trimmed;

    // 2. Authoritative Backend Email Validation
    const emailVal = validateEmail(email);
    if (!emailVal.valid) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: emailVal.message || 'Please provide a valid email address.'
      });
      return;
    }
    const normalizedEmail = emailVal.trimmed;

    // 3. Password Validation
    if (!password || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Please define a password.'
      });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Password must contain at least 6 characters.'
      });
      return;
    }

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
        user_metadata: { role: 'user', full_name: normalizedName, name: normalizedName },
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
          // Strict guard: Render is disconnected and must never be used
          if (!urlObj.hostname.toLowerCase().includes('render.com') && !urlObj.hostname.toLowerCase().includes('onrender.com')) {
            emailRedirectTo = `${urlObj.origin}/`;
          }
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
            role: 'user',
            full_name: normalizedName,
            name: normalizedName
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
    // Canonical Vercel production recovery URL: https://smart-health-food-guide-app.vercel.app/reset-password
    // Note: URL MUST NOT contain '#' (fragment) as RFC 6749 and Supabase GoTrue disallow fragments in redirect_to,
    // which caused Supabase to fall back to the outdated Render Site URL.
    const VERCEL_PRODUCTION_RESET_URL = 'https://smart-health-food-guide-app.vercel.app/reset-password';
    let redirectTo = VERCEL_PRODUCTION_RESET_URL;

    // Optional override for local development or preview environments, while strictly blocking Render
    const candidate = req.body?.redirectTo || req.get('origin') || req.get('referer');
    if (candidate && typeof candidate === 'string') {
      try {
        const urlObj = new URL(candidate);
        const host = urlObj.hostname.toLowerCase();
        // Strict guard: Render is disconnected and must never be used
        if (!host.includes('render.com') && !host.includes('onrender.com')) {
          if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.run.app')) {
            redirectTo = `${urlObj.origin}/reset-password`;
          } else if (host.includes('smart-health-food-guide-app.vercel.app')) {
            redirectTo = VERCEL_PRODUCTION_RESET_URL;
          }
        }
      } catch (e) {
        console.warn('[AUTH_RESET] Could not parse candidate redirect URL:', candidate);
      }
    }

    const supabase = getSupabaseClient();

    // Request Supabase Auth to send reset email with canonical recovery redirect
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
      try {
        const { data: { user }, error: adminUserErr } = await adminSupabase.auth.getUser(accessToken);
        if (!adminUserErr && user) {
          userId = user.id;
        } else {
          const { data: { user: clientUser }, error: clientUserErr } = await supabase.auth.getUser(accessToken);
          if (!clientUserErr && clientUser) {
            userId = clientUser.id;
          }
        }
      } catch (err) {
        console.warn('[AUTH_RESET] getUser exception with accessToken:', err);
      }
    }

    // 2. Try PKCE code exchange if user not yet identified
    if (!userId && code) {
      try {
        const { data: sessionData, error: codeErr } = await supabase.auth.exchangeCodeForSession(code);
        if (!codeErr && sessionData) {
          userId = sessionData.user?.id || (sessionData as any).session?.user?.id || null;
        }
        if (!userId) {
          const { data: adminSessionData, error: adminCodeErr } = await adminSupabase.auth.exchangeCodeForSession(code);
          if (!adminCodeErr && adminSessionData) {
            userId = adminSessionData.user?.id || (adminSessionData as any).session?.user?.id || null;
          }
        }
      } catch (err) {
        console.warn('[AUTH_RESET] exchangeCodeForSession exception with code:', err);
      }
    }

    // 3. Try refresh token session if present
    if (!userId && refreshToken) {
      try {
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
        if (!refreshErr && refreshData) {
          userId = refreshData.user?.id || (refreshData as any).session?.user?.id || null;
        }
      } catch (err) {
        console.warn('[AUTH_RESET] refreshSession exception with refreshToken:', err);
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

