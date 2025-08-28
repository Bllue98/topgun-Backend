import { AppDataSource } from 'src/data-source';
import { Effect } from 'src/entities/Effect';

export default AppDataSource.getRepository(Effect).extend({});
