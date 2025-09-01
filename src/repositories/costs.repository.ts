import { AppDataSource } from 'src/data-source';
import { Cost } from 'src/entities/test/Cost';

export default AppDataSource.getRepository(Cost).extend({});
