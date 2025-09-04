import { BaseController } from 'src/controllers/shared/base.controller';
import { Tag } from 'src/entities/Tag';
import tagsService from 'src/services/tags.service';

export class TagsController extends BaseController<Tag> {
  // Add custom endpoints here if Cost has domain-specific logic.
}

export const costController = new TagsController(tagsService);
