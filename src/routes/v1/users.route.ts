import { Router } from 'express';
import usersController from 'src/controllers/users.controller';
import { addCrudOperationsToRouter } from 'src/utils/route.utils';

const usersRouter = Router();

addCrudOperationsToRouter(usersRouter, usersController);

export default usersRouter;
