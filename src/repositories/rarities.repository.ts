import { AppDataSource } from 'src/data-source';
import { Rarity } from 'src/entities/Rarity';

export default AppDataSource.getRepository(Rarity).extend({});
