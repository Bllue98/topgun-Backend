import { AppDataSource } from 'src/data-source';
import { Tag } from 'src/entities/Tag';

export default AppDataSource.getRepository(Tag).extend({});
