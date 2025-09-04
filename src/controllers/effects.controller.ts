import { BaseController } from 'src/controllers/shared/base.controller';
import { Effect } from 'src/entities/Effect';
import effectsService from 'src/services/effects.service';

export class EffectsController extends BaseController<Effect> {
  // Add 😎
}

export default new EffectsController(effectsService);
