import { Requirement } from 'src/entities/Requirement';
import requirementsRepository from 'src/repositories/requirements.repository';
import { BaseService } from 'src/services/shared/base.service';

export class RequirementsService extends BaseService<Requirement> {
  // Add
}

export default new RequirementsService(requirementsRepository, 'id');
