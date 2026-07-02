import { Router } from 'express';
import authRouter from './auth';
import profileRouter from './healthProfile';
import recommendationsRouter from './recommendations';
import adminRouter from './admin';

const apiRouter = Router();

// Register module sub-routers
apiRouter.use('/auth', authRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/recommendations', recommendationsRouter);
apiRouter.use('/admin', adminRouter);

export default apiRouter;
