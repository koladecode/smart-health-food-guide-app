import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './index';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Lazily retrieves the singleton Supabase client instance.
 * Throws a descriptive error if environment variables are missing.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    let url = config.supabaseUrl;
    const anonKey = config.supabaseAnonKey;

    if (!url) {
      throw new Error('SUPABASE_URL environment variable is required');
    }

    if (!anonKey) {
      throw new Error(
        'SUPABASE_ANON_KEY environment variable is required. Please add it via Settings/Secrets or environment variables.'
      );
    }

    // Sanitize URL to ensure it contains only the project base URL without paths like /rest/v1
    try {
      const parsedUrl = new URL(url);
      url = `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch {
      url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '').trim();
    }

    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: false, // Server environment shouldn't persist session in localStorage
        autoRefreshToken: false,
      },
    });
  }
  return supabaseInstance;
}
