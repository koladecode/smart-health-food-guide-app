import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseAdminInstance: SupabaseClient | null = null;

/**
 * Lazily retrieves the singleton Supabase service role client instance.
 * Throws a descriptive error if environment variables are missing.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!supabaseAdminInstance) {
    let url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) {
      throw new Error('SUPABASE_URL environment variable is required');
    }

    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    }

    // Sanitize URL to ensure it contains only the project base URL without paths like /rest/v1
    try {
      const parsedUrl = new URL(url);
      url = `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch {
      url = url.replace(/\/rest\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '').trim();
    }

    supabaseAdminInstance = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false, // Server environment shouldn't persist session in localStorage
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAdminInstance;
}
