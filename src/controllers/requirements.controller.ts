import { BaseController } from 'src/controllers/shared/base.controller';
import { Requirement } from 'src/entities/Requirement';
import requirementsService from 'src/services/requirements.service';

export class RequirementController extends BaseController<Requirement> {
  // Add
}

export default new RequirementController(requirementsService);
