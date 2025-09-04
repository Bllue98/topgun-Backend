import { AppDataSource } from 'src/data-source';
import { Requirement } from 'src/entities/Requirement';

export default AppDataSource.getRepository(Requirement).extend({});
