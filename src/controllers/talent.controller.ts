import { BaseController } from 'src/controllers/shared/base.controller';
import { Talent } from 'src/entities/Talent';
import talentsService from 'src/services/talents.service';

export class TalentsController extends BaseController<Talent> {
  // Add
}

export const costController = new TalentsController(talentsService);
