import { Cost } from 'src/entities/Cost';
import costsRepository from 'src/repositories/costs.repository';
import { BaseService } from 'src/services/shared/base.service';

export class CostService extends BaseService<Cost> {
  // Add Cost-specific business logic here if needed
}

export default new CostService(costsRepository, 'id');
