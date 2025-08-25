import { AppDataSource } from 'src/data-source';
import { User } from 'src/entities/User';

export default AppDataSource.getRepository(User).extend({});
