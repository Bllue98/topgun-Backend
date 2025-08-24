import { entitiesAndMigrations } from 'src/entities-and-migrations';
import config from './config/config';
import { DataSource } from 'typeorm';

export const SeedingDataSource = new DataSource({
  type: 'mssql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.user,
  password: config.database.password,
  database: config.database.database,
  extra: {
    encrypt: true,
    trustServerCertificate: true,
    requestTimeout: 160000
  },
  migrationsRun: false,
  logging: false,
  entities: entitiesAndMigrations.entities ?? [],
  migrations: entitiesAndMigrations.seedMigrations ?? [],
  subscribers: []
});
