import { Router } from 'express';
import CostsController from 'src/controllers/cost.controller';
import { addCrudOperationsToRouter } from 'src/utils/route.utils';

const costsRouter = Router();

addCrudOperationsToRouter(costsRouter, CostsController);

costsRouter.post('/', CostsController.create); // POST /costs
costsRouter.get('/', CostsController.listPaginated); // GET /costs
costsRouter.get('/search', CostsController.search); // GET /costs/search
costsRouter.get('/:id', CostsController.retrieve()); // GET /costs/:id
costsRouter.put('/:id', CostsController.save); // PUT /costs/:id
costsRouter.delete('/:id', CostsController.delete); // DELETE /costs/:id

export default costsRouter;
