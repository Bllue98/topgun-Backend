import { Router } from 'express';

import authRouter from './auth.route';
import usersRouter from './users.route';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);

export default apiRouter;
