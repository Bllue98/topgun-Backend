import { Router } from 'express';
import talentsController from 'src/controllers/talent.controller';
import { addCrudOperationsToRouter } from 'src/utils/route.utils';

const talentsRouter = Router();

talentsRouter.get('/random', talentsController.getRandom);
talentsRouter.get('/:id/full', talentsController.getFull);

addCrudOperationsToRouter(talentsRouter, talentsController);

export default talentsRouter;
