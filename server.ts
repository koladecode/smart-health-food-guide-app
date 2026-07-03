import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environment variables before importing other modules
dotenv.config();

// Now import the configured Express app
import rawApp from './server/src/app';

// Handle both ESM default export and CommonJS/ESM interop wrappers gracefully
const app = typeof rawApp === 'function' ? rawApp : (rawApp as any).default || rawApp;

const PORT = 3000;

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    console.log('[SERVER] Booting Vite in middleware mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    // Mount Vite's dev server middleware
    app.use(vite.middlewares);
  } else {
    console.log('[SERVER] Operating in production mode. Serving static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================`);
    console.log(`🚀 Unified Full-Stack Server running on port ${PORT}`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`================================================`);
  });
}

startServer();
