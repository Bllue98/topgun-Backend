import { Tag } from 'src/entities/Tag';
import tagsRepository from 'src/repositories/tags.repository';
import { BaseService } from 'src/services/shared/base.service';

export class TagsService extends BaseService<Tag> {
  // Add Cost-specific business logic here if needed
}

export default new TagsService(tagsRepository, 'id');
