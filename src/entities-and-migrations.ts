import { type DataSourceOptions } from 'typeorm';
import config from './config/config';

export type EntitiesAndMigrationsOpts = Pick<DataSourceOptions, 'entities' | 'migrations'>;

const importAllFunctions = (requireContext: __WebpackModuleApi.RequireContext) =>
  requireContext
    .keys()
    .sort()
    .map((filename: string) => {
      const required = requireContext(filename);
      return Object.keys(required).reduce<string[]>((result, exportedKey) => {
        // eslint-disable-next-line security/detect-object-injection
        const exported = required[exportedKey];
        if (typeof exported === 'function') {
          return result.concat(exported);
        }
        return result;
      }, []);
    })
    .flat();

let entities = ['src/entities/**/*.ts']; // Modified to include subdirectories
let migrations = ['src/migrations/*.ts'];
// eslint-disable-next-line @typescript-eslint/dot-notation
const environment = config.nodeEnv;

let seedMigrations = ['src/seeds/*.ts'];

if (environment !== 'development') {
  // Webpack will statically include every .ts or .js file in these folders at build time.
  // The fourth argument ('sync') is redundant but makes the intent explicit.
  entities = importAllFunctions((require as any).context('./entities/', true, /\.(ts|js)$/, 'sync'));
  migrations = importAllFunctions((require as any).context('./migrations/', true, /\.(ts|js)$/, 'sync'));
  seedMigrations = importAllFunctions((require as any).context('./seeds/', true, /\.(ts|js)$/, 'sync'));
}

export const entitiesAndMigrations: EntitiesAndMigrationsOpts & { seedMigrations: EntitiesAndMigrationsOpts['migrations'] } = {
  entities,
  migrations,
  seedMigrations
};
