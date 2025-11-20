import { AppDataSource } from 'src/data-source';
import { Cost } from 'src/entities/Cost';

export default AppDataSource.getRepository(Cost).extend({});
