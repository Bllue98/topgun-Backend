import { Rarity } from 'src/entities/Rarity';
import raritiesRepository from 'src/repositories/rarities.repository';
import { BaseService } from 'src/services/shared/base.service';

export class RaritiesService extends BaseService<Rarity> {
  // add
}

export default new RaritiesService(raritiesRepository, 'id');
