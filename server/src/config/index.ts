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

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_for_dev_mode',
  supabaseUrl: process.env.SUPABASE_URL || 'https://ihplvjaejrqhkiimwapw.supabase.co',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
};
