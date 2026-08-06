/**
 * Safely parse JSON from a fetch Response object.
 * Handles HTML error pages (e.g. Vercel 404/500 pages, reverse proxy errors)
 * gracefully without throwing unhandled SyntaxError "Unexpected token 'T'...".
 */
export async function safeJsonResponse<T = any>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!text || !text.trim()) {
    return {} as T;
  }

  const trimmed = text.trim();
  if (contentType.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(text) as T;
    } catch {
      // Failed to parse despite looking like JSON, fall through to error handling
    }
  }

  // Handle HTML responses (e.g., Vercel static 404 "The page could not be found", server 500 HTML pages)
  if (trimmed.startsWith('<') || trimmed.includes('<!DOCTYPE') || trimmed.includes('The page c')) {
    throw new Error('API endpoint returned HTML instead of JSON. If deployed on Vercel, please check that API rewrites and environment variables are configured.');
  }

  throw new Error(`Server returned non-JSON response: ${trimmed.slice(0, 100)}...`);
}
