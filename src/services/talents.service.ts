import { Talent } from 'src/entities/Talent';
import talentsRepository from 'src/repositories/talents.repository';
import { BaseService } from 'src/services/shared/base.service';

export class TalentsService extends BaseService<Talent> {
  // Add Cost-specific business logic here if needed
}

export default new TalentsService(talentsRepository, 'id');
