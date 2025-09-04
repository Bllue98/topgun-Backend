import { AppDataSource } from 'src/data-source';
import { Talent } from 'src/entities/Talent';

export default AppDataSource.getRepository(Talent).extend({});
