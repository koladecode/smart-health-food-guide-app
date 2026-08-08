import express, { Request, Response } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: (origin, callback) => {
    // Dynamically allow any origin requesting with credentials (same-origin, local, preview host)
    callback(null, true);
  },
  credentials: true
}));

// Enable JSON request body parsing
app.use(express.json());

// Enable URL-encoded request body parsing
app.use(express.urlencoded({ extended: true }));

// Central base health-check route (supports /api/health, /health, /api, and /)
app.get(['/api/health', '/health', '/api', '/'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Smart Health & Food Guide API is running'
  });
});

// Temporary ping route for debugging connectivity
app.get(['/api/ping', '/ping'], (req: Request, res: Response) => {
  console.log("PING ENDPOINT HIT");
  res.status(200).json({
    success: true,
    message: "Backend reached"
  });
});

// Mount modular sub-routes under "/api" and root (for Vercel serverless rewrites)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Fallback for any unhandled routes (404 Not Found)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Cannot handle ${req.method} on requested path ${req.originalUrl || req.url || req.path}`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
