import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();
try {
  if (typeof __dirname !== 'undefined') {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
  }
} catch {
  // Ignore fallback if path resolution fails
}

const rawClientUrl = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production' ? 'https://smart-health-food-guide-app.vercel.app' : 'http://localhost:3000');
const sanitizedClientUrl = (rawClientUrl.includes('render.com') || rawClientUrl.includes('onrender.com'))
  ? 'https://smart-health-food-guide-app.vercel.app'
  : rawClientUrl;

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: sanitizedClientUrl,
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_for_dev_mode',
  supabaseUrl: process.env.SUPABASE_URL || 'https://ihplvjaejrqhkiimwapw.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  // Single configuration point for requiring email verification before sign-in
  emailVerificationRequired: process.env.EMAIL_VERIFICATION_REQUIRED !== undefined
    ? process.env.EMAIL_VERIFICATION_REQUIRED === 'true'
    : false,
};
