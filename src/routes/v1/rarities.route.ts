import { Router } from 'express';
import RaritiesController from 'src/controllers/rarities.controller';
import { addCrudOperationsToRouter } from 'src/utils/route.utils';

const raritiesRouter = Router();

addCrudOperationsToRouter(raritiesRouter, RaritiesController);

// Extra operation: reorder by index (kept)
raritiesRouter.post('/reorder', RaritiesController.reorder); // swap by index

export default raritiesRouter;
