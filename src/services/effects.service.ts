import { Effect } from 'src/entities/Effect';
import effectsRepository from 'src/repositories/effects.repository';
import { BaseService } from 'src/services/shared/base.service';

export class EffectsService extends BaseService<Effect> {
  // add
}

export default new EffectsService(effectsRepository, 'id');
