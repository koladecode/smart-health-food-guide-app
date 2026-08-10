import rawApp from '../dist/app.cjs';

// Gracefully resolve default export across CJS / ESM module interop
const app = typeof rawApp === 'function' ? rawApp : (rawApp as any).default || rawApp;

export default function handler(req: any, res: any) {
  // Extract original requested path from Vercel headers if URL was rewritten to /api
  const forwardedPath = req.headers?.['x-forwarded-uri'] || req.headers?.['x-invoke-path'] || req.headers?.['x-matched-path'];
  
  if (forwardedPath && typeof forwardedPath === 'string' && (req.url === '/api' || req.url === '/api/')) {
    req.url = forwardedPath;
  }

  return app(req, res);
}

