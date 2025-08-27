import { Router } from 'express';

import authRouter from './auth.route';
import usersRouter from './users.route';
import costsRouter from './costs.route';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/costs', costsRouter);

export default apiRouter;
