import { BaseController } from 'src/controllers/shared/base.controller';
import { Talent } from 'src/entities/Talent';
import talentsService from 'src/services/talents.service';

export class TalentsController extends BaseController<Talent> {
  // Full graph endpoint

  get getFull() {
    const fullRelations = ['cost', 'effects', 'requirements', 'talentTags', 'rarity'];
    return this.retrieve(fullRelations);
  }
}

export default new TalentsController(talentsService);
