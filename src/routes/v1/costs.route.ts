import { Router } from 'express';
import CostsController from 'src/controllers/cost.controller';
import { addCrudOperationsToRouter } from 'src/utils/route.utils';

const costsRouter = Router();

addCrudOperationsToRouter(costsRouter, CostsController);

export default costsRouter;
