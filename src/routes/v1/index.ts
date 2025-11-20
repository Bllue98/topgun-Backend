import { Router } from 'express';

import authRouter from './auth.route';
import usersRouter from './users.route';
import costsRouter from './costs.route';
import talentsRouter from './talents.route';
import raritiesRouter from './rarities.route';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/costs', costsRouter);
apiRouter.use('/talents', talentsRouter);
apiRouter.use('/rarities', raritiesRouter);

export default apiRouter;
