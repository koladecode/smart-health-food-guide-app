import app from './app';
import { config } from './config';

const PORT = config.port;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================`);
  console.log(`🚀 Smart Health & Food Guide API is fully online!`);
  console.log(`📍 URL: http://0.0.0.0:${PORT}`);
  console.log(`⚙️  Environment: ${config.nodeEnv}`);
  console.log(`================================================`);
});

// Graceful Shutdown routines
const handleShutdown = (signal: string) => {
  console.log(`\n[SHUTDOWN] Received signal: ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    console.log('[SHUTDOWN] Express server closed. Safe connection termination complete.');
    process.exit(0);
  });

  // Force shutdown if connections do not close within 10s
  setTimeout(() => {
    console.error('[SHUTDOWN] Forced shutdown initiated due to pending socket connections.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
