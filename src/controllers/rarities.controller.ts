import { BaseController } from 'src/controllers/shared/base.controller';
import { Rarity } from 'src/entities/Rarity';
import raritiesService from 'src/services/rarities.service';

export class RaritiesController extends BaseController<Rarity> {
  // Add
}

export default new RaritiesController(raritiesService);
