import { BaseController } from 'src/controllers/shared/base.controller';
import { Cost } from 'src/entities/test/Cost';
import costService from 'src/services/costs.service';

export class CostController extends BaseController<Cost> {}

export default new CostController(costService);
