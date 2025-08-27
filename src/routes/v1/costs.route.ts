import { Router } from 'express';
import { CostController } from '../../controllers/cost.controller';
import { CostsService } from '../../services/costs.service';
import { CostsRepository } from '../../repositories/costs.repository';
import { AppDataSource } from '../../data-source';

const router = Router();

// build dependencies
const repository = new CostsRepository(AppDataSource);
const service = new CostsService(repository);
const controller = new CostController(service);

// routes
router.get('/', (req, res) => controller.getAll(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));
router.get('/kind/:kind', (req, res) => controller.getByKind(req, res));
router.get('/resource/:resource', (req, res) => controller.getByResource(req, res));

export default router;
