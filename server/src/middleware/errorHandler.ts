import { Request, Response, NextFunction } from 'express';

/**
 * Custom operational error class for handled errors
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handling Middleware for Express
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;

  // Log error details internally (can be wired to Winston/Morgan in production)
  console.error(`[ERROR] ${req.method} ${req.path} - StatusCode: ${statusCode}`);
  console.error(err.stack);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: isOperational || process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred on the server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
